const isEmpty = value =>
  value === undefined ||
  value === null ||
  (typeof value === "object" && Object.keys(value).length === 0) ||
  (typeof value === "string" && value.trim().length === 0);

module.exports = isEmpty;

// Validators isEmpty only check for an empty string so we created this global isempty function to be able to use it to validate the value entered meets our specifications across our application
