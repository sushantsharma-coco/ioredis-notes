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
    let pattern = `notes:${req.email.split("@gmail.com")[0]}`;
    console.log(pattern);
    let cursor = "0";
    const notes = [];

    do {
      // Use SCAN to iterate over keys
      const result = await redisClient.scan(cursor, "MATCH", pattern);
      console.log("result", result);
      cursor = result[0];
      console.log("cursor", cursor);
      const keys = result[1];
      console.log("keys", keys);

      if (keys.length) {
        // Fetch all notes at once
        const notesData = await redisClient.mget(keys);
        notes.push(...notesData);
      }
    } while (cursor !== "0");

    console.log(notes);

    return res
      .status(200)
      .send(new ApiResponse(200, notes, "all notes fetched successfully"));
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

const updateSingleNote = async (req, res) => {
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
    console.log(note);

    if (note == 0) throw new ApiError(409, "note already exists");

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

module.exports = { createNotes, getSingleNote, getAllNotes, updateSingleNote };
