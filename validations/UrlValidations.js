// AuthValidations.js
const { body, param } = require("express-validator"); // import express validator
// export the validation rules for each route as an array
module.exports = {
  index: [],
  store: [
    body("trueUrl").notEmpty().withMessage("Url is required").isURL({ require_protocol: true, protocols: ["https"] }).withMessage("True Url must be a valid HTTPS link"),
    body("keyWord").optional().custom((value) => {
      const forbiddenKeywords = ['login', 'register', 'verify-email', 'refresh', 'url', 'store'];
      if (value && forbiddenKeywords.includes(value)) {
        throw new Error("Invalid keyword");
      }
      return true;
    }),
  ],
  show: [],
  update: [
    body("trueUrl").notEmpty().withMessage("Url is required").isURL({ require_protocol: true, protocols: ["https"] }).withMessage("True Url must be a valid HTTPS link"),
    body("keyWord").optional().custom((value) => {
      const forbiddenKeywords = ['login', 'register', 'verify-email', 'refresh', 'url', 'store'];
      if (value && forbiddenKeywords.includes(value)) {
        throw new Error("Invalid keyword");
      }
      return true;
    }),
],
  delete: [],
};