const Batch = require("../../model/admin/batch");

// View All Batch
const viewAllBatch = async (req, res) => {
    try {
        const batchData = await Batch.find({ status: true })
            .populate("course", "courseName courseCode duration totalSemester department status")
            .populate("classTeacher", "TeacherName Email PhoneNumber Department Qualification Experience status")
            .sort({ createdAt: -1 });

        res.json({
            status: true,
            statusCode: 200,
            message: "Batch found successfully",
            data: batchData
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Error",
            error: error.message
        });
    }
};

// View One Batch
const findBatch = async (req, res) => {
    try {
        const { id } = req.params;

        const batchData = await Batch.findOne({
            _id: id,
            status: true
        })
        .populate("course", "courseName courseCode duration totalSemester department status")
        .populate("classTeacher", "TeacherName Email PhoneNumber Department Qualification Experience status");

        res.json({
            status: true,
            statusCode: 200,
            message: "Batch found successfully",
            data: batchData
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Error",
            error: error.message
        });
    }
};

module.exports = {
    viewAllBatch,
    findBatch
};
