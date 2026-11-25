const Contact = require("../../model/admin/contact");

const addContact = async (req, res) => {
    try {

        await Contact.create(req.body);

        return res.status(201).json({
            status: true,
            message: "Message sent successfully."
        });

    } catch (error) {

        return res.status(500).json({
            status: false,
            message: "Something went wrong."
        });

    }
};

module.exports = {
     addContact,
};