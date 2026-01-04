const jwt = require("jsonwebtoken");
require("dotenv").config({
  path: `../../.env.${process.env.NODE_ENV}`,
});
const { throwNewError } = require("../utils");
const { User } = require("../models/user");

const userControllerToSignup = async (req, res, next) => {
  try {
    const { firstName, lastName, userName, email, password } = req.body;
    const user = new User({
      firstName,
      lastName,
      userName,
      email,
      password,
    });
    await user.save();
    res.status(200).json({
      success: true,
      status: 200,
      message: "User successfully added to DB",
    });
  } catch (err) {
    next(err);
  }
};

const userControllerToSignin = (req, res, next) => {
  try {
    const { email } = req.body;
    const user = req.user;

    // create the json web token
    const token = jwt.sign(
      { id: user._id, email: email },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "3h",
      }
    );

    // place the json web token in a cookie. made sure to have different secrets for development and production
    const cookieOptions = {
      httpOnly: true, // prevents JS access (XSS protection)
      sameSite: "strict", // CSRF protection
      maxAge: 1000 * 60 * 60 * 3, // 1 hour

      // secure: true, // only over HTTPS (set false in local dev)
    };
    if (process.env.NODE_ENV === "production") {
      cookieOptions.secure = true;
    } else if (process.env.NODE_ENV === "development") {
      cookieOptions.secure = false;
    }
    // the cookie enclosing the jwt is sent along with the response
    res
      .cookie("jwt", token, cookieOptions)
      .status(200)
      .json({
        success: true,
        status: 200,
        message: "Signed in successfully.",
        user: {
          id: user._id,
          email: user.email,
          userName: user.userName,
        },
      });
  } catch (err) {
    next(err);
  }
};

const userControllerToGetProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const err = throwNewError(404, "No such user found");
      return next(err);
    }
    res.status(200).json({
      success: true,
      status: 200,
      message: "User found successfully.",
      user: user,
    });
  } catch (err) {
    next(err);
  }
};

const userControllerToPatchProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      status: 200,
      message: "User updated successfully.",
    });
  } catch (err) {
    next(err);
  }
};

const userControllerToPatchPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.userId).select("+password");
    const passwordNotUpdated = await user.comparePassword(password);
    console.log(passwordNotUpdated);
    if (passwordNotUpdated)
      throw throwNewError(
        422,
        "Cannot use an current password to update password."
      );
    user.set({ password: password });
    await user.save();
    res.status(200).json({
      success: true,
      status: 200,
      message: "Password updated successfully.",
    });
  } catch (err) {
    next(err);
  }
};

const userControllerToLogoutProfile = (req, res, next) => {
  try {
    // the cookie is passed with a null token and set to expiere immediately
    res
      .cookie("jwt", null, { expires: new Date(Date.now()) })
      .status(200)
      .json({
        success: true,
        status: 200,
        message: "Logged out successfully.",
      });
  } catch (err) {
    next(err);
  }
};

const userControllerToDeleteProfile = async (req, res, next) => {
  try {
    console.log(req.userId);
    await User.findByIdAndDelete(req.userId);
    res
      .cookie("jwt", null, { expires: new Date(Date.now()) }) // this step is important because it makes sure that delete api is not misused by calling multiple delete calls for the same token and user id.
      .status(200)
      .json({
        success: true,
        status: 200,
        message: "Profiie deleted successfully.",
      });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  userControllerToSignup,
  userControllerToSignin,
  userControllerToGetProfile,
  userControllerToPatchProfile,
  userControllerToPatchPassword,
  userControllerToLogoutProfile,
  userControllerToDeleteProfile,
};
