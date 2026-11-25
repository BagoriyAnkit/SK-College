const Memories = require("../../model/admin/memories");


const viewAllMemories = async (req, res) => {

    try {

        const data = await Memories.find();

        res.json({
            status: true,
            data: data
        });

    } catch (error) {

        res.json({
            status: false,
            message: error.message
        });

    }

};


module.exports = {
    viewAllMemories
};