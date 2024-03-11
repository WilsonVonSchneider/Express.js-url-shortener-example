// AuthValidations.js
const { body, param } = require("express-validator"); // import express validator
// export the validation rules for each route as an array
module.exports = {
  store: [
    body("username").notEmpty().withMessage("Username is required"), // check if name is not empty
    body("email").isEmail().withMessage("Invalid email address"), // check if email is a valid email address
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"), // check if password is at least 6 characters long
  ],
  login: [
    body("email").isEmail().withMessage("Invalid email address"), // check if email is a valid email address
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"), // check if password is at least 6 characters long
  ],
  resendEmail: [
    body("email").isEmail().withMessage("Invalid email address"), // check if email is a valid email address
  ]
};