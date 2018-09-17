const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const logger = require('../logger/logger.js')

mongoose.connect('mongodb://localhost/mongoose_basics', (err) => {
    if(err) throw err
    logger.info(`Database successfully connected`)
})

const Schema = mongoose.Schema

const userScheme = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 15
    },
    surname: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 15
    },
    father: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 15
    },
    gender: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true,
    },
    time: { 
        type: Date, 
        default: Date.now 
    },
    position: {
        type: String,
        required: true
    },
    price: {
        type: Number
    }
})

const adminScheme = new Schema({
    username: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 20
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true, 
        index: { 
            unique: true 
        }
    }
})

adminScheme.methods.generateHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)

// checking if password is valid
adminScheme.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
}

const result = {
    user: mongoose.model('User', userScheme),
    admin: mongoose.model('Admin', adminScheme)
}

module.exports = result