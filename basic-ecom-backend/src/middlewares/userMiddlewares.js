// ###

// This module will have functions that shall help sanitize and validate data at the API level.

// ###

const validator = require("validator"); // sanitizes and validates only strings

// import helpers
const {
  throwNewError,
  normalizeStrings,
  removeEmptyPatchKeys,
  loopPatchProfileInputs,
} = require("../utils");

// schemas
const { User } = require("../models/user");
const { set } = require("mongoose");

//
//
//
// ======== signup route

// validate input for signup route
const signupIputValidator = async (req, res, next) => {
  const { firstName, lastName, userName, email, password } = req.body;

  // check if all field are present
  if (!firstName || !lastName || !userName || !email || !password) {
    const err = throwNewError(422, "All fields are required."); // code 422 Unprocessable Entity
    return next(err);
  }

  // first name and last name can only be alphabets string
  if (!validator.isAlpha(firstName) || !validator.isAlpha(lastName)) {
    const err = throwNewError(422, "Names must only be alphabetic."); // code 422 Unprocessable Entity
    return next(err);
  }

  // username cannot have charecters other than alphabets and numbers
  if (!validator.isAlphanumeric(userName)) {
    const err = throwNewError(
      422,
      "Username cannot have charecters other than aplhabets and numbers."
    ); // code 422 Unprocessable Entity
    return next(err);
  }

  // check if email is valid
  if (!validator.isEmail(email)) {
    const err = throwNewError(422, "Enter a valid email."); // 422 Unprocessable Entity
    return next(err);
  }

  // check if password is strong enough
  if (!validator.isStrongPassword(password)) {
    const err = throwNewError(
      422,
      "Password is weak. Password must have minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1"
    ); // 422 to clearly indicate “the request is syntactically valid but semantically invalid”
    return next(err);
  }

  next();
};

// check if user already exists, used for signup route
const isUserUnique = async (req, res, next) => {
  try {
    const { email } = req.body;

    // check if email is already in DB
    const user = await User.findOne({ email });
    if (user) {
      const err = throwNewError(409, "User already exist."); // code 409 user request conflicts with current resources
      return next(err);
    }
    next();
  } catch (err) {
    next(err);
  }
};

//check if userName is an unique value
const isUserNameUnique = async (req, res, next) => {
  try {
    const { userName } = req.body;
    const user = await User.findOne({ userName });
    if (user) {
      const err = throwNewError(
        409,
        "Username already exist, choose another username."
      ); // code 409 user request conflicts with current resources
      return next(err);
    }
    next();
  } catch (err) {
    next(err);
  }
};

//
//
//
// ======== signin route

// signinInputValidator validate input for signin route
const signinInputValidator = (req, res, next) => {
  const { email, password } = req.body;

  // check if all field are present
  if (!email || !password) {
    const err = throwNewError(422, "All fields are required."); // code 422 Unprocessable Entity
    return next(err);
  }

  // check if email is valid
  if (!validator.isEmail(email)) {
    const err = throwNewError(422, "Invalid credentials."); // 422 Unprocessable Entity
    return next(err);
  }

  // check if entered password is of correct pattern. Password must have minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
  if (!validator.isStrongPassword(password)) {
    const err = throwNewError(422, "Invalid credentials."); // 422 Unprocessable Entity
    return next(err);
  }

  next();
};

// ensure if user email is there in DB for sign in route
const ensureUserExists = async (req, res, next) => {
  try {
    const { email } = req.body;

    // check if email is already in DB
    const user = await User.findOne({ email });
    if (!user) {
      const err = throwNewError(404, "User not found."); // code 404 said resources not found
      return next(err);
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// compare user entered password with existing passwordHash for sign in route
const comparePasswordToHashAtSignin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password"); // the password is already hashed and the userschema method comparePassword does not automatically access the hashed password in the db..it needs access through this instance here so we need to also make sure to make this password hash available, we do it by selecting it while quereing user because by default select is false for password.
    const result = await user.comparePassword(password);
    delete req.body.password;
    if (!result) {
      delete req.user;
      const err = throwNewError(401, "Invalid credentials."); // code 401 unauthorised user
      return next(err);
    }
    next();
  } catch (err) {
    next(err);
  }
};

//
//
//
// ======= profile routes

// patch profile
// patchProfileInputValidators sanitize all the inputs to patch profile
const ensureUserPatchable = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const err = throwNewError(404, "No such user found");
      return next(err);
    }
    req.user = user;

    // for now only ensuring that user exist but can follow a blacklist approach and list down a few user properties that can not be patched whatsoever...like email, created at etc.

    next();
  } catch (err) {
    next(err);
  }
};
// will get the following error without the above function if a fake user tries to break in —
// "message": "Cannot read properties of null (reading 'set')"

// normalize all the strings in req.body
const normalizePatchProfileInputs = (req, res, next) => {
  try {
    const normalizedUserInput = normalizeStrings(req.body);
    delete req.body;
    const patchProfileInputs = normalizedUserInput;
    req.patchProfileInputs = patchProfileInputs;
    next();
  } catch (err) {
    next(err);
  }
};
const patchProfileInputValidator = (req, res, next) => {
  try {
    const patchProfileInputs = removeEmptyPatchKeys(req.patchProfileInputs);
    // middle name and maiden name can only be alphabets string
    if (patchProfileInputs?.middleName) {
      if (
        !validator.isAlpha(patchProfileInputs?.middleName, "en-US", {
          ignore: null,
        })
      ) {
        const err = throwNewError(
          422,
          "Names must only be a string of alphabets."
        ); // code 422 Unprocessable Entity
        return next(err);
      }
    }
    if (patchProfileInputs?.maidenName) {
      if (
        !validator.isAlpha(patchProfileInputs?.maidenName, "en-US", {
          ignore: null,
        })
      ) {
        const err = throwNewError(422, "Names must only be alphabetic."); // code 422 Unprocessable Entity
        return next(err);
      }
    }
    // phone numbers just check if teh format matches with locale code provided, it done not do any authentication of actual phone numbers
    if (patchProfileInputs?.phone) {
      if (!validator.isMobilePhone(patchProfileInputs?.phone, "en-IN")) {
        const err = throwNewError(422, "Phone number not valid."); // code 422 Unprocessable Entity
        return next(err);
      }
    }
    // birthdate
    if (patchProfileInputs?.birthDate) {
      // validate date string of birthdate
      if (
        !validator.isDate(patchProfileInputs?.birthDate, {
          format: "YYYY-MM-DD",
          delimiters: ["-"],
        })
      ) {
        const err = throwNewError(422, "Enter a valid date."); // code 422 Unprocessable Entity
        return next(err);
      }
      // age must be number and above 12 and less than 130
      if (
        patchProfileInputs?.birthDate <
        new Date().setFullYear(new Date().getFullYear() - 12)
      ) {
        const err = throwNewError(
          422,
          "Birthdate needs to be at least 12 years in the past."
        ); // code 422 Unprocessable Entity
        return next(err);
      }
    }
    // gender can only be either male, female, or others
    if (patchProfileInputs?.gender) {
      patchProfileInputs.gender = patchProfileInputs.gender.toLowerCase();
      const gender = patchProfileInputs.gender;
      if (
        !validator.isAlpha(gender) ||
        (gender !== "male" && gender !== "female" && gender !== "others")
      ) {
        const err = throwNewError(
          422,
          "Gender can only be male, female or other"
        ); // code 422 Unprocessable Entity
        return next(err);
      }
    }
    // check if its a valid url
    if (patchProfileInputs?.image) {
      if (
        !validator.isURL(patchProfileInputs?.image, {
          protocols: ["https"],
        })
      ) {
        const err = throwNewError(422, "Enter a valid url."); // code 422 Unprocessable Entity
        return next(err);
      }
    }
    // check if its a valid bloodGroup
    if (patchProfileInputs?.bloodGroup) {
      if (
        !validator.matches(
          patchProfileInputs.bloodGroup.toUpperCase(),
          /^(A|B|AB|O)[+-]$/
        )
      ) {
        const err = throwNewError(422, "Enter a valid blood group.");
        return next(err);
      }
    }
    // check if its a valid ip
    if (patchProfileInputs?.ip) {
      if (!validator.isIP(patchProfileInputs.ip)) {
        const err = throwNewError(422, "Enter a valid IP.");
        return next(err);
      }
    }
    if (patchProfileInputs?.address?.address) {
      // check if its a valid address string
      if (
        !validator.isAlphanumeric(patchProfileInputs.address.address, "en-US", {
          ignore: " ,-/",
        })
      ) {
        const err = throwNewError(
          422,
          "Can only use alphabests, numbers and comma(,),(-)hiphen and the forward slash(/)."
        );
        return next(err);
      }
      if (patchProfileInputs?.address.address.length > 130) {
        const err = throwNewError(
          422,
          "Address field cannot exceed 130 charecters."
        );
        return next(err);
      }
    }
    // check if its a valid landmark string
    if (patchProfileInputs?.address?.landMark) {
      if (
        !validator.isAlphanumeric(
          patchProfileInputs.address?.landMark,
          "en-US",
          {
            ignore: " -",
          }
        )
      ) {
        const err = throwNewError(
          422,
          "Can only use alphabests, numbers, (-)hiphen and space in landmark"
        );
        return next(err);
      }
      if (patchProfileInputs?.address.landMark.length > 70) {
        const err = throwNewError(
          422,
          "Address field cannot exceed 30 charecters."
        );
        return next(err);
      }
    }
    // check if its a valid string for locality
    if (patchProfileInputs?.address?.locality) {
      if (
        !validator.isAlphanumeric(
          patchProfileInputs.address?.locality,
          "en-US",
          {
            ignore: " -",
          }
        )
      ) {
        const err = throwNewError(
          422,
          "Can only use alphabests, numbers, (-)hiphen and space in locality"
        );
        return next(err);
      }
      if (patchProfileInputs?.address.locality.length > 30) {
        const err = throwNewError(
          422,
          "Address field cannot exceed 30 charecters."
        );
        return next(err);
      }
    }
    // check if its a valid string for city
    if (patchProfileInputs?.address?.city) {
      if (
        !validator.isAlpha(patchProfileInputs.address.city, "en-US", {
          ignore: " ",
        })
      ) {
        const err = throwNewError(
          422,
          "Can only use alphabests, (-)hiphen and space in city"
        );
        return next(err);
      }
      if (patchProfileInputs?.address.city.length > 30) {
        const err = throwNewError(
          422,
          "Address field cannot exceed 30 charecters."
        );
        return next(err);
      }
    }
    // check if its a valid string for state
    if (patchProfileInputs?.address?.state) {
      if (
        !validator.isAlpha(patchProfileInputs.address.state, "en-US", {
          ignore: " ",
        })
      ) {
        const err = throwNewError(
          422,
          `Can only use alphabests, (-)hiphen and space in state.`
        );
        return next(err);
      }
      if (patchProfileInputs?.address.state.length > 30) {
        const err = throwNewError(
          422,
          "Address field cannot exceed 30 charecters."
        );
        return next(err);
      }
    }
    // check if its a valid format for state code
    if (patchProfileInputs?.address?.stateCode) {
      if (!validator.isNumeric(patchProfileInputs.address.stateCode)) {
        const err = throwNewError(
          422,
          `Can only use a string of numbers in State code.`
        );
        return next(err);
      }
      if (patchProfileInputs?.address?.stateCode.length > 2) {
        const err = throwNewError(
          422,
          "State code field cannot exceed 2 charecters."
        );
        return next(err);
      }
    }
    // check if its a valid format for pin
    if (patchProfileInputs?.address?.pin) {
      if (!validator.isNumeric(patchProfileInputs.address.pin)) {
        const err = throwNewError(
          422,
          "Can only use a string of numbers in pin."
        );
        return next(err);
      }
      if (patchProfileInputs?.address.pin.length > 6) {
        const err = throwNewError(422, "Please enter a valid PIN code.");
        return next(err);
      }
    }
    // check if its a valid lat long ( geo location )
    if (
      patchProfileInputs?.address?.coordinates?.lat &&
      patchProfileInputs?.address?.coordinates?.lng
    ) {
      if (
        !validator.isLatLong(
          `${patchProfileInputs.address.coordinates.lat},${patchProfileInputs.address.coordinates.lng}`.trim()
        )
      ) {
        const err = throwNewError(
          422,
          "Enter a valid latitude and longitude coordinates. Format must be 'lat,lng'."
        );
        return next(err);
      }
    }
    // check if its a valid company string
    if (patchProfileInputs?.company?.name) {
      if (
        !validator.isAlphanumeric(patchProfileInputs.company.name, "en-US", {
          ignore: " .-",
        })
      ) {
        const err = throwNewError(
          422,
          "Can only use alphabests, numbers, dot(.) and (-)hiphen in company name."
        );
        return next(err);
      }
      if (patchProfileInputs?.company.name.length > 50) {
        const err = throwNewError(
          422,
          "company name field cannot exceed 50 charecters."
        );
        return next(err);
      }
    }
    // check if its a valid company string
    if (patchProfileInputs?.company?.title) {
      if (
        !validator.isAlphanumeric(
          patchProfileInputs.company.title.trim(),
          "en-US",
          { ignore: " " }
        )
      ) {
        const err = throwNewError(
          422,
          "Can only use alphabests, numbers and space in title."
        );
        return next(err);
      }
      if (patchProfileInputs?.company.title.length > 30) {
        const err = throwNewError(422, "Title cannot exceed 30 charecters.");
        return next(err);
      }
    }
    req.patchProfileInputs = patchProfileInputs;
    next();
  } catch (err) {
    next(err);
  }
};
const sanitizePatchUserNonStringProperties = async (req, res, next) => {
  try {
    // serapating string inputs from req
    req.patchProfileStringInputs = req.patchProfileInputs;
    // serapating non string inputs from req
    req.patchProfileNonStringInputs = req.patchProfileNonStringInputs || {};
    if (req.patchProfileInputs?.birthDate) {
      req.patchProfileNonStringInputs.birthDate =
        req.patchProfileInputs.birthDate;
    }
    // deleteing patchProfileInputs from req, no need redundant data in req
    delete req.patchProfileInputs;

    const user = req.user;

    // check if birthdate has been modified by user
    const birthDate = new Date(req.patchProfileNonStringInputs.birthDate);
    if (
      typeof birthDate !== typeof user?.birthDate ||
      birthDate.toDateString() === user.birthDate.toDateString()
    )
      delete req.patchProfileNonStringInputs.birthDate;

    req.user = user;
    if (
      req.patchProfileNonStringInputs &&
      Object.keys(req.patchProfileNonStringInputs).length > 0
    ) {
      user.set(req.patchProfileNonStringInputs);
    }
    next();
  } catch (err) {
    next(err);
  }
};
const sanitizePatchUserStringProperties = async (req, res, next) => {
  try {
    const user = req.user;
    // if any string inputs not modified remove from payload
    const patchProfileStringInputs = loopPatchProfileInputs(
      req.patchProfileStringInputs,
      user
    );
    user.set(patchProfileStringInputs);

    // saving all the changes that are set uptill now
    await user.save();
    next();
  } catch (err) {
    next(err);
  }
};
// #region
// TODO: create --Audit trail--
// const logPatchChanges = (req, res, next) => {
//   const userId = req.user._id; // who made the change
//   const modifiedFields = Object.keys(req.patchProfileInputs || {});
//   const timestamp = new Date();

//   if (modifiedFields.length > 0) {
//     console.log(`[AUDIT] User ${userId} patched profile at ${timestamp}`);
//     modifiedFields.forEach((field) => {
//       const oldVal = req.user[field];
//       const newVal = req.patchProfileInputs[field];
//       console.log(`  - ${field}: "${oldVal}" → "${newVal}"`);
//     });
//   }

//   // optionally: save to DB or external logging service
//   // AuditLog.create({ userId, changes: req.patchProfileInputs, timestamp });

//   next();
// };
// #endregion

module.exports = {
  signupIputValidator,
  isUserUnique,
  isUserNameUnique,
  signinInputValidator,
  ensureUserExists,
  comparePasswordToHashAtSignin,
  ensureUserPatchable,
  normalizePatchProfileInputs,
  patchProfileInputValidator,
  sanitizePatchUserNonStringProperties,
  sanitizePatchUserStringProperties,
};
