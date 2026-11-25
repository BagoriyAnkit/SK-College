const Event = require("../../model/admin/event");

// Get All Events
const getAllEvent = async (req, res) => {
    try {
        const data = await Event.find();

        res.json({
            status: true,
            statusCode: 200,
            message: "Events found successfully",
            data: data
        });

    } catch (error) {
        res.json({
            status: false,
            statusCode: 500,
            message: "Error"
        });
    }
};

// Get Event By Id
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await Event.findById(id);

        res.json({
            status: true,
            statusCode: 200,
            message: "Event found successfully",
            data: data
        });

    } catch (error) {
        res.json({
            status: false,
            statusCode: 500,
            message: "Error"
        });
    }
};

module.exports = {
    getAllEvent,
    getEventById
};