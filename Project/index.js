
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
var Constants = require('constants');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
require('./connection')
const functions = require("./Function.js")
let constants = require('./constant');
const cheerio = require('cheerio');
const staticPath = path.join(__dirname, './public/');
app.use(express.static(staticPath));
app.set('view engine', 'ejs');
const makeDir = util.promisify(fs.mkdir)
const makeFile = util.promisify(fs.writeFile)


function genrateNode(htmlFile) {
  var htmlPath = path.join(__dirname, '.', 'HTMLSource', htmlFile);

  fs.readFile(htmlPath, 'utf8', (err, dataHtml) => {

    let $ = cheerio.load(dataHtml);
    //res.send($.html("input,select,title"))
    var htmlJson = html2json($.html("input,select,title"));

    json = htmlJson.child
    var title = json.filter(obj => { return obj.tag == "title" });
    title = title.map(ele => { return ele.child[0].text })
    title = title[0].replace(/\s/g, "");
    var body = json.filter(obj => { return obj.tag != "title" })
    //var bodyForm=body[0].child.filter(obj=>{return obj.tag=="form"})
    bodyForm = body.filter(obj => { return (obj.node == "element" && obj.attr && obj.attr.name) })
    var modelProperty = typeConversion(bodyForm.map(obj => { return obj.attr }))
    var projectFolder = path.parse(path.basename(htmlPath)).name
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
    makeDir(dir = projectFolderPath).then(() => {
      console.log(`Directory ${dir} is created`)
      functions.createModel(dir, title, modelProperty);
      functions.createController(dir, title);
      functions.createRoute(dir,title);
      functions.createIndex(dir,title);
      functions.createPackage(dir,title);
      functions.createConnection(dir)
    }).catch(err => { console.log(err.message) })
  })
}

app.get('/', async (req, res) => {
  genrateNode("AppPages.HTML")
});

app.post('/', (req, res) => {
  var codeCreate = new Code({ type: req.body.type, genericCode: req.body.genericCode })
  codeCreate.save().then((result) => {
    res.send("Save")
  }).catch((error) => {
    res.send(error)
  })
})



app.listen(PORT, () => {
  genrateNode("AppPages.HTML")
  console.log(`Example app listening on port ${PORT}`)
 
})




function typeConversion(data) {
  var dict = {};
  for (var i = 0; i < data.length; i++) {
    dict[data[i].name] = functions.DataTypeConverion(data[i].type)
  }
  return dict;
}