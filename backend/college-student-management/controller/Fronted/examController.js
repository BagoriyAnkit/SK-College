const exam = require("../../model/admin/exam");


// View All Exam
const viewAllExam = async (req, res) => {

    try {

        const exams = await exam.find()
            .sort({ createdAt: -1 });

        res.json({
            status: true,
            statusCode: 200,
            message: "exams found successfully",
            data: exams
        });

    } catch (error) {

        res.json({
            status: false,
            statusCode: 500,
            message: "error"
        });

    }
};


// Find One Exam
const findExam = async (req, res) => {

    try {

        const { id } = req.params;

        const examData = await exam.findOne({ _id: id });

        res.json({
            status: true,
            statusCode: 200,
            message: "found exam successfully",
            data: examData
        });

    } catch (error) {

        res.json({
            status: false,
            statusCode: 500,
            message: "error"
        });

    }
};


module.exports = {
    viewAllExam,
    findExam
};