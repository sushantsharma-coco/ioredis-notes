const {
  createNotes,
  getSingleNote,
  getAllNotes,
  updateSingleNote,
} = require("../controllers/notes.controller");
const { auth } = require("../middlewares/auth.middleware");

const router = require("express").Router();

router.use(auth);
router.route("/").post(createNotes).get(getAllNotes);
router.route("/:title").get(getSingleNote).patch(updateSingleNote);

module.exports = { router };
