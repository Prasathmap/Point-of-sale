const mongoose = require("mongoose");

const CategorySchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    subcategories: [
      {
        title: { type: String, required: true },
      },
    ],
    createdBy: { 
          type: mongoose.Schema.Types.ObjectId,
          ref: "admin", 
          required: true 
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("categories", CategorySchema);

module.exports = Category;
