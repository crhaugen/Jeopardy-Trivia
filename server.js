var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

app.use(bodyParser.json())
app.use(express.static(__dirname))
app.use(bodyParser.urlencoded({extended: false}))

var dbUrl = 'mongodb+srv://user:babycake@quizinfo-shgpi.mongodb.net/quiz?retryWrites=true'

var Question = mongoose.model('info', new mongoose.Schema({}),'info');
var questionSet;
 
app.get('/info', (req, res)=> { 

    //getting random question set from my mongodb database
    Question.aggregate([{ $sample: {size: 1}}], (err, info) => {
      
        console.log(info[0].answer) 
        console.log(info[0].question)
        
        questionSet = info
        res.send(info)  
    })
})    
  
app.post('/info', (req, res)=> {  
   
    
    var rightAnswer = questionSet[0].answer.toLowerCase()
    
    //turning users answer into a comparable string
    var userAnswer = JSON.stringify(req.body)
    userAnswer = JSON.parse(userAnswer)
    userAnswer = userAnswer.answer.toLowerCase(0)   

    console.log(userAnswer)
     
    var correct = false;
    if(rightAnswer == userAnswer)  
    {
        correct = true;
    }
    
    //sending answers and if it is correct
     io.emit('info', req.body, rightAnswer, correct) //req.body contains users answer
     res.sendStatus(200)  
       
})   
 
//connecting a user
io.on('connection', (socket)=>{
    console.log('a user connected') 
})
 
//connecting to my mongodb database
mongoose.connect(dbUrl, {useNewUrlParser: true},  (err) => {
    console.log('mongo db connection', err)
}) 

var server = http.listen(4000, ()=> {
    console.log("server is listening on port", server.address().port)
    console.log(__dirname)
})      