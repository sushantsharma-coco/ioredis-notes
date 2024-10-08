const { Redis } = require("ioredis");
const bcrypt = require("bcrypt");
const { ApiError } = require("../utils/ApiError.utils");
const { ApiResponse } = require("../utils/ApiResponse.utils");
const jsonwebtoken = require("jsonwebtoken");

const options = {
  httpOnly: true,
  secure: false,
};

const redisClient = new Redis({
  port: 6379,
  host: "127.0.0.1",
});

// const signup = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password)
//       throw new Error("name or email or password not sent")
//     let userid = `user:${Date.now()}`;
//     console.log("signup");
//     const user = await redisClient.hset(
//       userid,
//       "name",
//       `${name}`,
//       "email",
//       `${email}`,
//       "password",
//       `${hashedPass}`
//     );
//     console.log(user);
//     return res
//       .status(201)
//       .send(new ApiResponse(201, user, "user sign-up successful"));
//   } catch (error) {
//     console.error("error occured :", error?.message);
//     return res
//       .status(error?.statusCode || 500)
//       .send(
//         new ApiError(
//           error?.statusCode || 500,
//           error?.message || "unauthorised user",
//           error?.errors
//         )
//       );
//   }
// };

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      throw new ApiError(400, "email and password are required");

    let key = email.split("@gmail.com");
    key = key[0];

    let userExist = await redisClient.hgetall(`user:${key}`);

    if (!Object.keys(userExist).length) {
      const hashedPass = await bcrypt.hash(password, 10);

      await redisClient.hset(
        `user:${key}`,
        `email`,
        `${email}`,
        `password`,
        `${hashedPass}`
      );

      userExist = await redisClient.hgetall(`user:${key}`);
    }

    const accessToken = await jsonwebtoken.sign(
      { email },
      "process.env.ACCESS_TOKEN_SECRET",
      { expiresIn: "1d" }
    );

    delete userExist["password"];

    return res
      .cookie("accessToken", accessToken, options)
      .status(200)
      .send(
        new ApiResponse(
          200,
          { userExist, accessToken },
          "user login successful"
        )
      );

    // look for doc with email if found then compare password with hashed else create new one
    // create accesstoken token and send it with login
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

const currentUser = async (req, res) => {
  try {
    if (!req.email) throw new ApiError(401, "unauthorized user");

    key = `user:${req.email.split("@gmail.com")[0]}`;
    console.log(key);

    const user = await redisClient.hgetall(key);
    console.log(user);

    if (!user) throw new ApiError(404, "user not found");

    delete user["password"];

    return res
      .status(200)
      .send(new ApiResponse(200, user, "user fetched successfully"));
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
  if (!req.email) return res.status(401).send("unauthorized user");

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .send(new ApiResponse(200, {}, "user logged out successfully"));
};

module.exports = {
  //   signup,
  signin,
  currentUser,
  logout,
  redisClient,
};
