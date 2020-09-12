const User = require("../models/user");
// const Order = require("../models/order");

exports.getUserById = async (req, res, next, id) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({
        error: "No user was found in DB",
      });
    }

    req.profile = user;
    next();
  } catch (error) {
    res.status(400).json({
      error: "Error from DB",
    });
  }
};

exports.getUser = (req, res) => {
  req.profile.salt = undefined;
  req.profile.encry_password = undefined;
  return res.json(req.profile);
};
