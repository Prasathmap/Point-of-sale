const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  grnno: { type: String,required: true  },
  type: { type: String, enum: ['purchase', 'adjustment'], required: true },
  Suppliernote: { type: String},
  Supplier: {type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'cancelled', 'rejected'],
    default: 'pending',
    required: true 
  },
  Receivernote: { type: String},
  items: [{
    productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
   title: {
    type: String,
    required: true
  },
   category: {
    type: String,
    required: true
  },
  subcategory: {
    type: String,
    required: true
  },
  variants: [{
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product.variants',
    },
  variant: String,
  mrp: Number,
  price: Number,
  tax: Number,
  taxprice: Number,
  cgst: Number,
  cgstprice: Number,
  sgst: Number,
  sgstprice: Number,
}],
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
    barcode: {
    type: String,
    required: true
    },
}
  ],
  groupedTaxSummary: [
    {
    taxRate: { type: String, required: true },
    cgst: { type: Number, required: true },
    sgst: { type: Number, required: true },
    cgstprice: { type: Number, required: true },
    sgstprice: { type: Number, required: true },
    totalTaxAmount: { type: Number, required: true },
      }
       
    ],
    taxprice: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "grn",
    required: true 
  },

},{ timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
