const isString = require('lodash/isString');
const isArray = require('lodash/isArray');
const isObject = require('lodash/isObject');
const isFunction = require('lodash/isFunction');

/**
 * @namespace ErrorHandling
 * @summary error handling utilities.
 * @example 'errors' object example:
 * const errors = {
 *   email: ['Email is required!', 'Please, provide a valid email address!', ...],
 *   password: ['Please, at least 6 characters long!', ...],
 *   ...
 * }
 */
const ErrorHandling = {};

//------------------------------------------------------------------------------
/**
* @summary Traverses errors object keys and fires callback when condition is met
* or when the end of the errors object is reached.
*/
ErrorHandling.traverseErrors = (errors, cond) => {
  if (!isObject(errors)) {
    throw new Error('Check your errors argument, it must be a valid object');
  }
  if (!isFunction(cond)) {
    throw new Error('Check your cond argument, it must be a valid function');
  }

  const keys = Object.keys(errors);
  const { length } = keys;

  for (let i = 0; i < length; i += 1) {
    // If condition is met, interrupt the for loop and return relevant data
    if (cond(errors, keys[i])) {
      return { index: i, key: keys[i] };
    }
  }

  return { index: -1, key: null };
};
//------------------------------------------------------------------------------
/**
* @summary Returns the first not empty error.
*/
ErrorHandling.getFirstError = (errors) => {
  if (!isObject(errors)) {
    throw new Error('Check your errors argument, it must be a valid object');
  }

  // Condition: at least one of the error fields is not empty
  const cond = (err, key) => err[key].length > 0;

  // Traverse the errors object and apply the condition above until it's met or
  // the end of the object is reached.
  const { index, key } = ErrorHandling.traverseErrors(errors, cond);

  // Handle no errors found
  if (index === -1) {
    return { index, key, value: '' };
  }

  // Return first error data
  return { index, key, value: errors[key][0] };
};
//------------------------------------------------------------------------------
/**
* @summary Returns 'true' if the errors object contains at least one non-empty
* error field.
*/
ErrorHandling.hasErrors = (errors) => {
  if (!isObject(errors)) {
    throw new Error('Check your errors argument, it must be a valid object');
  }

  return ErrorHandling.getFirstError(errors).index !== -1;
};
//------------------------------------------------------------------------------
/**
* @summary Returns all errors for the given field. A mutation (i18n for instance)
* can be applied to the array of errors before concatenation.
*/
ErrorHandling.getFieldErrors = (errors, field, mutation) => {
  if (!isObject(errors)) {
    throw new Error('Check your errors argument, it must be a valid object');
  }
  if (!isString(field)) {
    throw new Error('Check your field argument, it must be a valid string');
  }

  const keys = Object.keys(errors);

  if (keys.indexOf(field) === -1) {
    throw new Error('Check your errors object, the field is not a valid key');
  }

  // Get array of errors for the given field
  const array = errors[field];

  if (!isArray(array)) {
    throw new Error('Check your errors object, the value is not a valid array');
  }

  if (mutation && isFunction(mutation)) {
    return array.map(item => mutation(item)).join(' ');
  }

  return array.join(' ');
};
//------------------------------------------------------------------------------
/**
* @summary Clear error messages for the given field -or array of fields-
* leaving the remaining errors keys untouched.
*/
ErrorHandling.clearErrors = (errors, fields) => {
  if (!isObject(errors)) {
    throw new Error('Check your errors argument, it must be a valid object');
  }
  if (!isString(fields) && !isArray(fields)) {
    throw new Error('Check your fields argument, it must be a valid string or array of strings');
  }

  const keys = Object.keys(errors);
  const res = {}; // new errors object

  // Remove errors if key matches the given field(s), preserve the original
  // value otherwise.
  keys.forEach((key) => {
    const isStringMatch = isString(fields) && fields === key;
    const isArrayMatch = isArray(fields) && fields.indexOf(key) !== -1;

    res[key] = (isStringMatch || isArrayMatch) ? [] : errors[key];
  });

  return res;
};
//------------------------------------------------------------------------------

module.exports = ErrorHandling;
