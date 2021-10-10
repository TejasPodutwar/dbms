const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Service = require("../models/service");
const middleware = require("../middleware/index");
const passport = require("passport");

//-----------Landing Page--------------
router.get("/", (req, res) => {
  res.render("landing-page");
});

//-----------Register Route--------------
router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register/consumer", (req, res) => {
  // let data = req.sanitize(req.body);
  let data = req.body;
  if (data.password === data.confirm_pass) {
    let newUser = new User(data.user);
    User.register(newUser, data.password, (err, user) => {
      if (err) {
        req.flash("error", "Something went wrong, Try again later!");
        res.redirect("back");
      } else {
        // passport.authenticate("local")(req, res, () => {
        //   req.flash("success", "Successfully registered as consumer!");
        //   res.render("home");
        // });
        req.flash(
          "success",
          "Successfully registered, Login with your credentials!"
        );
        res.redirect("/login");
      }
    });
  } else {
    req.flash("err", "Check the password!!!");
    res.redirect("back");
  }
});

router.post("/register/provider", (req, res) => {
  let data = req.body;
  if (data.password === data.confirm_pass) {
    let newUser = new User(data.user);
    User.register(newUser, data.password, (err, user) => {
      if (err) {
        req.flash("error", "Something went wrong, Try again later!");
        console.log(err);
        res.redirect("back");
      } else {
        let provider = data.service;
        // console.log(provider);
        Service.create(provider, (err, service) => {
          if (err) {
            req.flash("error", "Something went wrong, Try again later!");
            console.log(err);
            res.redirect("back");
          } else {
            user.providerId = service;
            user.serviceProvider = true;
            user.save();
            service.provider = user.firstName + " " + user.lastName;
            service.save();
            req.flash(
              "success",
              "Successfully registered, Login with your credentials!"
            );
            res.redirect("/login");
          }
        });
      }
    });
  } else {
    req.flash("err", "Check the password!!!");
    res.redirect("back");
  }
});

//----------------Login routes------------------
router.get("/login", (req, res) => {
  res.render("login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/services",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {}
);

//----------------Logout route--------------------
router.get("/logout", (req, res) => {
  // req.flash("success", "Logged out!");
  req.logout();
  res.redirect("/");
});

router.delete("/user/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      req.flash("error", "Something went wrong, Try again later!");
      res.redirect("back");
    } else {
      req.flash("warning", `Account deleted successfully!`);
      res.redirect("/");
    }
  });
});

//------------------service routes-----------------------
router.get("/services", middleware.isLoggedIn, async (req, res) => {
  if (req.user.serviceProvider) {
    res.send("Here Provider Dashboard should appear!!!");
  } else {
    Service.find({}, (err, services) => {
      res.render('services', {services: services});
    })
  }
  // console.log("Heyyy, Middleware is not working");
  // res.render("services");
});

router.get("/dashboard", middleware.isLoggedIn, (req, res) => {
  res.render("provider-dashboard");
});

module.exports = router;
