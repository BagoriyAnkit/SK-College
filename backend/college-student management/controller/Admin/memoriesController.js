const Memories = require("../../model/admin/memories");

const addMemories = async (req, res) => {
  try {

    const memories = new Memories({
      image: req.file.filename
    });

    await memories.save();

    res.send({
      status: true,
      message: "Memory Added Successfully"
    });

  } catch (error) {
    res.send({
      status: false,
      message: error.message
    });
  }
};

const viewAllMemories = async (req, res) => {
  try {

    const data = await Memories.find();

    res.send({
      status: true,
      data
    });

  } catch (error) {
    res.send({
      status: false,
      message: error.message
    });
  }
};


const findMemories = async (req, res) => {
  try {

    const data = await Memories.findById(req.params.id);

    res.send({
      status: true,
      data
    });

  } catch (error) {
    res.send({
      status: false,
      message: error.message
    });
  }
};


const updateMemories = async (req, res) => {
    try {

        const { id } = req.params;

        const updateData = {
            image: req.file.filename
        };

        const memoriesData = await Memories.updateOne(
            { _id: id },
            updateData
        );

        res.json({
            status: true,
            message: "Update Memories Successfully",
            data: memoriesData
        });

    } catch (error) {

        res.json({
            status: false,
            message: "Error",
            error: error.message
        });

    }
}



const deleteMemories = async (req, res) => {
    try {

        const { id } = req.params;

        const memoriesData = await Memories.deleteOne({ _id: id });

        res.json({
            status: true,
            message: "Delete Memories Successfully",
            data: memoriesData
        });

    } catch (error) {

        res.json({
            status: false,
            message: "Error",
            error: error.message
        });

    }
}


module.exports = {
    addMemories,
    viewAllMemories,
    findMemories,
    updateMemories,
    deleteMemories
}