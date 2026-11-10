const notice = require("../../model/admin/notice");

// View All Active Notices
const viewAllNotice = async (req, res) => {
    try {

        const noticeData = await notice
            .find()
            .sort({ createdAt: -1 });

        res.json({
            status: true,
            statusCode: 200,
            message: "Notice fetched successfully",
            data: noticeData
        });

    } catch (error) {

        res.json({
            status: false,
            statusCode: 500,
            message: error.message
        });

    }
};

// Find One Notice
const findOneNotice = async (req, res) => {
    try {

        const { id } = req.params;

        const noticeData = await notice.findOne({_id: id,});

        res.json({
            status: true,
            statusCode: 200,
            message: "Notice fetched successfully",
            data: noticeData
        });

    } catch (error) {

        res.json({
            status: false,
            statusCode: 500,
            message: error.message
        });

    }
};

module.exports = {
    viewAllNotice,
    findOneNotice
};