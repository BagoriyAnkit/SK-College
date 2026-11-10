const mongoose = require("mongoose");
const department = require("../../model/admin/department");
const Faculty = require("../../model/admin/faculty");

// Helper to resolve faculty reference from either ObjectId, name string, or object
const resolveFacultyId = async (input) => {
    if (!input) return { facultyId: null, facultyName: "" };

    if (typeof input === "object" && input !== null) {
        if (input._id) {
            return { facultyId: input._id, facultyName: input.TeacherName || "" };
        }
    }

    const inputStr = String(input).trim();
    if (mongoose.Types.ObjectId.isValid(inputStr) && String(new mongoose.Types.ObjectId(inputStr)) === inputStr) {
        const fac = await Faculty.findById(inputStr);
        if (fac) {
            return { facultyId: fac._id, facultyName: fac.TeacherName };
        }
    }

    // Try finding by exact name or case-insensitive match (stripping any "Dr." prefix)
    const cleanName = inputStr.replace(/^[dD][rR]\.?\s*/, "").trim();
    const facByName = await Faculty.findOne({
        TeacherName: { $regex: new RegExp("^" + cleanName + "$", "i") }
    });
    if (facByName) {
        return { facultyId: facByName._id, facultyName: facByName.TeacherName };
    }

    return { facultyId: null, facultyName: inputStr };
};

// Add Department
const addDepartment = async (req, res) => {
    try {
        const { DepartmentCode } = req.body;

        const existingDepartment = await department.findOne({
            DepartmentCode: { $regex: new RegExp("^" + DepartmentCode.trim() + "$", "i") }
        });

        if (existingDepartment) {
            return res.status(409).json({
                status: false,
                statusCode: 409,
                message: "Department already exists"
            });
        }

        const hodInput = req.body.hod || req.body.HOD || req.body.hodId;
        const { facultyId, facultyName } = await resolveFacultyId(hodInput);

        const payload = {
            ...req.body,
            hod: facultyId,
            HOD: facultyName || req.body.HOD || ""
        };

        const departmentData = await department.create(payload);
        const populatedData = await department.findById(departmentData._id)
            .populate("hod", "TeacherName Email PhoneNumber Qualification status");

        res.status(201).json({
            status: true,
            statusCode: 201,
            message: "Department added successfully",
            data: populatedData || departmentData
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "error",
            error: error.message
        });
    }
};

// Find One Department
const findDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        const departmentData = await department.findOne({ _id: id })
            .populate("hod", "TeacherName Email PhoneNumber Qualification status");

        if (!departmentData) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Department not found"
            });
        }

        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Department found successfully",
            data: departmentData
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "error",
            error: error.message
        });
    }
};

// Update Department
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        const hodInput = updateData.hod !== undefined ? updateData.hod : (updateData.HOD !== undefined ? updateData.HOD : updateData.hodId);
        if (hodInput !== undefined) {
            const { facultyId, facultyName } = await resolveFacultyId(hodInput);
            updateData.hod = facultyId;
            if (facultyName) {
                updateData.HOD = facultyName;
            }
        }

        const departmentData = await department.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate("hod", "TeacherName Email PhoneNumber Qualification status");

        if (!departmentData) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Department not found"
            });
        }

        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Department updated successfully",
            data: departmentData
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "error",
            error: error.message
        });
    }
};

// Delete Department
const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        const departmentData = await department.deleteOne({ _id: id });

        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Department deleted successfully",
            data: departmentData
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "error",
            error: error.message
        });
    }
};

// View All Department
const viewAllDepartment = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const totalDepartment = await department.countDocuments();

        const departmentData = await department
            .find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("hod", "TeacherName Email PhoneNumber Qualification status");

        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Department found successfully",
            data: departmentData,
            currentPage: page,
            totalPages: Math.ceil(totalDepartment / limit),
            totalDepartment,
            limit,
            hasPrevPage: page > 1,
            hasNextPage: page < Math.ceil(totalDepartment / limit),
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            status: false,
            statusCode: 500,
            message: error.message,
        });
    }
};

// Update Status
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const departmentData = await department.findById(id);

        if (!departmentData) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Department not found"
            });
        }

        // Toggle Status (true -> false, false -> true)
        departmentData.Status = !departmentData.Status;

        await departmentData.save();

        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Status updated successfully",
            data: departmentData
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            status: false,
            statusCode: 500,
            message: error.message
        });
    }
};

module.exports = {
    addDepartment,
    findDepartment,
    updateDepartment,
    deleteDepartment,
    viewAllDepartment,
    updateStatus
};
