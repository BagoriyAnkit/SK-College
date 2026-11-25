const mongoose = require("mongoose");
const faculty = require("../../model/admin/faculty");
const department = require("../../model/admin/department");

// Helper to resolve department reference from either ObjectId, name string, or object
const resolveDepartmentId = async (input) => {
    if (!input) return { departmentId: null, departmentName: "" };

    if (typeof input === "object" && input !== null) {
        if (input._id) {
            return { departmentId: input._id, departmentName: input.DepartmentName || "" };
        }
    }

    const inputStr = String(input).trim();
    if (mongoose.Types.ObjectId.isValid(inputStr) && String(new mongoose.Types.ObjectId(inputStr)) === inputStr) {
        const dept = await department.findById(inputStr);
        if (dept) {
            return { departmentId: dept._id, departmentName: dept.DepartmentName };
        }
    }

    // Match by department name (case-insensitive)
    const deptByName = await department.findOne({
        DepartmentName: { $regex: new RegExp("^" + inputStr + "$", "i") }
    });
    if (deptByName) {
        return { departmentId: deptByName._id, departmentName: deptByName.DepartmentName };
    }

    // Match by department code (case-insensitive)
    const deptByCode = await department.findOne({
        DepartmentCode: { $regex: new RegExp("^" + inputStr + "$", "i") }
    });
    if (deptByCode) {
        return { departmentId: deptByCode._id, departmentName: deptByCode.DepartmentName };
    }

    return { departmentId: null, departmentName: inputStr };
};

const addfaculty = async (req, res) => {
    try {
        const { Email } = req.body;
        const existingfaculty = await faculty.findOne({ Email: Email.toLowerCase().trim() });
        if (existingfaculty) {
            return res.status(409).json({
                status: false,
                statusCode: 409,
                message: "Faculty already exists"
            });
        }

        const deptInput = req.body.department || req.body.Department || req.body.departmentId;
        const { departmentId, departmentName } = await resolveDepartmentId(deptInput);

        const payload = {
            ...req.body,
            Email: Email.toLowerCase().trim(),
            department: departmentId,
            Department: departmentName || req.body.Department || ""
        };

        const facultyData = await faculty.create(payload);
        const populatedData = await faculty.findById(facultyData._id)
            .populate("department", "DepartmentName DepartmentCode Description Status");

        res.status(201).json({
            status: true,
            statusCode: 201,
            message: "Faculty added successfully",
            data: populatedData || facultyData
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

const findFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const facultyData = await faculty.findOne({ _id: id })
            .populate("department", "DepartmentName DepartmentCode Description Status")
            .populate("userId", "name email phone role");

        if (!facultyData) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Faculty not found"
            });
        }
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Faculty found successfully",
            data: facultyData
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

const updateFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        const deptInput = updateData.department !== undefined ? updateData.department : (updateData.Department !== undefined ? updateData.Department : updateData.departmentId);
        if (deptInput !== undefined) {
            const { departmentId, departmentName } = await resolveDepartmentId(deptInput);
            updateData.department = departmentId;
            if (departmentName) {
                updateData.Department = departmentName;
            }
        }

        if (updateData.Email) {
            updateData.Email = updateData.Email.toLowerCase().trim();
        }

        const facultyData = await faculty.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate("department", "DepartmentName DepartmentCode Description Status");

        if (!facultyData) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: "Faculty not found"
            });
        }

        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Faculty updated successfully",
            data: facultyData
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

const deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;

        // If this faculty was assigned as HOD of any department, unassign the HOD reference
        await department.updateMany({ hod: id }, { $set: { hod: null } });

        const facultyData = await faculty.deleteOne({ _id: id });
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Faculty deleted successfully",
            data: facultyData
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

const viewAllFaculty = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const totalFaculty = await faculty.countDocuments();

        const facultyData = await faculty.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("department", "DepartmentName DepartmentCode Description Status");

        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "facultyfound successfully",
            data: facultyData,
            currentPage: page,
            totalPages: Math.ceil(totalFaculty / limit),
            totalFaculty,
            limit,
            hasPrevPage: page > 1,
            hasNextPage: page < Math.ceil(totalFaculty / limit),
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

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const teacherData = await faculty.findById(id);

        if (!teacherData) {
            return res.status(404).json({
                status: false,
                message: "Teacher not found",
            });
        }

        teacherData.status =
            teacherData.status === "Active" ? "Inactive" : "Active";

        await teacherData.save();

        res.json({
            status: true,
            message: "Status updated successfully",
            data: teacherData,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

const { linkFacultyToAdminUser, unlinkFaculty } = require("../../utils/accountLinker");
const AdminUser = require("../../model/admin/user");

const linkAccount = async (req, res) => {
    try {
        const { facultyId, userId } = req.body;
        const result = await linkFacultyToAdminUser({ facultyId, userId });
        return res.status(result.statusCode).json(result);
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

const unlinkAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await unlinkFaculty(id);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

const getLinkStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const fac = await faculty.findById(id)
            .populate("userId", "name email phone role")
            .populate("department", "DepartmentName DepartmentCode Description Status");

        if (!fac) {
            return res.status(404).json({ status: false, message: "Faculty not found" });
        }
        return res.status(200).json({
            status: true,
            isLinked: Boolean(fac.userId),
            faculty: {
                id: fac._id,
                name: fac.TeacherName,
                email: fac.Email,
                department: fac.Department,
                departmentId: fac.department?._id || null
            },
            linkedAccount: fac.userId || null
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

module.exports = {
    addfaculty,
    findFaculty,
    updateFaculty,
    deleteFaculty,
    viewAllFaculty,
    updateStatus,
    linkAccount,
    unlinkAccount,
    getLinkStatus
};
