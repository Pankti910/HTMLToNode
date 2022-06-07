
const express = require('express');
const app = express();
var fs = require('fs');
const util = require('util')
const makeDir = util.promisify(fs.mkdir)
const makeFile = util.promisify(fs.writeFile)
var path = require('path');
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

function DataTypeConverion(data) {
  console.log(data.required)
  var typeDict = {
    "text": "String",
    "number":"Number",
    "email":"String"
  }
  if (typeDict[data.type]) {
    obj={
      type:typeDict[data.type],
      ...(data.required!=undefined) &&{required:`[true,"${data.name} is required"]`},
      ...(data.min!=undefined && data.min) && {min:`[${data.min},"${data.name} must be at leat ${data.min}"]`},
      ...(data.min!=undefined && data.max) && {max:`[${data.max},"${data.name} must be up to ${data.max}"]`},
      ...(data.type=='email')&&{match: `[new RegExp(/[a-z0-9]+@[a-z]+\.[a-z]{2,3}/), "Please enter a valid email address"]`}
    }
    return obj;
  }
  else {
    return null;
  }

};

function createModel(projectFolderPath, model, modelProperty) {
  makeDir(dirModel = `${projectFolderPath}/Model`).then(() => {
    console.log(`Directory ${dirModel} is created`)

    app.render("Model", { model: model, modelProperty: modelProperty }, (err, res) => {
      if (err) console.log("Error occur in model creation");
      makeFile(`${dirModel}/${model}.js`, res).then(() => {
        console.log("Model Created");

      }).catch((err) => { console.log("Error occur in model creation") });
    })


  }).catch(err => { console.log(err.message); return `Model creation issue` })
}

function createController(projectFolderPath, title,) {
  makeDir(dirController = `${projectFolderPath}/Controller`).then(() => {
    console.log(`Directory ${dirController} is created`)

    app.render("Controller", { title: title }, (err, res) => {
      if (err) console.log("Error occur in model creation");
      makeFile(`${dirController}/${title}Controller.js`, res).then(() => {
        console.log("Controller Created");
      }).catch((err) => { console.log("Error occur in Controller creation") });
    })


  }).catch(err => { console.log(err.message); return `Controller creation issue` })
}

function createRoute(projectFolderPath, title,) {
  makeDir(dirRoute = `${projectFolderPath}/Route`).then(() => {
    console.log(`Directory ${dirRoute} is created`)

    app.render("Route", { title: title }, (err,res) => {
      if (err) console.log("Error occur in route creation");
      makeFile(`${dirRoute}/${title}Route.js`, res).then(() => {
        console.log("Route Created");
      }).catch((err) => { console.log("Error occur in route creation") });
    })


  }).catch(err => { console.log(err.message); return `Route creation issue` })
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
module.exports = { removeDir, DataTypeConverion, createModel, createController, createRoute,createIndex,createPackage,createConnection};
