const jwt = require("jsonwebtoken");
const { ApiError } = require("../utils/ApiError.utils");
const { redisClient } = require("../controllers/user.controller");

const auth = async (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) throw new ApiError(404, "access-token not found");

    const tokenData = await jwt.verify(
      accessToken,
      "process.env.ACCESS_TOKEN_SECRET"
    );

    if (tokenData?.exp && tokenData.exp < Date.now() / 1000)
      throw new ApiError(401, "token has been expired");

    // const user = await User.findById(tokenData?._id);
    const email = await redisClient.hgetall(
      `user:${tokenData.email.split("@gmail.com")[0]}`
    );

    if (!email) throw new ApiError(404, "user not found, try logging-in");

    req.email = email.email;
    next();
  } catch (error) {
    console.error("error occured during auth :", error?.message);

    return res
      .status(error?.statusCode || 401)
      .send(
        new ApiError(
          error?.statusCode || 401,
          error?.message || "unauthorised user",
          error?.errors
        )
      );
  }
};

module.exports = { auth };
