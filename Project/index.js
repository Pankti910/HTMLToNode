
const express=require('express');
const app=express();
const PORT=9000;
var fs = require('fs');
const util = require('util')
var path = require('path');
var html2json = require('html2json').html2json;
const rmdir = require('rimraf');
var bodyParser = require('body-parser');
let mongoose=require('mongoose');
var {Code}=require('./Model/Code');
var Constants = require('constants');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
require('./connection')
const functions= require("./Function.js")




app.get('/', (req, res) => {
 var htmlPath = path.join(__dirname, '.', 'HTMLSource','AppPages.html');

  fs.readFile(htmlPath, 'utf8', (err, dataHtml)=>{
    const makeDir = util.promisify(fs.mkdir)
    var htmlJson=html2json(dataHtml);
    json=htmlJson.child[0].child
    var title=json.filter(obj=>{return obj.tag=="head"});
    title=title[0].child.filter(obj=>{return obj.tag=='title'})
    title=title.map(ele=>{return ele.child[0].text})
     var body=json.filter(obj=>{return obj.tag=="body"})
     var bodyForm=body[0].child.filter(obj=>{return obj.tag=="form"})
     bodyForm=bodyForm[0].child.filter(obj=>{return (obj.node=="element" && obj.attr && obj.attr.name)})
     var modelProperty=typeConversion(bodyForm.map(obj=>{return obj.attr}))
     modelProperty=JSON.stringify(modelProperty).replace(/\"/g, "")
     modelProperty=modelProperty.replace(/},/g,"},\n");
    var projectFolder=path.parse(path.basename(htmlPath)).name
    var projectFolderPath=path.join('../ProjectsDestination',projectFolder);
    if (fs.existsSync(projectFolderPath)) {
      //remove existing folder and subfolder
      removeDir(projectFolderPath)
    }
    //create project folder
     makeDir(dir=projectFolderPath).then(() => {
        console.log(`Directory ${dir} is created`)
        makeDir(dirModel=projectFolderPath+"/Model").then(()=>{
        console.log(`Directory Model${dirModel} is created`)
        Code.findOne({type:1},{genericCode:1,_id:0}).then((docs)=>{
        
          fs.writeFile(`${dirModel}/${title}.js`, eval('`'+docs.genericCode+'`'), function (err) {
          if (err) throw err;
          console.log('Saved!');
        });
        }).catch((err)=>{
          console.log(err.message)
           })
         
       }).catch(err => {
       console.log(err.message);
      })
      }).catch(err => {
       console.log(err.message)
    
    }).catch(err => {
      console.log(err.message)
  })




  
  //res.send(projectFolder)

  })
});

app.post('/',(req,res)=>{
   var codeCreate=new Code({type:req.body.type,genericCode:req.body.genericCode})
   codeCreate.save().then((result)=>{
    res.send("Save")
  }).catch((error)=>{
    res.send(error)
  })
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})


function  removeDir(projectFolderPath) {
    console.log("remove")
     const files = fs.readdirSync(projectFolderPath)

      if (files.length > 0) {
        files.forEach(function(filename) {
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

function typeConversion(data){
  var dict={}
  for(var i=0;i<data.length;i++){
    dict[data[i].id]=functions.DataTypeConverion(data[i].type)
  }
  return dict;
}