const joi = require("joi")

const noticeValidation = joi.object({

    notice_title: joi.string().required(),
    description: joi.string().required(),
    department: joi.string().required(),
    issued_by: joi.string().required(),
    publish_date: joi.date().required(),
    for_whom: joi.string().required()

}, {
    timestamps: true
})


module.exports = noticeValidation