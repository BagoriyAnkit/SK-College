const Memories = require("../../model/admin/memories");

const addMemories = async (req, res) => {
  try {
    const filename = req.file ? req.file.filename : (req.body.image || "");
    const memories = new Memories({
      image: filename
    });

    await memories.save();

    res.status(201).json({
      status: true,
      statusCode: 201,
      message: "Memory Added Successfully",
      data: memories
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message
    });
  }
};

const viewAllMemories = async (req, res) => {
  try {
    const data = await Memories.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      statusCode: 200,
      data
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message
    });
  }
};

const findMemories = async (req, res) => {
  try {
    const data = await Memories.findById(req.params.id);

    if (!data) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Memory record not found"
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      data
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message
    });
  }
};

const updateMemories = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    if (req.file && req.file.filename) {
      updateData.image = req.file.filename;
    } else if (req.body.image) {
      updateData.image = req.body.image;
    }

    const memoriesData = await Memories.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!memoriesData) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Memory record not found"
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Update Memories Successfully",
      data: memoriesData
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Error updating memory",
      error: error.message
    });
  }
};

const deleteMemories = async (req, res) => {
  try {
    const { id } = req.params;
    const memoriesData = await Memories.findByIdAndDelete(id);

    if (!memoriesData) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Memory record not found"
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Delete Memories Successfully",
      data: memoriesData
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Error deleting memory",
      error: error.message
    });
  }
};

module.exports = {
  addMemories,
  viewAllMemories,
  findMemories,
  updateMemories,
  deleteMemories
};