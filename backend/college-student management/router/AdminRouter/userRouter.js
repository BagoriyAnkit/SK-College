const express = require("express");
const userRouter = express.Router();

const controller = require("../../controller/Admin/userController");

userRouter.post("/login", controller.adminLogin);
userRouter.get("/profile", controller.getProfile);
userRouter.post("/add", controller.createUser);
userRouter.get("/viewAll", controller.findAllUser);
userRouter.get("/viewall", controller.findAllUser);
userRouter.get("/find/:id", controller.findUser);
userRouter.get("/findOne/:id", controller.findUser);
userRouter.put("/update/:id", controller.updateUser);
userRouter.put("/:id", controller.updateUser);
userRouter.put("/statusUpdate/:id", controller.updateStatus);
userRouter.patch("/status/:id", controller.updateStatus);
userRouter.delete("/delete/:id", controller.deleteUser);
userRouter.get("/audit-links", controller.auditAccounts);

module.exports = userRouter;
