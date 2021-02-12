express=require('express');
path=require('path')
socketio=require('socket.io')
http=require('http')
moment=require('moment')
engine = require('ejs-mate')
bodyParser = require('body-parser');
app=express();
server=http.createServer(app)
let currentuser;
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.engine('ejs', engine);
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))

const{
    bindinfo,
    getroomusers,
    getcurrentuser,
    getroomusersexcept,
    removeuser,print
}=require('./public/main.js')

app.get('/',(req,res)=>
{
    res.render('entrypoint.ejs')
})

app.get('/chat',(req,res)=>
{
    console.log(req.query)
    res.render('chatpage.ejs',{username:req.query.username,room:req.query.room})
})

io=socketio(server);
console.log('apple');
io.on('connection',(socket)=>
{
    
    socket.on('inform',(data)=>
    {
        date=moment().format('h:mm a')
        console.log('inside inform')
        console.log('data',data)
        bindinfo(socket.id,data.username,data.room);
        let roomusers=getroomusers(data.room);
        console.log('roomusers',roomusers)
        socket.join(data.room)
        socket.emit('write',[`Welcome (${data.username}) to our chat application`,date,'center','Admin'])
        socket.broadcast.to(data.room).emit('write',[`<b>${data.username}</b> has joined the chat`,date,'center','Admin'])
        io.to(data.room).emit('updatelist',roomusers)
       
    })

    socket.on('message-sent',(message)=>
    {
        date=moment().format('h:mm a')
        console.log('msg inside')
        let currentuser=getcurrentuser(socket.id)
        console.log('currentuser',currentuser)
        socket.emit('write',[message,date,'right','you']);
        socket.broadcast.to(currentuser.room).emit('write',[message,date,'left',currentuser.username]);
    })


    socket.on('disconnect',()=>
    {
        date=moment().format('h:mm a')
        console.log('disconnect inside')        
        let currentuser=getcurrentuser(socket.id)
        let roomusersexcept=getroomusersexcept(socket.id,currentuser.room);
        console.log('currentuser',currentuser);
        console.log('roomusersexcept',roomusersexcept)
        removeuser(socket.id)
        print();
        socket.broadcast.to(currentuser.room).emit('write',[`<b>${currentuser.username}</b> left the chat`,date,'center','Admin'])
        socket.broadcast.to(currentuser.room).emit('updatelist',roomusersexcept)
    })
})


server.listen(3000,()=>
{
    console.log('listening on port 3000...')
})