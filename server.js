require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

//My routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const storyRoutes = require("./routes/story");

//DB Connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("DB CONNECTED");
  });

//Middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

//My Routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", storyRoutes);

//PORT
const port = process.env.PORT || 5002;

// //Production
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static("client/build"));

//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
//   });
// }

//Starting a server
const server = app.listen(port, () => {
  console.log(`app is running at ${port}`);
});

let user = {};

const io = require("./socket").socketInit(server);
io.on("connection", (socket) => {
  socket.on("visit", ({ storyId, userId }) => {
    socket.join(storyId);

    if (user.hasOwnProperty(`${storyId}`)) {
      // console.log("exist", user);
      const index = user[`${storyId}`].findIndex(
        (usersId) => usersId == userId
      );
      if (index < 0) {
        user[`${storyId}`].push(userId);
        // console.log(user);
        io.to(storyId).emit("visitCount", {
          count: user[`${storyId}`].length,
        });
      } else {
        io.to(storyId).emit("visitCount", {
          count: user[`${storyId}`].length,
        });
      }
    } else {
      user[`${storyId}`] = [];
      user[`${storyId}`].push(userId);
      // console.log(user);
      io.to(storyId).emit("visitCount", { count: user[`${storyId}`].length });
    }

    // socket.to(storyId).emit("visitount", { count: count++ });
  });
  socket.on("leave", ({ storyId, userId }) => {
    socket.join(storyId);

    if (user.hasOwnProperty(`${storyId}`)) {
      const index = user[`${storyId}`].findIndex(
        (usersId) => usersId == userId
      );

      if (index >= 0) {
        user[`${storyId}`].splice(index, 1);
        io.to(storyId).emit("visitCount", {
          count: user[`${storyId}`].length,
        });
      }
    }
  });
  socket.on("disconnect", () => {
    io.emit("visitCount", { count: 10 });
  });
});
// module.exports = server;
