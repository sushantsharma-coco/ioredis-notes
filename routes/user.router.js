const { signup } = require("../controllers/user.controller");

const router = require("express").Router();

router.route("/sign-up").post(signup);

module.exports = { router };
