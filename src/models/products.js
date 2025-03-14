const mongoose = require("mongoose");
const { Schema } = mongoose;
const productsSchema = new Schema(
  {
    id: { type: Number },
    title: { type: String },
    description: { type: String },
    category: { type: String },
    price: { type: Number },
    discountPercentage: { type: Number },
    rating: { type: Number },
    stock: { type: Number },
    tags: [String],
    brand: { type: String },
    sku: { type: String },
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
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      barcode: { type: String },
      qrCode: { type: String },
    },
    images: [String],
    thumbnail: { type: String },
  },
  { timestamps: true }
);
const Products = mongoose.model("Products", productsSchema);
module.exports = Products;
