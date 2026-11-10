const department = require("../../model/admin/department");

const viewAllDepartment = async (req, res) => {
    try {
        const departmentData = await department
            .find({ Status: true })
            .sort({ createdAt: -1 })
            .populate("hod", "TeacherName Email PhoneNumber Qualification status");

        res.json({
            success: true,
            message: "Department found successfully",
            data: departmentData
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};

const findOneDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        const departmentData = await department.findById(id)
            .populate("hod", "TeacherName Email PhoneNumber Qualification status");

        res.json({
            success: true,
            message: "Department found successfully",
            data: departmentData
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    viewAllDepartment,
    findOneDepartment
};
