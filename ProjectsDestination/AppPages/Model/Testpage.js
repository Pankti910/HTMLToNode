const {Schema} = require('mongoose');
const mongoose=require("mongoose");
const TestpageSchema=mongoose.Schema({

    type:{
        type:Number,
        //required:true
    },
    genericCode:{
        type:String
    }
    
    
});
const Testpage=mongoose.model(Testpage,TestpageSchema);
module.exports={Testpage};