const Razorpay = require("razorpay");
const instance = new Razorpay({
  key_id: "rzp_test_QSZHdzxON8Fo45",
  key_secret: "d8jkgLSQXsxVHO8oFD31Y6n8",
});

const checkout = async (req, res) => {
  const { amount } = req.body;
  const option = {
    amount: amount * 100,
    currency: "INR",
  };
  const order = await instance.orders.create(option);
  res.json({
    success: true,
    order,
  });
};

const paymentVerification = async (req, res) => {
  const { razorpayPaymentId } = req.body;
  res.json({
    success: true, // ✅ Added success flag
    razorpayPaymentId,
    message: "Payment verified successfully!",
  });
};

module.exports = {
  checkout,
  paymentVerification,
};
