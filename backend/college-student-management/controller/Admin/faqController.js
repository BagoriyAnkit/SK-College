const faq = require("../../model/admin/faq");

// Add FAQ
const addFaq = async (req, res) => {
    try {

        const faqData = await faq.create(req.body);

        res.json({
            status: true,
            message: "FAQ added successfully",
            data: faqData
        });

    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
    }
};

// Find One FAQ
const findFaq = async (req, res) => {
    try {

        const { id } = req.params;

        const faqData = await faq.findOne({ _id: id });

        res.json({
            status: true,
            statusCode: 200,
            message: "FAQ found successfully",
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

// Update FAQ
const updateFaq = async (req, res) => {
    try {

        const { id } = req.params;

        const updateData = req.body;

        const faqData = await faq.updateOne(
            { _id: id },
            updateData
        );

        res.json({
            status: true,
            statusCode: 200,
            message: "FAQ updated successfully",
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

// Delete FAQ
const deleteFaq = async (req, res) => {
    try {

        const { id } = req.params;

        const faqData = await faq.deleteOne({ _id: id });

        res.json({
            status: true,
            statusCode: 200,
            message: "FAQ deleted successfully",
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

// View All FAQ
const viewAllFaq = async (req, res) => {
    try {

        const faqData = await faq.find().sort({ createdAt: -1 });

        res.json({
            status: true,
            statusCode: 200,
            message: "Found all FAQs successfully",
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
// Update FAQ Status
const updateFaqStatus = async (req, res) => {
    try {

        const { id } = req.params;

        const faqData = await faq.findById(id);

        await faq.updateOne(
            { _id: id },
            {
                status: !faqData.status,
            }
        );

        res.json({
            status: true,
            statusCode: 200,
            message: "FAQ status updated successfully",
        });

    } catch (error) {
        res.json({
            status: false,
            statusCode: 500,
            message: error.message,
        });
    }
};

module.exports = {
    addFaq,
    findFaq,
    updateFaq,
    deleteFaq,
    viewAllFaq,
    updateFaqStatus
};