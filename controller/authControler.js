const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config");
const User = require("../model/userModel");
const Booking = require("../model/bookingModel");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//get all user

router.get("/users", (req, res) => {
  User.find({}, (err, data) => {
    if (err) throw err;
    res.send(data);
  });
});

//register user

router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }, (err, data) => {
    if (data) {
      res.send({ register: false, error: "email alreday registered" });
    } else {
      let hash = bcrypt.hashSync(req.body.password);
      User.create(
        {
          name: req.body.name,
          password: hash,
          email: req.body.email,
          role: req.body.role ? req.body.role : "User",
          isActive: true
        },
        (err, user) => {
          if (err) return res.status(500).send("error while registering");
          return res.status(200).send({ register: true, message: "Registeration Successfull" });
        }
      );
    }
  });
});

//login user

router.post("/login", (req, res) => {
  User.findOne({ email: req.body.email }, (err, data) => {
    if (err)
      return res.status(500).send({ auth: false, error: "Error while login" });
    if (!data)
      return res
        .status(500)
        .send({ auth: false, error: "no user found, register first" });
    else {
      const passIsValid = bcrypt.compareSync(req.body.password, data.password);
      if (!passIsValid) {
        return res.status(500).send({ auth: false, error: "Invalid Password" });
      }
      let token = jwt.sign({ id: data.id }, config.secret, {
        expiresIn: 86400,
      });
      return res.status(200).send({ auth: true, token: token });
    }
  });
});

//user info

router.get("/userInfo", (req, res) => {
  let token = req.headers["x-access-token"];
  if (!token)
    return res.status(500).send({ auth: false, error: "No token provided" });
  jwt.verify(token, config.secret, (err, data) => {
    if (err)
      return res.status(500).send({ auth: false, error: "Invalid Token" });
    User.findById(data.id, { password: 0 }, (err, result) => {
      res.send(result);
    });
  });
});

//update password

router.put("/updatePassword", (req, res) => {
  let token = req.headers["x-access-token"];
  if (!token)
    return res.status(500).send({ auth: false, error: "No token provided" });
  jwt.verify(token, config.secret, (err, data) => {
    if (err)
      return res.status(500).send({ auth: false, error: "Invalid Token" });
    let hash = bcrypt.hashSync(req.body.password);
    User.updateOne({ _id: data.id }, { password: hash }, (err, result) => {
      if (err) throw err;
      return res.send("password updated");
    });
  });
});

//addbooking

router.post("/addbooking", (req, res) => {
  let token = req.headers["x-access-token"];
  if (!token)
    return res.status(500).send({ auth: false, error: "No token provided" });
  jwt.verify(token, config.secret, (err, data) => {
    if (err)
      return res.status(500).send({ auth: false, error: "Invalid Token" });
    User.findById(data.id, { password: 0 }, (err, result) => {
        const booking = {
        hotel: req.body.hotel,
        hotelid: req.body.hotelid,
        price: req.body.price,
        name: req.body.name,
        date: req.body.date,
        city: req.body.city,
        status: "Pending",
        phone: req.body.phone,
        bookeremail: req.body.bookeremail
      };
      console.log(booking)
      console.log(token)
      Booking.create((booking), (err, resp) => {
          if(err) throw err
          return res.send({booking : true, message : "Booking Successfull"})
      })
  });
});
})

//get all bookings
router.get("/allbookings", (req, res) => {
    let token = req.headers["x-access-token"];
    if (!token) return res.status(500).send({ auth: false, error: "No token provided" });
    jwt.verify(token, config.secret, (err, data) => {
    if (err) return res.status(500).send({ auth: false, error: "Invalid Token" });
    User.findById(data.id, { password: 0 }, (err, result) => {
        if(result.role !== "Admin"){
            return res.send({error : "you are not admin"})
        }else{
            Booking.find({}, (err, bookings) => {
                if(err) return res.send({error : "cannot get bookings"})
                return res.send(bookings)
            })
        }
    })
})
})

//get all pending bookings of hotel
// router.get("/pendingbookings", (req, res) => {
//     let token = req.headers["x-access-token"];
//     if (!token) return res.status(500).send({ auth: false, error: "No token provided" });
//     jwt.verify(token, config.secret, (err, data) => {
//     if (err) return res.status(500).send({ auth: false, error: "Invalid Token" });
//     User.findById(data.id, { password: 0 }, (err, result) => {
//         if(result.role !== "Admin"){
//             return res.send({error : "you are not admin"})
//         }else{
//             Booking.find({status: "Pending", hotel: req.body.hotelid}, (err, bookings) => {
//                 if(err) return res.send({error : "cannot get bookings"})
//                 return res.send(bookings)
//             })
//         }
//     })
// })
// })


//get all pending bookings
router.get("/pendingbookings", (req, res) => {
    let token = req.headers["x-access-token"];
    if (!token) return res.status(500).send({ auth: false, error: "No token provided" });
    jwt.verify(token, config.secret, (err, data) => {
    if (err) return res.status(500).send({ auth: false, error: "Invalid Token" });
    User.findById(data.id, { password: 0 }, (err, result) => {
        if(result.role !== "Admin"){
            return res.send({error : "you are not admin"})
        }else{
            Booking.find({status: "Pending"}, (err, bookings) => {
                if(err) return res.send({error : "cannot get bookings"})
                return res.send(bookings)
            })
        }
    })
})
})


//get all confirmed bookings
router.get("/confirmedbookings", (req, res) => {
    let token = req.headers["x-access-token"];
    if (!token) return res.status(500).send({ auth: false, error: "No token provided" });
    jwt.verify(token, config.secret, (err, data) => {
    if (err) return res.status(500).send({ auth: false, error: "Invalid Token" });
    User.findById(data.id, { password: 0 }, (err, result) => {
        if(result.role !== "Admin"){
            return res.send({error : "you are not admin"})
        }else{
            Booking.find({status: "Confirmed"}, (err, bookings) => {
                if(err) return res.send({error : "cannot get bookings"})
                return res.send(bookings)
            })
        }
    })
})
})


//update booking status
router.put("/updatebooking", (req, res) => {
    let token = req.headers["x-access-token"];
    if (!token) return res.status(500).send({ auth: false, error: "No token provided" });
    jwt.verify(token, config.secret, (err, data) => {
    if (err) return res.status(500).send({ auth: false, error: "Invalid Token" });
    User.findById(data.id, { password: 0 }, (err, result) => {
        if(result.role !== "Admin"){
            return res.send({error : "you are not admin"})
        }else{
            Booking.updateOne({_id: req.body._id}, {status: req.body.status} ,(err, bookings) => {
                if(err) return res.send({error : "cannot get bookings"})
                return res.send({succ: `Booking Updated to ${req.body.status}`})
            })
        }
    })
})
})


//get all booking of current user
router.get("/yourbookings", (req, res) => {
    let token = req.headers["x-access-token"];
    if (!token) return res.status(500).send({ auth: false, error: "No token provided" });
    jwt.verify(token, config.secret, (err, data) => {
    if (err) return res.status(500).send({ auth: false, error: "Invalid Token" });
    User.findById(data.id, { password: 0 }, (err, result) => {
    Booking.find({bookeremail: result.email}, (err, bookings) => {
        if(err) return res.send({error : "cannot get bookings"})
        return res.send(bookings)
        })
    })
})
})


//get all confirmed bookings of current user
router.get("/yourcnfbookings", (req, res) => {
    let token = req.headers["x-access-token"];
    if (!token) return res.status(500).send({ auth: false, error: "No token provided" });
    jwt.verify(token, config.secret, (err, data) => {
    if (err) return res.status(500).send({ auth: false, error: "Invalid Token" });
    User.findById(data.id, { password: 0 }, (err, result) => {
    Booking.find({bookeremail: result.email, status: "Confirmed"}, (err, bookings) => {
        if(err) return res.send({error : "cannot get bookings"})
        return res.send(bookings)
        })
    })
})
})

//get all pending bookings of current user
router.get("/yourpenbookings", (req, res) => {
    let token = req.headers["x-access-token"];
    if (!token) return res.status(500).send({ auth: false, error: "No token provided" });
    jwt.verify(token, config.secret, (err, data) => {
    if (err) return res.status(500).send({ auth: false, error: "Invalid Token" });
    User.findById(data.id, { password: 0 }, (err, result) => {
    Booking.find({bookeremail: result.email, status: "Pending"}, (err, bookings) => {
        if(err) return res.send({error : "cannot get bookings"})
        return res.send(bookings)
        })
    })
})
})

//get all cancelled bookings of current user
router.get("/yourcanbookings", (req, res) => {
  let token = req.headers["x-access-token"];
  if (!token) return res.status(500).send({ auth: false, error: "No token provided" });
  jwt.verify(token, config.secret, (err, data) => {
  if (err) return res.status(500).send({ auth: false, error: "Invalid Token" });
  User.findById(data.id, { password: 0 }, (err, result) => {
  Booking.find({bookeremail: result.email, status: "Cancelled"}, (err, bookings) => {
      if(err) return res.send({error : "cannot get bookings"})
      return res.send(bookings)
      })
  })
})
})



module.exports = router;
