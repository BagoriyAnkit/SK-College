const notice = require("../../model/admin/notice");

const addNotice = async (req, res) => {
  try {
    const noticeData = await notice.create(req.body);
    res.json({
      status: true,
      message: "notice added successfully",
      data: noticeData
    });
  } catch (error) {
    res.json({
      status: false,
      message: error.message || error
    });
  }
};

const findNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const noticeData = await notice.findOne({ _id: id });
    res.json({
      status: true,
      statusCode: 200,
      message: "found notice successfully",
      data: noticeData
    });
  } catch (error) {
    res.json({
      status: false,
      statusCode: 500,
      message: "error"
    });
  }
};

const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const noticeData = await notice.updateOne({ _id: id }, updateData);
    res.json({
      status: true,
      statusCode: 200,
      message: "notice updated successfully",
      data: noticeData
    });
  } catch (error) {
    res.json({
      status: false,
      statusCode: 500,
      message: "error"
    });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const noticeData = await notice.deleteOne({ _id: id });
    res.json({
      status: true,
      statuscode: 200,
      message: "notice deleted successfully",
      data: noticeData
    });
  } catch (error) {
    res.json({
      status: false,
      statuscode: 500,
      message: "error"
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
