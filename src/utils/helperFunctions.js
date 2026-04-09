const { Product } = require("../models/products");
const validator = require("validator");
const { throwNewError } = require("./errorHandlers");
// helpers
/* Explanation: This module contains helper functions that support user profile updates and input normalization. It focuses on “data hygiene”: making sure user-provided data is safe to store and safe to echo back in responses. It uses the `validator` library, which provides battle-tested utilities for validation and escaping. Security concept: user inputs can contain HTML/JS payloads that could later be rendered by a frontend and become an XSS vector; escaping and normalizing reduces that risk. Another concept: patch/update endpoints are tricky because you want to update only allowed fields and you want to ignore fields that are unchanged or empty. These helpers implement that logic. */

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
/* Explanation: `allowedPatchFieldsObj` is a whitelist of fields that are allowed to be updated via a PATCH request. This is a critical security and data-integrity pattern: never allow clients to patch arbitrary keys, because they might set privileged flags (admin), overwrite internal ids, or inject unexpected structure. The nested objects represent nested patching: for example, `address.coordinates.lat` can be patched, but only those keys that are explicitly marked true. By encoding the whitelist as an object tree, you can recursively filter user-provided patch payloads. */

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
/* Explanation: `normalizeStrings` recursively walks an input object and normalizes string values. It performs three operations on strings: (1) `validator.escape` to convert characters like `<` and `>` into safe HTML entities, (2) `toLowerCase()` to enforce case-insensitive normalization, and (3) `trim()` to remove leading/trailing whitespace. This makes user data consistent (helpful for searching and comparisons) and reduces risk of storing dangerous markup. It also preserves non-string values as-is and recurses into nested objects while skipping arrays (arrays might represent lists where you may want different rules). This is a functional programming style: it produces a new object (`normalizedInputObj`) rather than mutating the input. */
const removeEmptyPatchKeys = (
  input,
  allowedPatchFields = allowedPatchFieldsObj,
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
          allowedPatchFields[key],
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
/* Explanation: `removeEmptyPatchKeys` filters a patch payload in two steps: whitelist filtering + empty-value removal. First, it checks if a key exists in `allowedPatchFields`. If it’s allowed and it’s a nested object, it recurses into it, which enforces nested whitelisting. If it’s a scalar value, it uses `validator.isEmpty` to detect empty strings and excludes them. This prevents patch requests from overwriting stored values with “empty” accidental payloads. The try/catch exists because `validator.isEmpty` expects a string; if a non-string is passed, it could throw. In that case, the function rethrows a standardized error with context (`for ${key}`), which helps debugging. */

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
        userVal,
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
  return patchableInputs;
};
/* Explanation: `loopPatchProfileInputs` removes fields from a patch object that would not change anything. This is an optimization and correctness helper: PATCH semantics are “partial update”, but clients often send all fields, including unchanged ones. This function compares `inputs` against the existing `user` object. If a value is identical, it deletes that key from the patch payload. For nested objects, it recurses and deletes entire nested keys if nothing inside would change.This is useful because it reduces unnecessary database writes and avoids triggering validators/hooks when nothing actually changes. It also supports a cleaner UX: you can return “nothing to update” errors if the patch payload becomes empty after this filtering. Under the hood, it uses shallow cloning (`{...inputs}`) and then mutates the clone; this avoids mutating the original `inputs` reference that might be used elsewhere. */

const updateProductStock = async (productId, amount) => {
  const updated = await Product.findOneAndUpdate(
    { _id: productId, stock: { $gte: amount > 0 ? 0 : Math.abs(amount) } },
    { $inc: { stock: amount } },
    { new: true },
  );
  if (!updated)
    throw throwNewError(400, "Product out of stock or unavailable.");
  return updated;
};
/* Explanation: `updateProductStock` is a helper function that atomically updates a product’s stock by a given amount. It uses `findOneAndUpdate` with a conditional query to ensure that the stock never goes negative. If `amount` is positive, it checks that stock is at least 0; if `amount` is negative (removing stock), it checks that stock is at least the absolute value of `amount`. This prevents overselling. If the update fails (for example, if the product doesn’t exist or if there isn’t enough stock), it throws a 400 error. The function returns the updated product document, which can be useful for confirming the new stock level or for further processing.*/

const getCartPopulateOptions = (userId) => {
  const populateOptions = [
    {
      path: "items.productRef",
      select:
        "_id title price discountPercentage rating stock sku availabilityStatus returnPolicy minimumOrderQuantity thumbnail",
    },
  ];

  // Using a loose check (!userId) handles both null and undefined safely
  if (userId) {
    populateOptions.unshift({
      path: "user",
      select: "_id userName +birthDate +gender", // birthday and gender are not reflecting in db, debug later
    });
  }

  return populateOptions;
};
/* Explanation: `getCartPopulateOptions` generates the options object for Mongoose’s `populate()` method when fetching a cart. It always populates the `items.productRef` field to get product details, but it conditionally populates the `user` field only if a `userId` is provided. This is an optimization: if you’re fetching a cart for an anonymous session (no userId), there’s no need to populate the user reference, which saves a database lookup. The function returns an array of populate instructions that can be passed directly into Mongoose queries. */

module.exports = {
  normalizeStrings,
  removeEmptyPatchKeys,
  loopPatchProfileInputs,
  updateProductStock,
  getCartPopulateOptions,
};
