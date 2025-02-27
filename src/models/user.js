const mongoose = require("mongoose");
const crypto = require("crypto");
const { Schema } = mongoose;
const GENDER = Object.freeze({
  MALE: 0,
  FEMALE: 1,
  OTHER: 2,
});
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      match: /^[a-zA-Z\s]+$/,
    },
    middleName: { type: String, trim: true, match: /^[a-zA-Z\s]+$/ },
    lastName: {
      type: String,
      required: true,
      trim: true,
      match: /^[a-zA-Z\s]+$/,
    },
    maidenName: { type: String, trim: true, match: /^[a-zA-Z\s]+$/ },
    age: { type: Number, required: true, min: 12, max: 130 },
    gender: { type: String },
    // gender: { type: Number, enum: Object.values(GENDER), required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minLength: 7,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      immutable: true,
    },
    phone: { type: String, trim: true },
    address: {
      address: { type: String, required: true },
      //   Landmark: { type: String, required: true },
      //   Locality: { type: String, required: true },
      Landmark: { type: String },
      Locality: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      stateCode: { type: String, required: true },
      postalCode: { type: String },
      coordinates: {
        lat: { type: mongoose.Decimal128 },
        lng: { type: mongoose.Decimal128 },
      },
      country: { type: String, required: true },
    },
    username: {
      type: String,
      trim: true,
      required: true,
      minLength: 1,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 8,
      maxLength: 128,
      //   select: false,
    },
    birthDate: {
      type: Date,
      validate: {
        validator: (value) => {
          return value < new Date().setFullYear(new Date().getFullYear() - 12);
        },
        message: "Birthdate needs to be at least 12 years in the past.",
      },
    },
    image: {
      type: String,
      trim: true,
      default: "https://dummyjson.com/image/130x200",
    },
    bloodGroup: { type: String },
    height: { type: Number },
    weight: { type: Number },
    salt: { type: String },
    id: { type: Number, select: false },
    eyeColor: { type: String, select: false },
    hair: {
      color: { type: String, select: false },
      type: { type: String, select: false },
    },
    ip: { type: String, select: false },

    macAddress: { type: String, select: false },
    university: { type: String, select: false },
    bank: {
      cardExpire: { type: String, select: false },
      cardNumber: { type: String, select: false },
      cardType: { type: String, select: false },
      currency: { type: String, select: false },
      iban: { type: String, select: false },
    },
    company: {
      department: { type: String, select: false },
      name: { type: String, select: false },
      title: { type: String, select: false },
      address: {
        address: { type: String, select: false },
        city: { type: String, select: false },
        state: { type: String, select: false },
        stateCode: { type: String, select: false },
        postalCode: { type: String, select: false },
        coordinates: {
          lat: { type: mongoose.Decimal128, select: false },
          lng: { type: mongoose.Decimal128, select: false },
        },
        country: { type: String, select: false },
      },
    },
    ein: { type: String, select: false },
    ssn: { type: String, select: false },
    userAgent: { type: String, select: false },
    crypto: {
      coin: { type: String, select: false },
      wallet: { type: String, select: false },
      network: { type: String, select: false },
    },
    role: { type: String, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.salt = crypto.randomBytes(16).toString("hex");

  this.password = crypto
    .pbkdf2Sync(this.password, this.salt, 10000, 64, "sha512")
    .toString("hex");
  next();
});

userSchema.methods.comparePassword = function (enteredPassword) {
  const hashPassword = crypto
    .pbkdf2Sync(enteredPassword, this.salt, 10000, 64, "sha512")
    .toString("hex");

  return this.password === hashPassword;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
