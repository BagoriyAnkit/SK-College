const joi = require("joi")

const placementValidation = joi.object({
    StudentName: joi.string().required(),
    CompanyName: joi.string().required(),
    Package: joi.string().required(),
    Year: joi.string().required(),
    JobType: joi.string().required(),
    Location: joi.string().required()
})

module.exports = placementValidation