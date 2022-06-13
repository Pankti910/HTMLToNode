const _=require('lodash')
const express = require('express');
const app = express();
var fs = require('fs');
const util = require('util')
const makeDir = util.promisify(fs.mkdir)
const makeFile = util.promisify(fs.writeFile)
var path = require('path');
const { type } = require('os');
const staticPath = path.join(__dirname, './public/');
app.use(express.static(staticPath));
app.set('view engine', 'ejs');

function removeDir(projectFolderPath) {
  const files = fs.readdirSync(projectFolderPath)
  console.log('remove')

  if (files.length > 0) {
    files.forEach(function (filename) {
      if (fs.statSync(projectFolderPath + "/" + filename).isDirectory()) {
        removeDir(projectFolderPath + "/" + filename)
      } else {
        fs.unlinkSync(projectFolderPath + "/" + filename)
      }
    })
    fs.rmdirSync(projectFolderPath)
  } else {
    fs.rmdirSync(projectFolderPath)
  }

}

function ModelAttributes(data) {

  if(data.length==1 && (_.first(data).attr.type=="text"||_.first(data).attr.type=="number"||_.first(data).attr.type=="email")){
     data=_.first(data);
  }
  else if(_.first(data).attr.type=='radio'){
     _.first(data).attr["values"]= data.map((x)=>{return x.attr.value});
    data=_.first(data);
  }
  else if(_.first(data).attr.type=='checkbox'){ 
    _.first(data).attr["values"]= data.map((x)=>{return x.attr.value});
   data=_.first(data);
 }
  else if(_.first(data).tag=="select"){
    _.first(data).attr["values"]= _.first(data).child.filter((x)=>{return x.attr}).map((y)=>y.attr.value);
    data=_.first(data);
    data['attr']['type']="select";
  }

  var typeDict = {
    "text": "String",
    "number":"Number",
    "email":"String",
    "date":"Date",
    "radio":"String",
    "select":"String",
    "checkbox":(data.attr.type=="checkbox" && data.attr.values.length>1)?"[String]":"Boolean"
  }
  if (typeDict[data.attr.type]){
    obj={
      type:typeDict[data.attr.type],
      ...(data.attr.required!=undefined) &&{required:`[true,"${data.attr.name} is required"]`},
      ...(data.attr.min!=undefined && data.attr.min) && {min:`[${data.min},"${data.attr.name} must be at least ${data.attr.min}"]`},
      ...(data.attr.min!=undefined && data.attr.max) && {max:`[${data.attr.max},"${data.attr.name} must be up to ${data.attr.max}"]`},
      ...(data.attr.type=='email')&&{match: `[new RegExp(/[a-z0-9]+@[a-z]+\.[a-z]{2,3}/), "Please enter a valid email address"]`},
      ...(data.attr.type=='radio'||data.attr.type=='select'||(data.attr.type=='checkbox' && data.attr.values.length>1))&&{enum:`{values:[${"'" + data.attr.values.join("','") + "'"}],message:"Please choose ${data.attr.name.replace("[", "").replace("]","")}  from ${data.attr.values}"}`}
    
    
    }
    return obj;
  }
  else {
    return null;
  }

};

function createModel(projectFolderPath, model, modelProperty) {
    app.render("Model", { model: model, modelProperty: modelProperty }, (err, res) => {
      if (err) console.log("Error occur in model creation");
      makeFile(`${projectFolderPath}/Model/${model}.js`, res).then(() => {
        console.log("Model Created");

      }).catch((err) => { console.log("Error occur in model creation") });
    })


  }

function createController(projectFolderPath, title,) {
  
    app.render("Controller", { title: title }, (err, res) => {
      if (err) console.log("Error occur in model creation");
      makeFile(`${projectFolderPath}/Controller/${title}Controller.js`, res).then(() => {
        console.log("Controller Created");
      }).catch((err) => { console.log("Error occur in Controller creation") });
    })


  
}

function createRoute(projectFolderPath, title,) {
 
    app.render("Route", { title: title }, (err,res) => {
      if (err) console.log("Error occur in route creation");
      makeFile(`${projectFolderPath}/Route/${title}Route.js`, res).then(() => {
        console.log("Route Created");
      }).catch((err) => { console.log("Error occur in route creation") });
    })


 
}
function createIndex(projectFolderPath,title) {
  
  app.render("Index", { title: title }, (err,res) => {
    if (err) console.log("Error occur in route creation");
    makeFile(`${projectFolderPath}/index.js`, res).then(() => {
      console.log("Index Created");
    }).catch((err) => { console.log("Error occur in Index creation") });
  })
}
function createPackage(projectFolderPath,title) {
  
  app.render("Package", { title: title }, (err,res) => {
    if (err) console.log("Error occur in Package.json creation");
    makeFile(`${projectFolderPath}/package.json`, res).then(() => {
      console.log("Package.json Created");
    }).catch((err) => { console.log("Error occur in Package.json creation") });
  })
}
function createConnection(projectFolderPath) {
  app.render("Connection",(err,res) => {
    if (err) console.log("Error occur in connection.js creation");
    makeFile(`${projectFolderPath}/connection.js`, res).then(() => {
      console.log("connection.js Created");
    }).catch((err) => { console.log("Error occur in connection.js creation") });
  })
}
function  createConstants(projectFolderPath,rawData) {
  var constatntDist={}
  Object.keys(rawData).forEach((key)=>{
    if(rawData[key].length>1 && !rawData[key].child){
      constatntDist[_.first(rawData[key]).attr.name.toUpperCase().replace("[", "").replace("]","")]=rawData[key].map((x)=>{return `"${x.attr.value}"`});
    }
    else if(_.first(rawData[key]).child){
      constatntDist[_.first(rawData[key]).attr.name.toUpperCase().replace("[", "").replace("]","")]= _.first(rawData[key]).child.filter((x)=>{return x.attr}).map((y)=>`"${y.attr.value}"`);
    }
  })
  app.render("Constants",{constants:constatntDist},(err,res)=>{
    if(err) console.log(err.message)
    makeFile(`${projectFolderPath}/constants.js`,res).then(()=>{
      console.log("constantjs created")
    }).catch((err) => { console.log("Error occur in constant.js creation") });    
  })
}
function createDir(projectFolderPath){
  var folders=["Model","Controller","Route"];
  _.map((folders),(x)=>{
    makeDir(dirRoute = `${projectFolderPath}/${x}`).catch((err)=>console.log(err))
  })
    

}

module.exports = { removeDir,createDir, ModelAttributes, createModel, createController, createRoute,createIndex,createPackage,createConnection,createConstants};
