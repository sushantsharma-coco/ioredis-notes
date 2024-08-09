const { signup, logout, signin } = require("../controllers/user.controller");

const router = require("express").Router();

router.route("/sign-up").post(signup);
router.route("/sign-in").post(signin);

router.route("/").get();
router.route("/log-out").get(logout);

module.exports = { router };
