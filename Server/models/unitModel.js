const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var unitSchema = new mongoose.Schema(
  {
    title: {
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
module.exports = mongoose.model("Unit", unitSchema);
