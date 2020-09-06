const Story = require("../models/story");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const sokectIO = require("../socket");

exports.getStoryById = async (req, res, next, id) => {
  try {
    const story = await Story.findById(id).populate("posted_by", "name email");

    if (!story) {
      return res.status(400).json({
        error: "Story not found",
      });
    }

    sokectIO.getSokectIO().on("connection", (socket) => {
      socket.on("visitAdd", async ({ storyId, userId }) => {
        // console.log(story.visited);
        const index = story.visited.find((visitor) => visitor == userId);
        console.log(index);
        console.log(!index);
        if (!index) {
          console.log(index);
          let newCount = story.visited.concat(userId);
          story.visited = [...new Set(newCount)];
          await story.save();
        }
      });
    });
    req.story = story;
    next();
  } catch (error) {
    return res.status(400).json({
      error: "DB ERROR",
    });
  }
};

exports.createStory = (req, res) => {
  req.body.posted_by = req.profile._id;

  const story = new Story(req.body);
  story
    .save()
    .then((result) => {
      res.json({ message: `${result.title} saved in DB` });
    })
    .catch((error) => {
      return res.status(400).json({
        error: "Unable to save story in DB!",
      });
    });
};

// let count = 0;
// const server = require("../server");

exports.getStory = (req, res) => {
  // const io = require("../socket").socketInit(server);

  return res.json(req.story);
};

exports.getAllStorys = async (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;
  // let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

  try {
    const stories = await Story.find()
      .populate("posted_by", "name email")
      .limit(limit);

    if (!stories) {
      return res.status(400).json({
        error: "NO Story FOUND",
      });
    }
    res.json(stories);
  } catch (error) {
    return res.status(400).json({
      error: "DB ERROR",
    });
  }

  // Story.find()
  //   .populate("posted_by")
  //   .limit(limit)
  //   .exec((err, Storys) => {
  //     if (err) {
  //       return res.status(400).json({
  //         error: "NO Story FOUND"
  //       });
  //     }
  //     res.json(Storys);
  //   });
};
