const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

const GENDER = Object.freeze({
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
});

const userSchema = new Schema(
  {
    // Required fields
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 30,
      match: /^[a-zA-Z\s]+$/,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 30,
      match: /^[a-zA-Z\s]+$/,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 1,
      maxLength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minLength: 5,
      maxLength: 50,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      immutable: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      select: false,
    },

    // Non required fields that user can leave empty
    middleName: {
      type: String,
      trim: true,
      maxLength: 30,
      match: /^[a-zA-Z\s]+$/,
    },
    maidenName: {
      type: String,
      trim: true,
      minLength: 2,
      maxLength: 30,
      match: /^[a-zA-Z\s]+$/,
    },
    phone: { type: String, trim: true, maxLength: 13 },
    birthDate: {
      type: Date,
      validate: {
        validator: (value) => {
          return value < new Date().setFullYear(new Date().getFullYear() - 12);
        },
        message: "Birthdate needs to be at least 12 years in the past.",
      },
    },
    // age: { type: Number, min: 12, max: 130 },
    gender: { type: String, enum: Object.values(GENDER) },
    image: {
      type: String,
      trim: true,
      default: "https://dummyjson.com/image/130x200",
    },
    bloodGroup: { type: String, maxLength: 5 },
    address: {
      address: { type: String, maxLength: 130 },
      landMark: { type: String, maxLength: 30 },
      locality: { type: String, maxLength: 30 },
      city: { type: String, maxLength: 30 },
      state: { type: String, maxLength: 30 },
      stateCode: { type: String, maxLength: 2 },
      pin: { type: String, maxLength: 6 },
      coordinates: {
        lat: { type: String },
        lng: { type: String },
      },
      country: { type: String, maxLength: 30 },
    },
    company: {
      name: { type: String, maxLength: 50 },
      title: { type: String, maxLength: 30 },
    },
    ip: { type: String },
  },
  { timestamps: true }
);

// hash password before saving
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next(); // scince i have made a change to password, express double check if the field has been modified, if modified it will go ahead and hash the field...if not it move on to next...
    const saltRounds = 11;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (err) {
    next(err);
  }
});

// compare password while authenticating user which translates roughly to check if the user is actual who he says he is.
userSchema.methods.comparePassword = function (passwordEnteredByUser) {
  return bcrypt.compare(passwordEnteredByUser, this.password);
};

const UserModel = mongoose.model("User", userSchema); // creating our schema model

module.exports = { User: UserModel };
