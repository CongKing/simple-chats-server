var express = require('express');
var router = express.Router();
const {userModel, chatModel} = require('../db/models')
const md5 = require('blueimp-md5')
const filter = {password: 0, __v: 0}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/register', function(req, res) {
  const {username, password, type} = req.body
  
  userModel.findOne({username}, (err, user) => {
    
    if(user) {
      res.send({code: '001', msg: '用户已经存在'})
    } else {
      new userModel({username, password: md5(password), type})
      .save((err, user) => {
        if(err) {
          console.log(err)
          return res.send({code: '002', msg: err})
        }
        // 返回cookie
        res.cookie('userid', user.id, {maxAge: 1000*60*60*24*7}) 

        // 返回数据
        const data = {username, type, _id: user._id}
        res.send({code: '000', data})
      })
    }
  })
})


router.post('/login', (req, res) => {
  const {username, password} = req.body

  userModel.findOne({username, password: md5(password)}, filter, (err, user) => {
    if(!user) {
      res.send({code: '001', msg: '用户名密码错误'})

    } else {
      res.cookie('userid', user._id, {maxAge: 1000*60*60*24*7}) 

      const data = {username, type: user.type, _id: user._id, avatar: user.avatar}
      res.send({code: '000', data})
    }
  })
})


router.post('/update', (req, res) => {
  // 登录判断
  const userid = req.cookies.userid
  if(!userid) {
    return res.send({code: '001', msg: '请先登录'})
  }
  // 
  const user = req.body

  userModel.findByIdAndUpdate({_id: userid}, user, (err, oldUser) => {
    if(!oldUser) {
      res.clearCookie('userid')
      res.send({code: '001', msg: '请先登录'})
    } else {
      const {_id, username, type} = oldUser
      const data = Object.assign({_id, username, type}, user)
      res.send({code: '000', data})
    }
  })
})


router.get('/user', (req,res) => {
  const userid = req.cookies.userid
  if(!userid) {
    return res.send({code: '001', msg: '请先登录'})
  }

  userModel.findOne({_id: userid}, filter, (err, user) => {
    if(!user) return res.send({code: '001', msg: '请先登录'})
    res.send({code: '000', data: user})
  })
})

router.get('/userlist', (req, res) => {
  const {type} = req.query
  userModel.find({type}, filter, (err, users) => {
    res.send({code: '000', data: users})
  })
})


router.get('/msglist', (req,res) => {
  const userid = req.cookies.userid

  userModel.find((err, userDocs) => {
    const users = {}
    userDocs.forEach(doc => {
      users[doc._id] = {username: doc.username, avatar: doc.avatar}
    })

    chatModel.find({'$or': [{from: userid}, {to: userid}]}, filter, (err, chatMsgs) => {
      res.send({code: '000', data: {users, chatMsgs}})
    })
  })
})


router.post('/readmsg', (req, res) => {
  const {from} = req.body
  const to = req.cookies.userid

  chatModel.update({from, to,read: false}, {read: true}, {multi: true}, function(err, doc) {
    res.send({code: '000', data: doc.nModified})
  })
})



module.exports = router;
