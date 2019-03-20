const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const isEmpty = require('lodash/isEmpty');
const validator = require('validator');
const multer = require('multer');
const imagePath = 'storage/images';
const path = require('path');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, imagePath)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
function valideInput(data) {
    let errors = {};

    if (validator.isEmpty(data.username)) {
        errors.username = "Username is required";
    }

    if (!validator.isEmail(data.email)) {
        errors.email = "Email format not correct";
    }

    if (validator.isEmpty(data.password)) {
        errors.password = "Password is required";
    }

    if (validator.isEmpty(data.passwordConfirmation)) {
        errors.passwordConfirmation = "Password confirmation is required";
    }
    if (!validator.equals(data.password, data.passwordConfirmation)) {
        errors.passwordConfirmation = "Password confirmation must match";
    }
    return {
        errors,
        isValid: isEmpty(errors)
    }
}

router.get('/',(req,res) => {
    User
    .find()
    .then(user=>{
        res.json(user);
    })
    .catch(err=>res.err(err))
})
router.get('/:id',(req,res) => {
    User
    .findById(req.params.id)
    .then(user=>{
        res.json(user);
    })
    .catch(err=>res.err(err))
})

router.post('/', upload.single('imageFile'),(req, res) => {
    const { errors, isValid } = valideInput(req.body);
    if (!isValid) {
        res.status(400).send(errors);
    } else {
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            imageUrl: '/images/' + req.file.filename,
            password: req.body.password,
        });
        newUser.save().then(user => res.json(user));
    }
});
module.exports = router;