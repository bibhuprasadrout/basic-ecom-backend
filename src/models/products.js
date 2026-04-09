const mongoose = require("mongoose");
const { Schema } = mongoose;
/* Explanation: This file defines the Product data model using Mongoose. A “model” in Mongoose has two layers: a Schema and a Model. The Schema describes the shape of documents (fields, types, validations, defaults), and the Model is the compiled class you use to query and write data (`Product.find()`, `new Product()`, etc.). This schema maps directly to a MongoDB collection; each document corresponds to one product record in your store. */
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
/* Explanation: `timestamps: true` automatically adds `createdAt` and `updatedAt` fields, which is useful for audit and debugging. The `mongoose.model("Products", ...)` call compiles the schema into a model and also determines the collection name (Mongoose pluralizes by default, but you already used a plural string). Exporting `{ Product: ProductModel }` standardizes how other modules import the model (`const { Product } = require("../models/products")`). A future improvement could include stronger validation (required fields, min/max for numeric fields) and indexes for frequently queried fields (category, price, discount). */
