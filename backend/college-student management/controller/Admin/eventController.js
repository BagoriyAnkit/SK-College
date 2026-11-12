const Event = require("../../model/admin/event");

const addEvent = async (req, res) => {
    try {
        const data = await Event.create({
            ...req.body,
            image: req.file ? req.file.filename : (req.body.image || "")
        });

        res.status(201).json({
            status: true,
            statusCode: 201,
            message: "Event added successfully",
            data
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: error.message || "Failed to add event"
        });
    }
};

const viewEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Event.findById(id);

        if (!data) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Event not found"
            });
        }

        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "event found successfully",
            data: data
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: error.message || "Error finding event"
        });
    }
};

const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (req.file) {
            updateData.image = req.file.filename;
        }

        const data = await Event.findByIdAndUpdate(id, updateData, { new: true });

        if (!data) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Event not found"
            });
        }

        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "event updated successfully",
            data: data
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: error.message || "Error updating event"
        });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Event.findById(id);

        if (!data) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Event not found"
            });
        }

        data.status = !data.status;
        await data.save();

        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Status updated successfully",
            data: data
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: error.message || "Error updating event status"
        });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Event.findByIdAndDelete(id);

        if (!data) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Event not found"
            });
        }

        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "event deleted successfully",
            data: data
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: error.message || "Error deleting event"
        });
    }
};

const viewAllEvent = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10);
        const limit = parseInt(req.query.limit, 10);

        const totalEvents = await Event.countDocuments();
        let query = Event.find().sort({ event_date: -1, createdAt: -1 });

        if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
            const skip = (page - 1) * limit;
            query = query.skip(skip).limit(limit);
        }

        const data = await query;
        const effectiveLimit = limit && limit > 0 ? limit : totalEvents || 10;
        const totalPages = Math.ceil(totalEvents / effectiveLimit) || 1;

        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "events found successfully",
            data: data,
            totalEvents,
            totalPages,
            currentPage: page || 1,
            limit: effectiveLimit,
            hasPrevPage: (page || 1) > 1,
            hasNextPage: (page || 1) < totalPages
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: error.message || "Error fetching events"
        });
    }
};

module.exports = {
    addEvent,
    viewEvent,
    updateEvent,
    updateStatus,
    deleteEvent,
    viewAllEvent
};
