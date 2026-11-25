const validate = (schema) => {
    return (req, res, next) => {
        if (!schema || typeof schema.validate !== "function") {
            return next();
        }

        const result = schema.validate(req.body, { abortEarly: false });
        if (result.error) {
            const firstErrorMessage = result.error.details[0].message;
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: firstErrorMessage,
                errors: result.error.details.map((detail) => detail.message)
            });
        }
        next();
    };
};

module.exports = validate;
