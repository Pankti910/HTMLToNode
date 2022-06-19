
const express = require('express');
const app = express();
const PORT = 8080;
var fs = require('fs');
const util = require('util')
var path = require('path');
var html2json = require('html2json').html2json;
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const functions = require("./Function.js")
const cheerio = require('cheerio');
app.set('view engine', 'ejs');
const makeDir = util.promisify(fs.mkdir);
const _=require('lodash');
const multer = require('multer');


async function genrateNode(htmlFile,res) {
  var htmlPath = path.join(__dirname, '.', 'HTMLSource', htmlFile);

  fs.readFile(htmlPath, 'utf8', (err, dataHtml) => {

    let $ = cheerio.load(dataHtml);
    //select input,radio,title,select,checkbox,textarea from html 
    var htmlJson = html2json($.html("input,radio,title,select,checkbox,textarea,password"));

    json = htmlJson.child
    var title = json.filter(obj => { return obj.tag == "title" });
    title?title=title:title="Undefined Title";
    title = title.map(ele => { return ele.child[0].text })
    //replace space if there is space in title
    title = title[0].replace(/\s/g, "");
    
    
    //  get body element 
    var body = json.filter(obj => { return obj.tag != "title" })
    //check if html element has object has attr property and attr property has name
    var rawModel = body.filter(obj => { return (obj.node == "element" && obj.attr && obj.attr.name) })
    //remove special characters from name
    rawModel=rawModel.map((x)=>{x.attr.name=x.attr.name.replace(/[`~!@#$%^&*()|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,'');return x});
    //mapping into object
    rawModel=rawModel.map(obj => { return{attr:obj.attr,child:obj.child||null,tag:obj.tag}})
    //group by name on html elements
    var modelProperty = createModelProperty(_.groupBy(rawModel,'attr.name'))
   //get html filename
    var projectFolder = path.parse(path.basename(htmlPath)).name
   //get project folder path
    const projectFolderPath = path.join(__dirname, '../ProjectsDestination', projectFolder);

    if (fs.existsSync(projectFolderPath)) {
      //remove existing folder and subfolder
      new Promise((resolve, reject)=>{
        functions.removeDir(projectFolderPath,()=>{
          resolve();
        })

      })
      
    }
    //create project folder
    var dir;
    if(body.length>0){
      makeDir(dir = projectFolderPath).then(async() => {
          //database name title_timestamp
          var projectDB=title+"_"+Date.now();
          functions.createDir(dir);
          functions.createModel(dir, title, modelProperty);
          functions.createController(dir, title,title,modelProperty);
          functions.createRoute(dir,title);
          functions.createIndex(dir,title,modelProperty);
          functions.createPackage(dir,title);
          functions.createConnection(dir,projectDB);
          functions.createConstants(dir,_.groupBy(rawModel,'attr.name'),projectDB) 
          return res.send(dir);
        
     }).catch(err => { res.status(500).send("Something went wrong"); })
    }else{
     res.send("HTML has not form data");
    }
    
  })
}

var storageAssign = multer.diskStorage({
  destination: function (req, file, cb) {

           cb(null,"./HTMLSource/")
  },
  filename: function (req, file, cb) {
      filename=file.originalname
  
       cb(null,filename)
  }

})

var uploadFile = multer({ 
  
  storage: storageAssign
}).single("file");       
app.post("/", (req, res) => {
  uploadFile(req,res,async(err)=>{
    if(err) console.log(err);
    console.log("------------");
    
    await genrateNode(req.file.originalname,res)
    
  })
});



app.listen(PORT, () => {
 // 
 console.log(`Example app listening on port ${PORT}`);
 })



/**
 * 
 * @param {*} data -form element raw object array which is grouped by name 
 * @returns 
 */
function createModelProperty(data) {
  var dict = {};
  //access raw object one by one
  Object.keys(data).forEach((key)=>{
   var propertyAttributes=functions.ModelAttributes(data[key])
   if(propertyAttributes){
    dict[key] =propertyAttributes
   } 
   
  })
  return dict;
}
