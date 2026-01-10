const mongoose = require("mongoose");
const { Schema } = mongoose;
const productSchema = new Schema(
  {
    id: { type: Number },
    sku: { type: String, required: true, unique: true },
    title: { type: String, required: true, unique: true },
    description: { type: String },
    category: { type: String },
    price: { type: Number },
    discountPercentage: { type: Number },
    rating: { type: Number },
    stock: { type: Number },
    tags: [String],
    brand: { type: String },
    weight: { type: Number },
    dimensions: {
      width: { type: Number },
      height: { type: Number },
      depth: { type: Number },
    },
    warrantyInformation: { type: String },
    shippingInformation: { type: String },
    availabilityStatus: { type: String },
    returnPolicy: { type: String },
    minimumOrderQuantity: { type: Number },
    meta: {
      barcode: { type: String },
      qrCode: { type: String },
    },
    images: [String],
    thumbnail: { type: String },
  },
  { timestamps: true }
);
const ProductModel = mongoose.model("Products", productSchema);
module.exports = { Product: ProductModel };
