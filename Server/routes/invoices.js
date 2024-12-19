const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice.js");
const moment = require('moment');

// Function to get the next invoice number based on the last invoice number
async function getNextInvoiceNumber() {
  const lastInvoice = await Invoice.findOne().sort({ invoiceno: -1 }); // Get the most recent invoice

  let nextInvoiceNumber = 1; // Default to 1 if no invoices exist

  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceno.split("-")[1]);
    nextInvoiceNumber = lastNumber + 1;
  }

  return `MDU-${nextInvoiceNumber.toString().padStart(4, '0')}`; // E.g., MDU-0001, MDU-0002, etc.
}

const calculateRemainingBalance = (GrandtotalAmount, paymentMethods) => {
  const totalPaid = paymentMethods
    .filter((payment) => payment.amount && payment.amount > 0) // Only consider valid payments
    .reduce((sum, payment) => sum + payment.amount, 0);

  return GrandtotalAmount - totalPaid;
};

router.post("/add-invoice", async (req, res) => {
  try {
    const {
      customerName,
      customerPhoneNumber,
      paymentMethods,
      cartItems,
      subTotal,
      discount,
    } = req.body;

    // Validate required fields
    if (!paymentMethods || !cartItems || !subTotal ) {
      return res
        .status(400)
        .json({ error: "All required fields (paymentMethods, cartItems, subTotal) must be provided." });
    }

    // Validate payment methods
    const validPayment = paymentMethods.some((payment) => payment.amount && payment.amount > 0);
    if (!validPayment) {
      return res
        .status(400)
        .json({ error: "At least one payment method must have an amount greater than 0." });
    }

    // Generate the next invoice number
    const invoiceno = await getNextInvoiceNumber();

// Calculate the expected total amount
const ExpectTotalAmount = subTotal;

// Round total amount and calculate the rounded total
const GrandtotalAmount = Math.ceil(ExpectTotalAmount);

// Calculate the round-off amount
const roundOffamount = GrandtotalAmount - ExpectTotalAmount;

// Calculate remaining balance
const remainingBalance = calculateRemainingBalance(GrandtotalAmount, paymentMethods);
    

    // Calculate the count of items in the cart
    const cartItemsCount = cartItems.reduce((count, item) => count + (item.quantity || 1), 0);

    // Create a new invoice document
    const invoice = new Invoice({
      customerName,
      customerPhoneNumber,
      paymentMethods: paymentMethods.filter((payment) => payment.amount && payment.amount > 0), // Filter invalid payments
      cartItems,
      cartItemsCount, // Store the count of items in the cart
      subTotal,
      discount: discount || 0, // Default discount to 0
      ExpectTotalAmount,
      invoiceno,
      remainingBalance,
      roundOffamount,
      GrandtotalAmount,
    });

    // Save the invoice to the database
    await invoice.save();

    res.status(201).json({
      message: "Invoice created successfully",
      invoice: invoice,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ error: "An error occurred while creating the invoice" });
  }
});


// Route to get all invoices
router.get("/get-all", async (req, res) => {
  try {
    const invoices = await Invoice.find();
    if (!invoices.length) {
      return res.status(404).json({ message: "No invoices found" });
    }
    res.status(200).json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching invoices" });
  }
});

router.get('/daily', async (req, res) => {
  try {
    // Get the current date
    const today = new Date();
    const numberOfDays = 7;
    let earningsData = [];

    // Loop over the last `numberOfDays` days
    for (let i = 0; i < numberOfDays; i++) {
      // Calculate the date for the day being processed
      const currentDate = new Date();
      currentDate.setDate(today.getDate() - i);
      const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

      // Fetch earnings and invoice count for the current day
      const dailyData = await Invoice.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lt: endOfDay },
          },
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: "$GrandtotalAmount" },
            invoiceCount: { $count: {} },
          },
        },
      ]);

      // Add the earnings data and invoice count to the result array
      earningsData.push({
        date: currentDate.toISOString().split('T')[0], // Ensure it's in YYYY-MM-DD format
        earnings: dailyData[0]?.totalEarnings || 0,
        invoiceCount: dailyData[0]?.invoiceCount || 0,
      });
      
    }

    // Prepare the response
    res.json(earningsData);
    console.log("Earnings data for today:", earningsData);
  } catch (error) {
    console.error("Error fetching daily earnings:", error);
    res.status(500).send("Server Error");
  }
});

router.get('/weekly', async (req, res) => {
  try {
    const today = new Date();

    // Get the start of the week (Monday)
    const startOfWeek = new Date(today);
    const day = today.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1; // Adjust Sunday (0) to calculate as the last day
    startOfWeek.setDate(today.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get the end of the week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Fetch weekly earnings
    const weeklyEarnings = await Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfWeek, $lt: endOfWeek },
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$GrandtotalAmount" },
        },
      },
    ]);

    // Get the start of the month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Fetch monthly earnings grouped by week
    const monthlyEarnings = await Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lt: endOfWeek }, // Include all weeks in the current month
        },
      },
      {
        $group: {
          _id: {
            week: { $week: "$createdAt" }, // Group by week number
          },
          totalEarnings: { $sum: "$GrandtotalAmount" },
        },
      },
      {
        $sort: { "_id.week": 1 }, // Sort weeks in ascending order
      },
    ]);

    res.json({
      weekly: weeklyEarnings[0]?.totalEarnings || 0,
      monthly: monthlyEarnings.map((item) => ({
        week: item._id.week,
        totalEarnings: item.totalEarnings,
      })),
    });
  } catch (error) {
    console.error("Error fetching weekly earnings:", error);
    res.status(500).send("Server Error");
  }
});

router.get('/monthly', async (req, res) => {
  try {
    const today = new Date();

    // Get the start of the month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get the end of the month
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Fetch monthly earnings
    const monthlyEarnings = await Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lt: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$GrandtotalAmount" },
        },
      },
    ]);

    res.json(monthlyEarnings[0] || { totalEarnings: 0 });
  } catch (error) {
    console.error("Error fetching monthly earnings:", error);
    res.status(500).send("Server Error");
  }
});
router.get("/latest", async (req, res) => {
  try {
    const latestInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    if (!latestInvoice) {
      return res.status(404).json({ error: "No invoices found" });
    }
    res.json(latestInvoice);
  } catch (error) {
    console.error("Error fetching latest invoice:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;