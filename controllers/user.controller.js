const { Redis } = require("ioredis");
const bcrypt = require("bcrypt");
const { ApiError } = require("../utils/ApiError.utils");
const { ApiResponse } = require("../utils/ApiResponse.utils");

const options = {
  httpOnly: true,
  secure: false,
};

const redisClient = new Redis({
  port: 6379,
  host: "127.0.0.1",
});

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      throw new Error("name or email or password not sent");

    const hashedPass = await bcrypt.hash(password, 10);

    let userid = `user:${Date.now()}`;

    console.log("signup");
    const user = await redisClient.hset(
      userid,
      "name",
      `${name}`,
      "email",
      `${email}`,
      "password",
      `${hashedPass}`
    );
    console.log(user);

    return res
      .status(201)
      .send(new ApiResponse(201, user, "user sign-up successful"));
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

const logout = async (req, res) => {
  if (!req.user) throw new Error("unauthorised user");

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .send(new ApiResponse(200, {}, "user logged out successfully"));
};

module.exports = {
  signup,
};
