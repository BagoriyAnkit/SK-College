const placement = require("../../model/admin/placement")



const addPlacement = async (req, res) => {
    try {
        const { StudentName,
            CompanyName,
            Package,
            Year,
            JobType,
            Location } = req.body;
        const existing = await placement.findOne({
            StudentName,
            CompanyName,


        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "This placement record already exists"
            });
        }


        const placementData = await placement.create({
            StudentName,
            CompanyName,
            Package,
            Year,
            JobType,
            Location
        });



        return res.status(201).json({
            success: true,
            message: "Placement created successfully",
            data: placementData
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



const getPlacements = async (req, res) => {
    try {
        const placementData = await placement.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: placementData
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const findOnePlacement = async (req, res) => {
    try {
        const { id } = req.params;

        const placementData = await placement.findById(id);

        if (!placementData) {
            return res.status(404).json({
                success: false,
                message: "Placement not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: placementData
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const updatePlacement = async (req, res) => {
    try {
        const { id } = req.params
        const updateData = req.body

        const Placement = await placement.findById(id);

        if (!Placement) {
            return res.status(404).json({
                success: false,
                message: "Placement not found"
            });
        }
        const placementData = await placement.findByIdAndUpdate(id, updateData);

        return res.status(200).json({
            success: true,
            message: "Placement updated successfully",
            data: placementData
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



const deletePlacement = async (req, res) => {
    try {
        const { id } = req.params
        const placementData = await placement.deleteOne({ _id: id })
        res.json({
            status: true,
            statusCode: 200,
            message: "placement deleted successfully",
            data: placementData
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
    addPlacement,
    getPlacements,
    findOnePlacement,
    updatePlacement,
    deletePlacement
}
