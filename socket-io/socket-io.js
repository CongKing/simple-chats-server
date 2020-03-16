const {chatModel, socketModel} = require('../db/models')
var cookieParser = require('cookie-parser')

function parseCookie(cookieStr) {
    const cookies = cookieStr.split(';')
    const cookieObj = cookies.reduce((pre, next) => {
        const key = next.split('=')[0].trim();
        let val = next.split('=')[1].trim();
        val = decodeURIComponent(val)
        if(val.indexOf('"') > -1) {
            val = val.split('"')[1]
        }
        pre[key] = val;
        return pre; 
    }, {})
    return cookieObj
}


module.exports = function(server) {
    const io = require('socket.io')(server)
    
    io.on('connection', (socket) => {
        
        const cookie = parseCookie(socket.request.headers.cookie)
        socketModel.findOneAndUpdate({uid: cookie.userid}, {sid: socket.id}, (err, updateSocket) => {
            if(!updateSocket) {
                new socketModel({uid: cookie.userid, sid: socket.id}).save((err) => {
                    if(err) console.log(err)
                })

            } 
        })
        

        socket.on('sendMsg', ({from, to, content}) => {
            const chat_id = [from, to].sort().join('_')
            const create_time = Date.now()

            new chatModel({from, to, content, chat_id, create_time}).save((err, chatMsg) => {
                socketModel.find({uid: {$in: [to, from]}}, (err, sockets) => {
                    if(err) return console.log(err)
                    
                    sockets.forEach(socket => {
                     const toSocket = io.sockets.sockets[socket.sid]
                     toSocket && toSocket.emit('receiveMsg', chatMsg)
                    })
                })
            })

        })
    })
}