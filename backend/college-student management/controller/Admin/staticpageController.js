const staticPage = require("../../model/admin/staticpage");

const addStaticPage = async (req, res) => {

    try {

        if (req.file) {
            req.body.image = req.file.filename;
        }

        const staticPageData = await staticPage.create(req.body);

        res.json({
            status: true,
            message: "Static Page added successfully",
            data: staticPageData
        });

    } catch (error) {
        res.json({
            status: false,
            message: error
        });
    }
};

const findStaticPage = async (req, res) => {

    try {

        const { id } = req.params;

        const staticPageData = await staticPage.findOne({ _id: id });

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


const findStaticPageBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const data = await staticPage.findOne({ slug: req.params.slug });

        res.json({
            status: true,
            data
        });
    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
    }
};

const updateStaticPage = async (req, res) => {

    try {

        const { id } = req.params;

        const updateData = req.body;

        const staticPageData = await staticPage.updateOne(
            { _id: id },
            updateData
        );

        res.json({
            status: true,
            statusCode: 200,
            message: "Static Page updated successfully",
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

const deleteStaticPage = async (req, res) => {

    try {

        const { id } = req.params;

        const staticPageData = await staticPage.deleteOne({ _id: id });

        res.json({
            status: true,
            statusCode: 200,
            message: "Static Page deleted successfully",
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

const viewAllStaticPage = async (req, res) => {

    try {

        const staticPageData = await staticPage.find().sort({ createdAt: -1 });
        console.log(staticPageData, 'staticPageData');

        res.json({
            status: true,
            statusCode: 200,
            message: "Found all Static Pages successfully",
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
    addStaticPage,
    findStaticPage,
    findStaticPageBySlug,
    updateStaticPage,
    deleteStaticPage,
    viewAllStaticPage
};