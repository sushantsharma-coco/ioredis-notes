const app = require("express")();
const cors = require("cors");
const { json, urlencoded } = require("express");
const userRouter = require("./routes/user.router");
const notesRouter = require("./routes/notes.router");

// app.use(cors({ origin: "*" }));

const allowedOrigins = ["http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(json());
app.use(urlencoded({ extended: true }));

app.get("/", (req, res) => {
  return res.status(200).send({ status: 200, message: "home page" });
});

app.use("/user", userRouter.router);
app.use("/user/notes", notesRouter.router);

app.listen(8080, () => console.log("server running on port 8080"));
