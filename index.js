const app = require("express")();
const { json, urlencoded } = require("express");
const userRouter = require("./routes/user.router");

app.use(json());
app.use(urlencoded({ extended: true }));

app.get("/", (req, res) => {
  return res.status(200).send({ status: 200, message: "home page" });
});

app.use("/user", userRouter.router);

app.listen(8080, () => console.log("server running on port 8080"));
