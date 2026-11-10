const joi = require("joi")

const eventValidation = joi.object({


    event_title: joi.string().required(),
    // description: joi.string().required(),
    event_date: joi.date().required(),
    start_time: joi.string().required(),
    end_time: joi.string().required(),
    location: joi.string().required(),
    // event_type: joi.string().valid("Upcoming", "Previous").required()
})

const updateValidation = joi.object({


    event_title: joi.string(),
    // description: joi.string(),
    event_date: joi.date(),
    start_time: joi.string(),
    end_time: joi.string(),
    location: joi.string(),
})


module.exports = { eventValidation, updateValidation }
