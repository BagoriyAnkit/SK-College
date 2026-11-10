const mongoose = require("mongoose");
const User = require("../../model/fronted/register");
const Admin = require("../../model/admin/user");
const Faculty = require("../../model/admin/faculty");
const Department = require("../../model/admin/department");
const { comparePassword, hashPassword } = require("../../utils/byrypt");
const { generateToken } = require("../../utils/jwt");
const { auditAndLinkAccounts } = require("../../utils/accountLinker");

/**
 * 1. Find all staff users with pagination, role filtering, and search.
 * Excludes sensitive password hash from response.
 */
const findAllUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role && req.query.role !== "all") {
      filter.role = String(req.query.role).toLowerCase().trim();
    }
    if (req.query.search) {
      const searchTrimmed = String(req.query.search).trim();
      const searchRegex = new RegExp(searchTrimmed, "i");
      const orClauses = [
        { name: searchRegex },
        { email: searchRegex }
      ];
      if (!isNaN(Number(searchTrimmed))) {
        orClauses.push({ phone: Number(searchTrimmed) });
      }
      filter.$or = orClauses;
    }

    const totalUsers = await Admin.countDocuments(filter);

    const userData = await Admin.find(filter)
      .select("-password")
      .populate({
        path: "facultyId",
        select: "TeacherName Email Department department PhoneNumber status",
        populate: { path: "department", select: "DepartmentName DepartmentCode" }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Users found successfully",
      data: userData,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit) || 1,
      totalUsers,
      limit,
      hasPrevPage: page > 1,
      hasNextPage: page < (Math.ceil(totalUsers / limit) || 1)
    });
  } catch (error) {
    console.error("FIND ALL USERS ERROR:", error);
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Failed to fetch users"
    });
  }
};

/**
 * 2. Find a single staff user by ID
 */
const findUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Invalid User ID format"
      });
    }

    let user = await Admin.findById(id)
      .select("-password")
      .populate({
        path: "facultyId",
        select: "TeacherName Email Department department PhoneNumber status",
        populate: { path: "department", select: "DepartmentName DepartmentCode" }
      });

    if (!user) {
      // Fallback check in frontend user model
      user = await User.findById(id).select("-password");
    }

    if (!user) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "User not found"
      });
    }

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "User found successfully",
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Failed to find user"
    });
  }
};

/**
 * 3. Create a new staff account (HOD, Teacher, Accountant, Admin)
 * Handles reciprocal linking with Faculty and Department records.
 */
const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, status, address, dob, facultyId, departmentId } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Email and password are required"
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await Admin.findOne({ email: cleanEmail });

    if (existing) {
      return res.status(409).json({
        status: false,
        statusCode: 409,
        message: "A staff account with this email already exists"
      });
    }

    const assignedRole = role ? String(role).toLowerCase().trim() : "staff";
    const validRoles = ["admin", "subadmin", "staff", "hod", "teacher", "accountant", "student"];
    if (!validRoles.includes(assignedRole)) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: `Invalid role. Allowed roles: ${validRoles.join(", ")}`
      });
    }

    const hashedPassword = await hashPassword(password);

    // Resolve faculty record if provided
    let linkedFaculty = null;
    if (facultyId && mongoose.Types.ObjectId.isValid(facultyId)) {
      linkedFaculty = await Faculty.findById(facultyId);
    } else if (cleanEmail) {
      // Auto-match by email if faculty exists with the exact same email
      linkedFaculty = await Faculty.findOne({ Email: new RegExp(`^${cleanEmail}$`, "i") });
    }

    const newUser = await Admin.create({
      name: name || linkedFaculty?.TeacherName || "Staff User",
      email: cleanEmail,
      password: hashedPassword,
      phone: phone || linkedFaculty?.PhoneNumber,
      role: assignedRole,
      status: status || "Active",
      address,
      dob,
      facultyId: linkedFaculty ? linkedFaculty._id : null
    });

    // Update reciprocal link on Faculty and Department
    if (linkedFaculty) {
      linkedFaculty.userId = newUser._id;

      // If assigned role is HOD, ensure department association is synchronized
      if (assignedRole === "hod") {
        if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) {
          const dept = await Department.findById(departmentId);
          if (dept) {
            dept.hod = linkedFaculty._id;
            dept.HOD = linkedFaculty.TeacherName || newUser.name;
            await dept.save();

            linkedFaculty.department = dept._id;
            linkedFaculty.Department = dept.DepartmentName;
          }
        } else if (linkedFaculty.department) {
          await Department.findByIdAndUpdate(linkedFaculty.department, {
            hod: linkedFaculty._id,
            HOD: linkedFaculty.TeacherName || newUser.name
          });
        }
      }

      await linkedFaculty.save();
    }

    return res.status(201).json({
      status: true,
      statusCode: 201,
      message: "Staff user created successfully",
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
        facultyId: newUser.facultyId
      }
    });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error creating user"
    });
  }
};

/**
 * 4. Update staff user details
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Invalid User ID format"
      });
    }

    const user = await Admin.findById(id);
    if (!user) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Staff user not found"
      });
    }

    const { name, phone, role, status, address, dob, password, facultyId, departmentId } = req.body;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (dob !== undefined) user.dob = dob;

    if (status && ["Active", "Inactive"].includes(status)) {
      user.status = status;
    }

    if (role) {
      const assignedRole = String(role).toLowerCase().trim();
      const validRoles = ["admin", "subadmin", "staff", "hod", "teacher", "accountant", "student"];
      if (validRoles.includes(assignedRole)) {
        user.role = assignedRole;
      }
    }

    // Update password if provided
    if (password && String(password).trim().length >= 6) {
      user.password = await hashPassword(String(password).trim());
    }

    // Handle faculty link changes
    if (facultyId !== undefined) {
      const oldFacultyId = user.facultyId;
      if (facultyId && mongoose.Types.ObjectId.isValid(facultyId)) {
        if (!oldFacultyId || String(oldFacultyId) !== String(facultyId)) {
          if (oldFacultyId) {
            await Faculty.findByIdAndUpdate(oldFacultyId, { userId: null });
          }
          user.facultyId = facultyId;
          const newFaculty = await Faculty.findById(facultyId);
          if (newFaculty) {
            newFaculty.userId = user._id;

            // Synchronize HOD department link if applicable
            if (user.role === "hod") {
              if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) {
                const dept = await Department.findById(departmentId);
                if (dept) {
                  dept.hod = newFaculty._id;
                  dept.HOD = newFaculty.TeacherName || user.name;
                  await dept.save();
                  newFaculty.department = dept._id;
                  newFaculty.Department = dept.DepartmentName;
                }
              } else if (newFaculty.department) {
                await Department.findByIdAndUpdate(newFaculty.department, {
                  hod: newFaculty._id,
                  HOD: newFaculty.TeacherName || user.name
                });
              }
            }

            await newFaculty.save();
          }
        }
      } else if (facultyId === null || facultyId === "") {
        // Unlink faculty
        if (oldFacultyId) {
          await Faculty.findByIdAndUpdate(oldFacultyId, { userId: null });
        }
        user.facultyId = null;
      }
    }

    await user.save();

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Staff user updated successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        facultyId: user.facultyId
      }
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error updating user"
    });
  }
};

/**
 * 5. Update user status (Active / Inactive toggle)
 */
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Invalid User ID format"
      });
    }

    // Try finding staff user in Admin model first
    let user = await Admin.findById(id);
    let isStaff = true;

    if (!user) {
      // Fallback to frontend User model
      user = await User.findById(id);
      isStaff = false;
    }

    if (!user) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "User not found"
      });
    }

    user.status = user.status === "Active" ? "Inactive" : "Active";
    await user.save();

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: `User status updated to ${user.status} successfully`,
      data: {
        id: user._id,
        status: user.status,
        isStaff
      }
    });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Failed to update user status"
    });
  }
};

/**
 * 6. Delete user
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Invalid User ID format"
      });
    }

    // Check Admin staff user
    const adminUser = await Admin.findById(id);
    if (adminUser) {
      if (adminUser.facultyId) {
        await Faculty.findByIdAndUpdate(adminUser.facultyId, { userId: null });
      }
      await Admin.findByIdAndDelete(id);
      return res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Staff user deleted successfully"
      });
    }

    // Fallback to frontend user
    const frontendUser = await User.findByIdAndDelete(id);
    if (frontendUser) {
      return res.status(200).json({
        status: true,
        statusCode: 200,
        message: "User deleted successfully"
      });
    }

    return res.status(404).json({
      status: false,
      statusCode: 404,
      message: "User not found"
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Failed to delete user"
    });
  }
};

/**
 * 7. Admin / Staff Login
 * Verifies credentials, checks active status, verifies reciprocal faculty link.
 */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Email and password are required"
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const admin = await Admin.findOne({ email: cleanEmail });

    if (!admin) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Admin account not found with this email"
      });
    }

    // Enforce Active status: Inactive accounts cannot log in
    if (admin.status === "Inactive") {
      return res.status(403).json({
        status: false,
        statusCode: 403,
        message: "Your account is inactive. Please contact the system administrator."
      });
    }

    const isMatch = await comparePassword(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        status: false,
        statusCode: 401,
        message: "Invalid email or password"
      });
    }

    const role = String(admin.role || "admin").toLowerCase();

    // Resolve and verify linked faculty profile via reciprocal database check
    let facultyRecord = null;
    let verifiedFacultyId = null;
    if (admin.facultyId) {
      const potentialFaculty = await Faculty.findById(admin.facultyId);
      if (potentialFaculty && String(potentialFaculty.userId) === String(admin._id)) {
        facultyRecord = potentialFaculty;
        verifiedFacultyId = potentialFaculty._id;
      }
    } else {
      // Auto-check if faculty matches by userId or email
      const potentialFaculty = await Faculty.findOne({
        $or: [{ userId: admin._id }, { Email: cleanEmail }]
      });
      if (potentialFaculty) {
        facultyRecord = potentialFaculty;
        verifiedFacultyId = potentialFaculty._id;
        admin.facultyId = potentialFaculty._id;
        potentialFaculty.userId = admin._id;
        await Promise.all([admin.save(), potentialFaculty.save()]);
      }
    }

    const payload = {
      id: admin._id,
      email: admin.email,
      role: role,
      name: admin.name,
      facultyId: verifiedFacultyId
    };

    const token = await generateToken(payload);

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Login Successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: role,
        status: admin.status || "Active",
        facultyId: verifiedFacultyId,
        facultyProfile: facultyRecord
          ? {
              id: facultyRecord._id,
              teacherName: facultyRecord.TeacherName,
              department: facultyRecord.Department,
              status: facultyRecord.status
            }
          : null
      },
      user: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: role,
        status: admin.status || "Active",
        facultyId: verifiedFacultyId
      }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

/**
 * 8. Get current profile
 */
const getProfile = async (req, res) => {
  try {
    const adminUser = await Admin.findById(req.user.id)
      .select("-password")
      .populate("facultyId");

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Profile fetched successfully",
      user: adminUser || req.user
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message
    });
  }
};

/**
 * 9. Audit account links
 */
const auditAccounts = async (req, res) => {
  try {
    const auditResult = await auditAndLinkAccounts();
    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Account linking audit executed successfully",
      audit: auditResult
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message
    });
  }
};

module.exports = {
  findAllUser,
  findUser,
  createUser,
  updateUser,
  updateStatus,
  deleteUser,
  adminLogin,
  getProfile,
  auditAccounts
};
