const Event = require("../../model/admin/event")

const addEvent = async (req, res) => {
    try {
        const data = await Event.create({
            ...req.body,
            image: req.file ? req.file.filename : ""
        });

        res.status(201).json({
            status: true,
            message: "Event added successfully",
            data
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

const viewEvent = async (req, res) => {

    try {
        const { id } = req.params
        const data = await Event.findOne({ _id: id })
        res.json({
            status: true,
            statuscode: 200,
            message: "event found successfully",
            data: data
        })
    } catch (error) {
        res.json({
            status: false,
            statuscode: 500,
            message: "error",
        })
    }
}

const updateEvent = async (req, res) => {

    try {
        const { id } = req.params
        const updateData = req.body
        const data = await event.updateOne({ _id: id }, updateData)
        res.json({
            status: true,
            statusCode: 200,
            message: "event updated successfully",
            data: data
        })
    } catch (error) {
        res.json({
            status: false,
            statusCode: 500,
            message: "error"
        })

    }
}

const updateStatus = async (req, res) => {

    try {
        const { id } = req.params;
        const data = await Event.findOne({ _id: id });

        if (!data) {
            return res.status(404).json({
                status: false,
                message: "Event not found",
            });
        }

        data.status =
            data.status === "Active" ? "Inactive" : "Active";

        await data.save();

        res.json({
            status: true,
            message: "Status updated successfully",
            data: data,
        });

    } catch (error) {
        console.log(error); // <-- Ye console ka output bhi bhejna
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
}

const deleteEvent = async (req, res) => {

    try {
        const { id } = req.params
        const data = await Event.deleteOne({ _id: id })
        res.json({
            status: true,
            statuscode: 200,
            message: "event deleted successfully",
            data: data
        })
    } catch (error) {
        res.json({
            status: false,
            statuscode: 500,
            message: "error",
        })
    }
}

const viewAllEvent = async (req, res) => {

    try {
        const data = await Event.find()
        res.json({
            status: true,
            statusCode: 200,
            message: "events found successfully",
            data: data
        })
    } catch (error) {
        res.json({
            status: false,
            statusCode: 500,
            message: "error"
        })
    }
}

module.exports = {
    addEvent,
    viewEvent,
    updateEvent,
    updateStatus,
    deleteEvent,
    viewAllEvent
}
