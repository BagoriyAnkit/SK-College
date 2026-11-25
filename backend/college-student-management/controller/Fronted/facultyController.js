const Faculty = require("../../model/admin/faculty");

// GET ALL
const getAllFaculty = async (req, res) => {
  try {
    const facultyData = await Faculty.find()
      .populate("department", "DepartmentName DepartmentCode Description Status");

    res.json({
      success: true,
      data: facultyData
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET BY ID
const getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;

    const facultyData = await Faculty.findById(id)
      .populate("department", "DepartmentName DepartmentCode Description Status");

    if (!facultyData) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    res.json({
      success: true,
      data: facultyData
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getAllFaculty,
  getFacultyById,
};
