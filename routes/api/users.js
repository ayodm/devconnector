const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

// Load input Validation
const validateRegisterInput = require("../../validation/register");

// Load user model
const User = require("../../models/User");

// @route GET api/user/test
// @desc Tests user route
// @access Public
router.get("/test", (req, res) => res.json({ msg: "Users Works" }));

// @route GET api/user/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  } //Deconstruction


  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        // Size
        s: "200",
        // Rating
        r: "pg",
        // Default
        d: "mm"
      });

      // Create a new user
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      // Encrypt the user's password
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route GET api/user/login
// @desc Login user / returning JWT Token
// @access Public
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // find the user by email
  User.findOne({ email }).then(user => {
    // Check for user
    if (!user) {
      return res.status(404).json({ email: "User not found" });
    }

    // Check Password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User Matched

        const payload = { id: user.id, name: user.name, avatar: user.avatar }; // Create jwt payload

        // Sign Token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        return res.status(400).json({ password: "Password incorrect" });
      }
    });
  });
});

// @route GET api/user/current
// @desc Return current user
// @access Private

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
