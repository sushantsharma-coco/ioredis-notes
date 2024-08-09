const {
  logout,
  signin,
  currentUser,
} = require("../controllers/user.controller");
const { auth } = require("../middlewares/auth.middleware");

const router = require("express").Router();

// router.route("/sign-up").post(signup);

router.route("/sign-in").post(signin);

router.use(auth);
router.route("/").get(currentUser);
router.route("/log-out").get(logout);

module.exports = { router };
