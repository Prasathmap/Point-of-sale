const mongoose = require('mongoose');

const goodSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  title: { type: String, required: true },
  variantId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product.variants'
  },
  variant: { type: String },
  receivedCount: { type: Number, required: true },
  handInCount: { type: Number, required: true }, 
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "pos",
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Good", goodSchema);
