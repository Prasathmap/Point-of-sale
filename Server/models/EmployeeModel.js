const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var employeeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    empcode: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    status: {
      type: Boolean,
      default: true,
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
employeeSchema.index({ empcode: 1, createdBy: 1 }, { unique: true });
employeeSchema.index({ phone: 1, createdBy: 1 }, { unique: true });

//Export the model
module.exports = mongoose.model("employee", employeeSchema);
