const staticPage = require("../../model/admin/staticpage");

// View All Static Pages
const viewAllStaticPage = async (req, res) => {

    try {

        const staticPageData = await staticPage.find().sort({ createdAt: -1 });

        res.json({
            status: true,
            statusCode: 200,
            message: "Found all Static Pages successfully",
            data: staticPageData
        });

    } catch (error) {
        console.log(error);
        res.json({
            status: false,
            statusCode: 500,
            message: error.message
        });

    }
};


// Find Static Page By Slug
const findStaticPageBySlug = async (req, res) => {

    try {

        const { slug } = req.params;

        const staticPageData = await staticPage.findOne({ slug: slug });

        res.json({
            status: true,
            statusCode: 200,
            message: "Found Static Page successfully",
            data: staticPageData
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
    viewAllStaticPage,
    findStaticPageBySlug
};