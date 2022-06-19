const {Schema} = require('mongoose');
const mongoose=require("mongoose");
const dropdownconstantSchema=mongoose.Schema(
{constant_value:{type:String},
master:{type:String}}    
);
const dropdownconstant=mongoose.model("dropdownconstant",dropdownconstantSchema);
module.exports={dropdownconstant};