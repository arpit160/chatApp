const{Content}=require('./../models/chat')
mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/chatapp', {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>
{
    console.log('database connected')
})
.catch((e)=>{console.log(e)});

for(i=0;i<5;i++)
{
    d={username:'arpit',room:'room1',content:'qwerty'}
    content=new Content(d);
    content.save();
}