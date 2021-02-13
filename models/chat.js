mongoose = require('mongoose');


const msgschema=new mongoose.Schema({
    username:String,
    room:String,
    content:
    [{
        by:String,
        date:String,
        actual_msg:String,
        space:String
    } ]
})

Content = mongoose.model('Content',msgschema)

module.exports={Content};
