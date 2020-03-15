const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/react-app')

const md5 = require('blueimp-md5')

const conn = mongoose.connection

conn.on('connected', function() {
    console.log('connected success')
})


const userSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    type: {type: String, required: true},
    header: {type: String},
})

const UserModel = mongoose.model('user', userSchema)

function testSave () {
    const userModel = new UserModel({username: 'Tom', password: md5('dsadsadsa'), type: 'laoban'})

    userModel.save((err, user) => {
        console.log(err, user)
    })
}

// testSave()

function testFind() {
    UserModel.find((err, users) => {
        console.log(err, users)
    })

    userModel.findOne({_id: '5e5a28877f642853785dc5c7'}, (err, user) => {
        console.log(err, user)
    })
}

testFind()

