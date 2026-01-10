const validator = require("validator");
const { throwNewError } = require("./errorHandlers");
// helpers

// non required fields that adds more geniuneness to a user
const allowedPatchFieldsObj = {
  middleName: true,
  maidenName: true,
  phone: true,
  birthDate: true,
  gender: true,
  image: true,
  bloodGroup: true,
  ip: true,
  address: {
    address: true,
    landmark: true,
    locality: true,
    city: true,
    state: true,
    stateCode: true,
    pin: true,
    coordinates: { lat: true, lng: true },
    // country: true,
  },
  company: { name: true, title: true },
};

const normalizeStrings = (inputObj) => {
  const normalizedInputObj = {};
  for (const key in inputObj) {
    const inputKey = inputObj[key];
    if (inputKey && typeof inputKey === "object" && !Array.isArray(inputKey)) {
      const nestedObj = normalizeStrings(inputKey);
      normalizedInputObj[key] = nestedObj;
    } else if (typeof inputKey === "string") {
      // escaping dangerous HTML charecters
      const safeString = validator.escape(inputKey);
      normalizedInputObj[key] = safeString.toLowerCase().trim();
    } else {
      normalizedInputObj[key] = inputKey;
    }
  }
  return normalizedInputObj;
};
const removeEmptyPatchKeys = (
  input,
  allowedPatchFields = allowedPatchFieldsObj
) => {
  const filteredPatchInputs = {};
  for (const key of Object.keys(input)) {
    if (allowedPatchFields[key]) {
      if (
        typeof allowedPatchFields[key] === "object" &&
        typeof input[key] === "object"
      ) {
        filteredPatchInputs[key] = removeEmptyPatchKeys(
          input[key],
          allowedPatchFields[key]
        );
      } else {
        try {
          if (!validator.isEmpty(input[key]))
            filteredPatchInputs[key] = input[key]; // if a field is empty, no need to send to database for patch
        } catch (err) {
          throw throwNewError(undefined, `${err.message} for ${key}`);
        }
      }
    }
  }
  return filteredPatchInputs;
};

const loopPatchProfileInputs = (inputs, user) => {
  if (!inputs) return;
  const patchableInputs = { ...inputs };
  for (const key in patchableInputs) {
    const userVal = user[key];
    if (
      patchableInputs[key] &&
      typeof patchableInputs[key] === "object" &&
      userVal &&
      typeof userVal === "object"
    ) {
      const nestedPatchProfileInputs = loopPatchProfileInputs(
        patchableInputs[key],
        userVal
      );
      if (
        nestedPatchProfileInputs &&
        Object.keys(nestedPatchProfileInputs).length > 0
      ) {
        patchableInputs[key] = nestedPatchProfileInputs;
      } else {
        delete patchableInputs[key];
      }
    } else {
      if (patchableInputs[key] === userVal) delete patchableInputs[key];
    }
  }
  // console.log(patchableInputs);
  return patchableInputs;
};

module.exports = {
  normalizeStrings,
  removeEmptyPatchKeys,
  loopPatchProfileInputs,
};
