const User = require('../models/user.models');
var passwordHash = require('password-hash');
const { findByIdAndUpdate } = require('../models/user.models');

exports.register = (req, res) =>{
    if(!req.body) {
        return res.status(400).send({
            message: "User content can not be empty"
        });
    }

    // Register a User
    const user = new User({
        username: req.body.username, 
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: passwordHash.generate(req.body.password),
        is_superuser: req.body.is_superuser,
        is_staff: req.body.is_staff
    });

    // Save User in the database
    user.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Note."
        });
    });
};

exports.findAll = (req, res) => {
    User.find()
    .then(users => {
        res.send(users);
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving users."
        });
    })
}

exports.findOne = (req, res) => {
    User.findById(req.params.userId)
    .then(user => {
        if(!user){
            return res.status(404).send({
                message: "No User with this id: " + req.params.userId
            });            
        }else{
            res.send(user);
        }
    }).catch(err => {
        return res.status(500).send({
            message: "Error retrieving user with id " + req.params.userId
        });
    })
}

exports.login = (req, res) => {
    if((!req.body.username) || (!req.body.password)) {
        return res.status(400).send({
            message: "Login Creds can not be empty"
        });
    }else{
        User.findOne({username:req.body.username})
        .then(user => {
            if(!user){
                return res.status(404).send({
                    message: "Incorrect credentials"
                }); 
            }else{
                if(passwordHash.verify(req.body.password,user.password)){
                    return res.send(user)
                }else{
                    res.status(400).send({
                        message: "Incorrect Password"
                    })
                }
                
            }
        })
        .catch(err => {
            return res.status(500).send({
                message:"Something went wrong"+err.message
            })
        })
    }
}

exports.findExcept = (req, res) => {
    User.find({"_id":{"$ne": req.params.userId}})
    .then(users => {
        res.send(users)
    }).catch(err => {
        res.status(404).send({
            message:"Something wrong: "+ err.message
        })
    })
}

exports.update = (req, res) => {
    if(!req.body){
        return res.status(400).send({
            message: "User content can not be empty"
        });
    }else{
        User.findByIdAndUpdate(req.params.userId, {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email:req.body.email,
            password:passwordHash.generate(req.body.password)
        }, {new:true})
        .then(user => {
            if(!user){
                return res.status(404).send({
                    message: "Ther is no user with id " + req.params.noteId
                });
            }else{
                res.send(user);
            }
        }).catch(err => {
            res.status(400).send({
                message:"Something went wrong "+err.message
            })
        })

    }
}

exports.delete = (req, res) => {
    User.findByIdAndRemove(req.params.userId)
    .then(user => {
        if(!user){
            return res.status(404).send({
                message: "User not found with id " + req.params.userId
            });
        }else{
            res.send({message: "User deleted successfully!"});
        }
    }).catch(err => {
        return res.status(500).send({
            message: "Could not delete user with id " + req.params.userId
        })
    })
}