const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
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
      default:"own",
    },
    tax: {
      type: Number,
      required: true,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin", 
      required: true 
    }, 
    images: [
      {
        public_id: String,
        url: String,
      },
    ],
  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("Product", productSchema);
