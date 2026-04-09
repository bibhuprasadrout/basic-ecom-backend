const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;
/* Explanation: This file defines the User model, including validations and password security. The User model is central to authentication and authorization. It stores identity fields (name, email, username) and optional profile fields (address, gender, birthdate, etc.).It also demonstrates an important security architecture rule: passwords should never be stored as plain text. Instead, they must be hashed using a slow, one-way hashing algorithm like bcrypt. That is why bcrypt is imported and used in a pre-save hook and a compare method. */

const GENDER = Object.freeze({
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
});
/* Explanation: `Object.freeze` creates an immutable enum-like object for allowed gender values. This is a JavaScript-level guard that prevents accidental mutation of the enum. The schema later uses `enum: Object.values(GENDER)` so Mongoose enforces that only these values can be stored. This is a data integrity pattern: keep allowed values centralized so UI and API stay consistent. */

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
/* Explanation: The schema definition is a contract for your users collection. Each field can declare type, required-ness, trimming, min/max length, regex match, uniqueness, etc. Some important details: `unique: true` on email/username signals Mongoose to create a unique index (but you should ensure indexes actually exist in MongoDB). `immutable: true` on email means once set, it cannot be changed via updates, which prevents account takeover via email change if your system keys off email. `select: false` on password means it is excluded from query results unless explicitly requested (`.select("+password")`), reducing accidental leakage. Validations like regex for names/email ensure only expected formats are stored, improving data quality and preventing injection-like weird data. */

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
/* Explanation: This pre-save hook is the key password security mechanism. Mongoose hooks let you run logic automatically before or after certain model operations. Here, before saving a user, you check if the password field changed (`isModified("password")`). This matters because you don’t want to re-hash an already-hashed password when saving unrelated profile updates. If it’s modified, you run `bcrypt.hash(password, saltRounds)`.Bcrypt is intentionally slow; that’s a feature. If a database is compromised, slow hashes make brute-force attacks harder. `saltRounds` controls cost: higher = slower but more secure. The result is stored back into `this.password`, replacing the plain password. That means the DB never sees the raw password. */

// compare password while authenticating user which translates roughly to check if the user is actual who he says he is.
userSchema.methods.comparePassword = function (passwordEnteredByUser) {
  return bcrypt.compare(passwordEnteredByUser, this.password);
};
/* Explanation: This instance method supports login. `bcrypt.compare(plain, hash)` checks if a provided password matches the stored hash. You use this in signin flows. This design is good because it encapsulates password logic inside the model, so controllers don’t need to know hashing details. It also prevents mistakes like directly comparing strings. */

const UserModel = mongoose.model("User", userSchema); // creating our schema model

module.exports = { User: UserModel };
/* Explanation: `mongoose.model("User", userSchema)` compiles the schema into a model class. Exporting it as `{ User: UserModel }` standardizes imports across the backend. This model is now used by controllers and middleware to create users, query by id/email, validate updates, and authenticate requests. */
