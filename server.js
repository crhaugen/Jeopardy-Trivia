var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

app.use(bodyParser.json())
app.use(express.static(__dirname))
app.use(bodyParser.urlencoded({extended: false}))

var dbUrl = '######add url here #############'

var Question = mongoose.model('info', new mongoose.Schema({}),'info');
var questionSet;
 
app.get('/info', (req, res)=> { 

    console.log("in get")
    Question.aggregate([{ $sample: {size: 1}}], (err, info) => {
        console.log(info)
        console.log(info[0].question) 
        console.log(info[0].answer)
        questionSet = info
        res.send(info)  
    }) 
    /*
     Question.findById("5c9c18fe1c9d4400006b2e7a", (err, info) => {
        questionSet = JSON.stringify(info) 
        res.send(info)  
    })  */ 
    console.log("after get")    
    
})    
  
app.post('/info', (req, res)=> {  
   
    var rightAnswer = questionSet[0].answer.toLowerCase()
    
    console.log(rightAnswer)
    console.log(questionSet)

    var userAnswer = JSON.stringify(req.body)
    userAnswer = JSON.parse(userAnswer)
    userAnswer = userAnswer.answer.toLowerCase(0)   

    console.log(userAnswer)
     
    var correct = false;
    if(rightAnswer == userAnswer)  
    {
        console.log("yes")
        correct = true;
    }
    
     io.emit('info', req.body, rightAnswer, correct) //req.body contains the message
     res.sendStatus(200)  
       
})   
 
io.on('connection', (socket)=>{
    console.log('a user connected') 
})
 
mongoose.connect(dbUrl, {useNewUrlParser: true},  (err) => {
    console.log('mongo db connection', err)
}) 

var server = http.listen(4000, ()=> {
    console.log("server is listening on port", server.address().port)
    console.log(__dirname)
})      
