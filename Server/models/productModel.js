const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    subcategory: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      default: "own",
    },
    unit: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
    },
    images: [
      {
        public_id: String,
        url: String,
      },
    ],
    variants: [
      {
        variant: { type: String, required: true }, 
        mrp: { type: Number, required: true },
        price: { type: Number, required: true },
        tax: { type: Number, required: true },
        taxprice: { type: Number, required: true },
        cgst: { type: Number, required: true },
        cgstprice: { type: Number, required: true },
        sgst: { type: Number, required: true },
        sgstprice: { type: Number, required: true },
        status: {type: Boolean,default: true },
      },
    ],
  },
  { timestamps: true }
);

// Unique index on title and createdBy
productSchema.index({ title: 1, createdBy: 1 }, { unique: true });

// Export the model
module.exports = mongoose.model("Product", productSchema);
