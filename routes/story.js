const express = require("express");
const router = express.Router();

const {
  getStoryById,
  getAllStorys,
  createStory,
  getStory,
} = require("../controllers/story");

const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");

//all of params
router.param("userId", getUserById);
router.param("storyId", getStoryById);

//all of actual routes
//create route
router.post("/story/create/:userId", isSignedIn, isAuthenticated, createStory);

// read routes
router.get("/story/:userId/:storyId", isSignedIn, isAuthenticated, getStory);

//delete route
// router.delete(
//   "/product/:productId/:userId",
//   isSignedIn,
//   isAuthenticated,
//   isAdmin,
//   deleteProduct
// );

//update route
// router.put(
//   "/product/:productId/:userId",
//   isSignedIn,
//   isAuthenticated,
//   isAdmin,
//   updateProduct
// );

//listing route
router.get("/stories/:userId", isSignedIn, isAuthenticated, getAllStorys);

module.exports = router;
