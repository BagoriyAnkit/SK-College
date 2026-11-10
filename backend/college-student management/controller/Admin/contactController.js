const Contact = require("../../model/admin/contact");


const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await Contact.deleteOne({ _id: id });

        res.json({
            status: true,
            statusCode: 200,
            message: "Contact deleted successfully",
            data: data,
        });
    } catch (error) {
        res.json({
            status: false,
            statusCode: 500,
            message: "Error",
        });
    }
};

const viewAllContact = async (req, res) => {

    try {
        const data = await Contact.find();

        res.json({
            status: true,
            statusCode: 200,
            message: "Contacts found successfully",
            data: data,
        });
    } catch (error) {
        res.json({
            status: false,
            statusCode: 500,
            message: "Error",
        });
    }
};

module.exports = {
    deleteContact,
    viewAllContact
};