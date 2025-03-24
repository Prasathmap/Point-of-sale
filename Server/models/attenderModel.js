const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var attenderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    empcode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
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

//Export the model
module.exports = mongoose.model("Attender", attenderSchema);
