const notice = require("../../model/admin/notice");

const normalizeNoticePayload = (body) => {
  const data = { ...body };
  if (data.for_whom) {
    const raw = String(data.for_whom).toLowerCase().trim();
    if (raw === "teachers" || raw === "faculty") {
      data.for_whom = "faculty";
    } else if (raw === "students") {
      data.for_whom = "students";
    } else {
      data.for_whom = "all";
    }
  }
  return data;
};

const addNotice = async (req, res) => {
  try {
    const payload = normalizeNoticePayload(req.body);
    const noticeData = await notice.create(payload);
    res.status(201).json({
      status: true,
      statusCode: 201,
      message: "notice added successfully",
      data: noticeData
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Failed to add notice"
    });
  }
};

const findNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const noticeData = await notice.findById(id);

    if (!noticeData) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Notice not found"
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "found notice successfully",
      data: noticeData
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error finding notice"
    });
  }
};

const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = normalizeNoticePayload(req.body);
    const noticeData = await notice.findByIdAndUpdate(id, updateData, { new: true });

    if (!noticeData) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Notice not found"
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "notice updated successfully",
      data: noticeData
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error updating notice"
    });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const noticeData = await notice.findByIdAndDelete(id);

    if (!noticeData) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Notice not found"
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "notice deleted successfully",
      data: noticeData
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error deleting notice"
    });
  }
};

const viewAllNotice = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);

    const totalNotice = await notice.countDocuments();

    let query = notice.find().sort({ createdAt: -1 });

    if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    const noticeData = await query;
    const effectiveLimit = limit && limit > 0 ? limit : totalNotice || 10;
    const totalPages = Math.ceil(totalNotice / effectiveLimit) || 1;

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "found all notice successfully",
      data: noticeData,
      totalNotice,
      totalPages,
      currentPage: page || 1,
      limit: effectiveLimit,
      hasPrevPage: (page || 1) > 1,
      hasNextPage: (page || 1) < totalPages
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "error"
    });
  }
};

module.exports = {
  addNotice,
  findNotice,
  updateNotice,
  deleteNotice,
  viewAllNotice
};
