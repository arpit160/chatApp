express=require('express');
path=require('path')
mongoose = require('mongoose')
socketio=require('socket.io')
http=require('http')
moment=require('moment')
engine = require('ejs-mate')
bodyParser = require('body-parser');
const { nextTick } = require('process');
const {Content}=require('./models/chat')
app=express();
server=http.createServer(app)
let currentuser;

mongoose.connect('mongodb://localhost:27017/chatapp', {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>
{
    console.log('database connected')
})
.catch((e)=>{console.log(e)});

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
    let msg_arr=[]
    socket.on('inform',async (data)=>
    {
        msgs=await Content.findOne({username:data.username,room:data.room})
        console.log('msgs are' ,msgs);
        if(msgs)
        {
        msgs=msgs.content;
        for(let i=0;i<msgs.length;i++)
        {
            msg_arr.push(JSON.stringify(msgs[i]));
            console.log('i is',i)
            socket.emit('write',[msgs[i].actual_msg,msgs[i].date,msgs[i].space,msgs[i].by])
        }}
        date=moment().format('h:mm a')
        console.log('inside inform')
        console.log('data',data)
        bindinfo(socket.id,data.username,data.room);
        let roomusers=getroomusers(data.room);
        console.log('roomusers',roomusers)
        socket.join(data.room)
        if(msg_arr.length==0)
        {
            socket.emit('write',[`<center>Welcome (${data.username}) to our chat application</center>`,date,'center','Admin'])
        }
        socket.broadcast.to(data.room).emit('write',[`<center><b>${data.username}</b> has joined the chat</center>`,date,'center','Admin'])
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

     socket.on('save',async(arr)=>
     {
        let currentuser=getcurrentuser(socket.id);
        for(let i=0;i<arr.length;i++)
        {
            msg_arr.push(arr[i]);
        }

        let brr=[]
        for(let i=0;i<msg_arr.length;i++)
        {
            brr.push(JSON.parse(msg_arr[i]));
        }
        msg_arr=brr;
        console.log('msg_arr',msg_arr)
        try{
            user_content=await Content.findOne({username:currentuser.username,room:currentuser.room})
            update_data={username:currentuser.username,room:currentuser.room,content:msg_arr}
            if(user_content)
            {
                await Content.updateOne({username:currentuser.username,room:currentuser.room},update_data)
            }
            else{
                a=new Content(update_data)
                await a.save()
            }
        }
        catch(e)
        {
            console.log(e);
        }
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
        socket.broadcast.to(currentuser.room).emit('write',[`<center><b>${currentuser.username}</b> left the chat</center>`,date,'center','Admin'])
        socket.broadcast.to(currentuser.room).emit('updatelist',roomusersexcept);
        
    })
})


server.listen(3000,()=>
{
    console.log('listening on port 3000...')
})