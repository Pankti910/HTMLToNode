const {Schema} = require('mongoose');
const mongoose=require("mongoose");

const CodeSchema=mongoose.Schema({

    type:{
        type:Number,
        //required:true
    },
    genericCode:{
        type:String
    }
    
    
});
const Code=mongoose.model('code',CodeSchema);
module.exports={Code};