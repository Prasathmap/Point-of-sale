const mongoose = require("mongoose");

const InvoiceSchema = mongoose.Schema(
  {
    invoiceno: { type: String, required: true },
    customerName: { type: String, default: 'user' },
    customerPhoneNumber: { type: Number, default: '9876543210' },
    paymentMethods: [
      {
        method: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ], 
    attender: { type: String, required: true },   
    cartItems: { type: Array, required: true },
    cartItemsCount: { type: Number, required: true }, 
    subTotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    remainingBalance: { type: Number, default: 0 },  
    roundOffamount: { type: Number, default: 0 }, 
    GrandtotalAmount: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const Invoice = mongoose.model("invoices", InvoiceSchema);

module.exports = Invoice;
