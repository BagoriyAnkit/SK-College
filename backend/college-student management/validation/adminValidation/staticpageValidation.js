const joi = require("joi");

const staticPageValidation = joi.object({

    title: joi.string().required(),

    description: joi.string().required(),

    image: joi.string(),

    slug: joi.string().required()

});

module.exports = staticPageValidation;