const About = require("../../model/admin/about");

const addAbout = async (req, res) => {
  try {
    const image = req.file ? req.file.filename : "";

    const about = await About.findOne();

    if (about) {
      return res.send({
        status: false,
        message: "About page already exists",
      });
    }

    await About.create({
      ...req.body,
      image,
    });

    res.send({
      status: true,
      message: "About Added Successfully",
    });
  } catch (error) {
    res.send({
      status: false,
      message: error.message,
    });
  }
};

const viewAbout = async (req, res) => {
  try {
    const data = await About.findOne();

    res.send({
      status: true,
      data,
    });
  } catch (error) {
    res.send({
      status: false,
      message: error.message,
    });
  }
};

const updateAbout = async (req, res) => {
  try {
    const image = req.file ? req.file.filename : undefined;

    const updateData = {
      ...req.body,
    };

    if (image) {
      updateData.image = image;
    }

    await About.findByIdAndUpdate(req.params.id, updateData);

    res.send({
      status: true,
      message: "About Updated Successfully",
    });
  } catch (error) {
    res.send({
      status: false,
      message: error.message,
    });
  }
};

module.exports = {
  addAbout,
  viewAbout,
  updateAbout,
};