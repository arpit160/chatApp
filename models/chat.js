mongoose = require('mongoose');


const msgschema=new mongoose.Schema({
    username:String,
    room:String,
    content:String  
})

Content = mongoose.model('Content',msgschema)

module.exports={Content};
