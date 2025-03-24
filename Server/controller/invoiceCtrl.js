const Invoice = require("../models/Invoice.js");
const Attender = require("../models/attenderModel");
const asyncHandler = require("express-async-handler");

async function getNextInvoiceNumber() {
  const lastInvoice = await Invoice.findOne().sort({ invoiceno: -1 });
  let nextInvoiceNumber = 1;

  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceno.split("-")[1]);
    nextInvoiceNumber = lastNumber + 1;
  }

  return `MDU-${nextInvoiceNumber.toString().padStart(4, "0")}`;
}

const InvoiceNumber  = asyncHandler(async (req, res) => {
  try {
    const invoiceno = await getNextInvoiceNumber();
    res.status(200).json({ invoiceno });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const createInvoice = asyncHandler(async (req, res) => {
  try {
    const attenderId = req.user.id; // Assuming req.user contains the logged-in user's details

    // Check if the attender exists
    const attender = await Attender.findById(attenderId);
    if (!attender) {
      return res.status(404).json({ message: "Attender not found" });
    }

    // Generate the next invoice number
    const invoiceNo = await getNextInvoiceNumber();

    // Create the invoice
    const newInvoice = new Invoice({
      ...req.body,
      invoiceno: invoiceNo,
      createdBy: attenderId, // Associate the invoice with the attender
    });

    // Save the invoice to the database
    const savedInvoice = await newInvoice.save();

    // Respond with the created invoice
    res.status(201).json(savedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const getAllInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find();
  if (!invoices.length) {
    return res.status(404).json({ message: "No invoices found" });
  }
  res.status(200).json(invoices);
});

// Get a single invoice by ID
const getInvoiceById = asyncHandler(async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an invoice by ID
const updateInvoice = asyncHandler(async (req, res) => {
  try {
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(200).json(updatedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an invoice by ID
const deleteInvoice = asyncHandler(async (req, res) => {
  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!deletedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Helper function to get the next invoice number

const calculateRemainingBalance = (GrandtotalAmount, paymentMethods) => {
  const totalPaid = paymentMethods
    .filter((payment) => payment.amount && payment.amount > 0)
    .reduce((sum, payment) => sum + payment.amount, 0);

  return GrandtotalAmount - totalPaid;
};

const getMonthWiseOrderIncome = asyncHandler(async (req, res) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 11);
  startDate.setDate(1);

  const data = await Invoice.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: new Date() },
      },
    },
    {
      $project: {
        month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        GrandtotalAmount: 1,
      },
    },
    {
      $group: {
        _id: "$month",
        GrandtotalAmount: { $sum: "$GrandtotalAmount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } }, // Sort by month ascending
  ]);

  res.json(data);
});

const getYearlyTotalOrder = asyncHandler(async (req, res) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 11);  // 11 months ago
  startDate.setDate(1);  // First day of the month

  // Aggregate invoices by year and month
  const data = await Invoice.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: new Date() },
      },
    },
    {
      $project: {
        year: { $year: "$createdAt" },  // Extract year
        month: { $month: "$createdAt" },  // Extract month
        GrandtotalAmount: 1,
      },
    },
    {
      $group: {
        _id: { year: "$year", month: "$month" },  // Group by year and month
        GrandtotalAmount: { $sum: "$GrandtotalAmount" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },  // Sort by year and month
    },
  ]);

  // Return the result
  res.json(data);
});
const getTodayData = asyncHandler(async (req, res) => {
  try {
    const today = new Date();
    const numberOfDays = 7;
    let earningsData = [];

    for (let i = 0; i < numberOfDays; i++) {
      const currentDate = new Date();
      currentDate.setDate(today.getDate() - i);
      const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

      // Aggregate data for the day
      const dailyData = await Invoice.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lt: endOfDay },
          },
        },
        {
          $unwind: "$paymentMethods", // Break paymentMethods array into separate documents
        },
        {
          $group: {
            _id: "$paymentMethods.method", // Group by payment method type
            totalAmount: { $sum: "$paymentMethods.amount" }, // Sum of payments per method
          },
        },
      ]);

      // Create a payment summary object
      let paymentSummary = {
        Cash: 0,
        CreditCard: 0,
        OnlinePay: 0,
        Rupay: 0,
      };

      // Populate summary with actual values from aggregation
      dailyData.forEach((payment) => {
        paymentSummary[payment._id] = payment.totalAmount;
      });

      // Fetch total earnings and invoice count
      const totals = await Invoice.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lt: endOfDay },
          },
        },
        {
          $group: {
            _id: null,
            GrandtotalAmount: { $sum: "$GrandtotalAmount" },
            count: { $count: {} },
          },
        },
      ]);

      earningsData.push({
        date: currentDate.toISOString().split("T")[0],
        earnings: totals[0]?.GrandtotalAmount || 0,
        invoiceCount: totals[0]?.count || 0,
        paymentSummary,
      });
    }

    res.json(earningsData);
  } catch (error) {
    console.error("Error fetching daily earnings:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = {
  InvoiceNumber,
  createInvoice,
  getAllInvoices,
  updateInvoice,
  deleteInvoice,
  getInvoiceById,
  getMonthWiseOrderIncome,
  getYearlyTotalOrder,
  getTodayData,
};
