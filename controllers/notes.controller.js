const { ApiError } = require("../utils/ApiError.utils");
const { ApiResponse } = require("../utils/ApiResponse.utils");
const { redisClient } = require("./user.controller");

const createNotes = async (req, res) => {
  try {
    const { title, content, color } = req.body;

    if (!title || !content || !color)
      throw new ApiError(400, "all fields are required");

    const key = `notes:${req.email.split("@gmail.com")[0]}:${title}`;
    console.log(key);

    const note = await redisClient.hset(
      key,
      "title",
      title,
      "content",
      content,
      "color",
      color
    );

    if (note == 0) throw new ApiError(409, "note with title already exists");

    let userkey = `user:${req.email.split("@gmail.com")[0]}`;
    let notes = await redisClient.hget(userkey, "notes");

    if (!notes) await redisClient.hset(userkey, "notes", title);
    else await redisClient.hset(userkey, "notes", notes + "," + title);

    return res
      .status(201)
      .send(new ApiResponse(201, note, "note created successfully"));
  } catch (error) {
    console.error("error occured :", error?.message);

    return res
      .status(error?.statusCode || 500)
      .send(
        new ApiError(
          error?.statusCode || 500,
          error?.message || "unauthorised user",
          error?.errors
        )
      );
  }
};

const getSingleNote = async (req, res) => {
  try {
    const { title } = req.params;

    const key = `notes:${req.email.split("@gmail.com")[0]}:${title}`;

    const note = await redisClient.hgetall(key);

    if (!Object.keys(note).length)
      throw new ApiError(404, "note with title not found");

    return res
      .status(200)
      .send(new ApiResponse(200, note, "note fetched successfully"));
  } catch (error) {
    console.error("error occured :", error?.message);

    return res
      .status(error?.statusCode || 500)
      .send(
        new ApiError(
          error?.statusCode || 500,
          error?.message || "unauthorised user",
          error?.errors
        )
      );
  }
};

const getAllNotes = async (req, res) => {
  try {
    let noteKey = `notes:${req.email.split("@gmail.com")[0]}`;
    let userkey = `user:${req.email.split("@gmail.com")[0]}`;

    let notes = await redisClient.hget(userkey, "notes");
    if (notes == undefined || !notes.length)
      throw new ApiError(404, "no notes found");

    notes = notes.split(",");

    let notesArr = [];

    for (let i = 0; i < notes.length; i++) {
      let note = await redisClient.hgetall(noteKey + ":" + notes[i]);
      if (Object.keys(note).length) notesArr.push(note);
    }

    return res
      .status(200)
      .send(new ApiResponse(200, notesArr, "all notes fetched successfully"));
  } catch (error) {
    console.error("error occured :", error?.message);

    return res
      .status(error?.statusCode || 500)
      .send(
        new ApiError(
          error?.statusCode || 500,
          error?.message || "unauthorised user",
          error?.errors
        )
      );
  }
};

const updateNote = async (req, res) => {
  try {
    const { title } = req.params;

    const { content, color } = req.body;

    if (!content && !color)
      throw new ApiError(400, "content and color required to update");

    const key = `notes:${req.email.split("@gmail.com")[0]}:${title}`;
    console.log(key);

    const note = await redisClient.hset(
      key,
      "content",
      content,
      "color",
      color
    );

    return res
      .status(200)
      .send(new ApiResponse(200, note, "note updated successfully"));
  } catch (error) {
    console.error("error occured :", error?.message);

    return res
      .status(error?.statusCode || 500)
      .send(
        new ApiError(
          error?.statusCode || 500,
          error?.message || "unauthorised user",
          error?.errors
        )
      );
  }
};

const deleteNote = async (req, res) => {
  try {
    const { title } = req.params;

    const key = `notes:${req.email.split("@gmail.com")[0]}:${title}`;
    const userkey = `user:${req.email.split("@gmail.com")[0]}`;

    await redisClient.hdel(key, "title", "content", "color");

    let notes = await redisClient.hget(userkey, "notes");

    if (!notes || notes == undefined)
      throw new ApiError(400, "empty notes/notes not found");

    if (notes.length) notes = notes?.split(",");

    notes = notes.filter((e) => e !== title);
    notes = notes.join(",");

    let user = await redisClient.hset(userkey, "notes", notes);

    return res
      .status(200)
      .send(new ApiResponse(204, user, "note deleted successfully"));
  } catch (error) {
    console.error("error occured :", error?.message);

    return res
      .status(error?.statusCode || 500)
      .send(
        new ApiError(
          error?.statusCode || 500,
          error?.message || "unauthorised user",
          error?.errors
        )
      );
  }
};

module.exports = {
  createNotes,
  getSingleNote,
  getAllNotes,
  updateNote,
  deleteNote,
};
