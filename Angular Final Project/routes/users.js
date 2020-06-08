var express = require("express");
var express = require("express");
var router = express.Router();
var models = require("../models");
var authService = require("../services/auth");


/* GET users listing. */


router.get("/login", function(req, res, next) {
 res.render("login");
});


router.get("/signup", function(req, res, next) {
 res.render("signup");
});

router.get("/profile", function(req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token).then(user => {
      if (user) {
        models.posts.findAll({
          where: {
            UserId: user.UserId,
            Deleted: false
          }
        })
    .then(posts => {
      res.render('profile', {
        Posts: posts,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Username: user.Username
      });
    });
      } else {
        res.status(401);
        res.send("Invalid authentication token");
      }
    });
  } else {
    res.status(401);
    res.send("Must be logged in");
  }
  });

  

router.get("/logout", function(req, res, next) {
 res.cookie("jwt", "", { expires: new Date(0) });
 res.redirect('/users/login')
});

router.get('/admin', function (req,res,next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token).then(user => {
      if (user.Admin) {
        models.users.
        findAll({where: { Deleted: false}, raw: true})
        .then(usersFound => res.render("adminView", {users: usersFound}));
      } else {
        res.send("unauthorized");
      }
    })
  }
});

 router.get('/admin/editUser/:id', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token)
      .then(user => {
        if (user.Admin) {
          models.users
            .findByPk(parseInt(req.params.id))
            .then(userFound => {
              res.render('profileAdmin', {
                UserId: userFound.UserId,
                FirstName: userFound.FirstName,
                LastName: userFound.LastName,
                Email: userFound.Email,
                Username: userFound.Username,
                Admin: userFound.Admin
              });
            });
        } else {
          res.send('Must be an admin to view this page');
        }
      });
  } else {
    res.send('Oops')
  }
 });


router.post("/signup", function(req, res, next) {
 models.users
   .findOrCreate({
     where: {
       Username: req.body.username
     },
     defaults: {
       FirstName: req.body.firstName,
       LastName: req.body.lastName,
       Email: req.body.email,
       Password: authService.hashPassword(req.body.password) //<--- Change to this code here
     }
   })
   .spread(function(result, created) {
     if (created) {
       res.send("User successfully created");
     } else {
       res.send("This user already exists");
     }
   });
});

router.post("/login", function(req, res, next) {
  models.users
    .findOne({
      where: {
        Username: req.body.username
      }
    })
    .then(user => {
      if (!user) {
        console.log("User not found");
        return res.status(401).json({
          message: "Login Failed"
        });
      } else {
        let passwordMatch = authService.comparePasswords(
          req.body.password,
          user.Password
        );
        if (passwordMatch) {
          let token = authService.signUser(user);
          res.cookie("jwt", token);
          res.redirect('profile');
        } else {
          console.log("Wrong password");
          res.send("Wrong password");
        }
      }
    });
  });



//post routes below//

router.get("/createPosts", function (req,res,next ){
  res.render('createPosts')
});

router.get("/updatePost", function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token).then(post => {
      if (post) {
        let postId = parseInt(req.params.id);
        models.posts.findOne({
          where: {
            PostId: post.postId
          }
        })
          .then(posts => {
            res.render('updatePost')
          });
      } else {
        res.status(401);
        res.send("Invalid authentication token");
      }
    });
  } else {
    res.status(401);
    res.send("Must be logged in");
  }
 });




router.post("/createPosts", function(req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token)
      .then(user => {models.posts
        .findOrCreate({
          where: {
            UserId: user.UserId,
            PostTitle: req.body.PostTitle,
            PostBody: req.body.PostBody
          }
        })
        .spread(function(result, created) {
          if (created) {
            res.redirect("profile");
          };
        });
      })};
 
 });

 router.get('/admin/deleteUser/:id', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token)
      .then(user => {
        if (user.Admin) {
          models.users
            .findByPk(parseInt(req.params.id))
            .then(userFound => {
              let userDeleteId = parseInt(req.params.id);
              models.users.update(
                {
                  Deleted: 'true'
                },
                {
                  where: {
                    UserId: userDeleteId
                  }
                }
              )
                .then(user => {
                  res.redirect('/users/admin');
                })
            });
        } else {
          res.send('Must be an admin to view this page')
        }
      });
  } else {
    res.send('error: admin not logged in')
  }
 });

 router.put('/updatePost', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token)
      .then(post => {
        let postId = parseInt(req.params.id);
        models.posts
          .update({
            where: {
              PostId: post.postId
            },
            defaults: {
                PostTitle: req.body.PostTitle,
                PostBody: req.body.PostBody
            }
          }).then(result => res.redirect('/profile'))
      })
  } else {
    res.status(400);
    res.send('There was a problem updating the post.')
  }
});

router.delete("/profile/:id", function (req, res, next) {
  let postId = parseInt(req.params.id);
  models.posts
    .destroy({
      where: { PostId: postId }
    })
    .then(result => res.redirect('/profile'))
    .catch(err => { 
      res.status(400); 
      res.send("There was a problem deleting the post. Please make sure you are specifying the correct id."); 
    }
);
});




module.exports = router;