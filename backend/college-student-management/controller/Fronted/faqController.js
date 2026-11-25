const faq = require("../../model/admin/Faq");

// View All Active FAQ
const viewAllFaq = async (req, res) => {
    try {

        const faqData = await faq
            .find({ status: true })
            .sort({ createdAt: -1 });

        res.json({
            status: true,
            statusCode: 200,
            message: "FAQ fetched successfully",
            data: faqData
        });

    } catch (error) {

        res.json({
            status: false,
            statusCode: 500,
            message: error.message
        });

    }
};

// Find One FAQ
const findOneFaq = async (req, res) => {
    try {

        const { id } = req.params;

        const faqData = await faq.findOne({
            _id: id,
            status: true
        });

        res.json({
            status: true,
            statusCode: 200,
            message: "FAQ fetched successfully",
            data: faqData
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
    viewAllFaq,
    findOneFaq
};