const joi = require('joi')

/**
 * Helper function to validate an object against the provided schema,
 * and to throw a custom error if object is not valid.
 *
 * @param {Object} object The object to be validated.
 * @param {String} label The label to use in the error message.
 * @param {JoiSchema} schema The Joi schema to validate the object against.
 */
function validateObject (ctx, object = {}, label, schema, options, joiOverrides = {}) {
  // Skip validation if no schema is provided
  if (schema) {
    const mergedOptions = Object.assign(joiOverrides, options.joi)

    // Validate the object against the provided schema
    const { error, value } = joi.validate(object, schema, mergedOptions)
    object = Object.assign(object, value)

    if (error) {
      ctx.throw(options.status, error.message)
    }
  }
}

/**
 * Generate a Koa middleware function to validate a request using
 * the provided validation objects.
 *
 * @param {Object} validationObj
 * @param {Object} validationObj.headers The request headers schema
 * @param {Object} validationObj.params The request params schema
 * @param {Object} validationObj.query The request query schema
 * @param {Object} validationObj.body The request body schema
 * @param {Object} options The Joi options
 * @returns A validation middleware function.
 */
function validate (validationObj, options = {}) {
  options.status = options.status || 422

  // Return a Koa middleware function
  return (ctx, next) => {
    // Validate each request data object in the Koa context object
    validateObject(ctx, ctx.headers, 'Headers', validationObj.headers, options, { allowUnknown: true })
    validateObject(ctx, ctx.params, 'URL Parameters', validationObj.params, options)
    validateObject(ctx, ctx.query, 'URL Query', validationObj.query, options)

    if (ctx.request.body) {
      validateObject(ctx, ctx.request.body, 'Request Body', validationObj.body, options)
    }

    return next()
  }
}

module.exports = validate
