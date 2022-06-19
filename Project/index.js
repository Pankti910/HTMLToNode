
const express = require('express');
const app = express();
const PORT = 8080;
var fs = require('fs');
const util = require('util')
var path = require('path');
var html2json = require('html2json').html2json;
const rmdir = require('rimraf');
var bodyParser = require('body-parser');
let mongoose = require('mongoose');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
require('./connection')
const functions = require("./Function.js")
const cheerio = require('cheerio');
const staticPath = path.join(__dirname, './public/');
app.use(express.static(staticPath));
app.set('view engine', 'ejs');
const makeDir = util.promisify(fs.mkdir)
const makeFile = util.promisify(fs.writeFile)
const _=require('lodash')

function genrateNode(htmlFile) {
  var htmlPath = path.join(__dirname, '.', 'HTMLSource', htmlFile);

  fs.readFile(htmlPath, 'utf8', (err, dataHtml) => {

    let $ = cheerio.load(dataHtml);
    //select input,radio,title,select,checkbox,textarea from html 
    var htmlJson = html2json($.html("input,radio,title,select,checkbox,textarea"));

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
    if(modelProperty){
      makeDir(dir = projectFolderPath).then(() => {
        functions.createDir(dir);
        functions.createModel(dir, title, modelProperty);
        functions.createController(dir, title,title);
        functions.createRoute(dir,title);
        functions.createIndex(dir,title,modelProperty);
        functions.createPackage(dir,title);
        functions.createConnection(dir);
        functions.createConstants(dir,_.groupBy(rawModel,'attr.name'))
     }).catch(err => { console.log(err.message) })
    }else{
      res.status(200).send("HTML not have any valid form data")
    }
    
  })
}





app.listen(PORT, () => {
  genrateNode("form.HTML")
 //console.log(`Example app listening on port ${PORT}`)
 
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
   dict[key] = functions.ModelAttributes(data[key])
  })
  return dict;
}