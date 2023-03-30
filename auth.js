const User = require("../models/user");
const { check, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
var { expressjwt: jwt } = require("express-jwt");

exports.signup = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  const user = new User(req.body);
  user
    .save()
    .then((user) => {
      res.json({
        name: user.name,
        email: user.email,
        id: user._id,
      });
    })
    .catch((error) => {
      return res.status(400).json({
        error: "NOT able to save user in DB",
      });
    });
};

exports.signin = async (req, res) => {
  try {
    const errors = validationResult(req);
    // const { email, password } = req.body;

    if (!errors.isEmpty()) {
      return res.status(422).json({
        error: errors.array()[0].msg,
      });
    }
    const { password } = req.body;
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({
        error: "USER email does not exists",
      });
    }

    if (!user.autheticate(password)) {
      return res.status(401).json({
        error: "Email and password do not match",
      });
    }

    //create token
    const token = jwt.sign({ _id: user._id }, "blog");
    //put token in cookie
    res.cookie("token", token, { expire: new Date() + 9999 });

    //send response to front end
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, name, email, role } });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "User signout successfully",
  });
};

//protected routes
exports.isSignedIn = jwt({
  secret: "blog",
  userProperty: "auth",
  algorithms: ["HS256"],
});

//custom middlewares
exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED",
    });
  }
  next();
};
