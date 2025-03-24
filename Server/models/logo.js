const mongoose = require("mongoose");

const logoSchema = new mongoose.Schema({
  fileName: { type: String, required: true },

},
{
    timestamps: true,
}
);

module.exports = mongoose.model("logo", logoSchema);
