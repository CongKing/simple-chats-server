
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/react-app')
const conn = mongoose.connection
conn.on('connected', () => {
    console.log('connected')
})


const userSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    type: {type: String, required: true},
    avatar: {type: String},
    post: {type: String},
    info: {type: String},
    company: {type: String},
    salary: {type: String},
})

const socketSchema = mongoose.Schema({
    uid: {type: String, required: true}, // 用户 ID
    sid: {type: String, required: true}, // socket ID
})

const chatSchema = mongoose.Schema({
    from: {type: String, required: true},
    to: {type: String, required: true},
    chat_id: {type: String, required: true}, // from to 组合的 string
    content: {type: String, required: true},
    read: {type: Boolean, default: false},
    create_time: {type: Number},
})



const userModel = mongoose.model('user', userSchema)
const chatModel = mongoose.model('chatMsg', chatSchema)
const socketModel = mongoose.model('socket', socketSchema)

exports.userModel = userModel
exports.chatModel = chatModel
exports.socketModel = socketModel