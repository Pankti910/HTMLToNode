const _ = require('lodash')
const express = require('express');
const app = express();
var fs = require('fs');
const util = require('util')
const makeDir = util.promisify(fs.mkdir)
const makeFile = util.promisify(fs.writeFile)
const readFile=util.promisify(fs.readFile);
app.set('view engine', 'ejs');
var { dropdownconstant } = require('./Model/DropDownConstant');
var mongoose = require('mongoose');


/*
 *remove existing folder and its sub-folders 
 */
function removeDir(projectFolderPath) {
  const files = fs.readdirSync(projectFolderPath)

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

/**
 * model  property creation function here all property and it's atrubutes are defined 
 * @param {*} data - it is an object which were grouped by
 * @returns -model property  attributes object
 */
function ModelAttributes(data) {
  //conditions to check attribute and it's value and assign to data
  if (data.length == 1 && (_.first(data).attr.type == "text" || _.first(data).attr.type == "number" || _.first(data).attr.type == "email"||_.first(data).attr.type == "date")||_.first(data).attr.type == "password") {
    data = _.first(data);
  }
  else if (_.first(data).attr.type == 'radio') {
    var defaultValue=data.filter((x) => { return x.attr.checked });
    _.first(data).attr["values"] = data.map((x) => { return x.attr.value });
    data = _.first(data);
  }
  else if (_.first(data).attr.type == 'checkbox') {
    _.first(data).attr["values"] = data.map((x) => { return x.attr.value });
    data = _.first(data);
  }
  else if (_.first(data).tag == "select") {
    _.first(data).attr["values"] = _.first(data).child.filter((x) => { return x.attr }).map((y) => y.attr.value);
    data = _.first(data);
    data['attr']['type'] = "select";
  }
  else if (data.length == 1 && _.first(data).tag == "textarea") {
    data = _.first(data);
    data['attr']['type'] = "textarea";
  }
 

  //dictionary to property data type
  //some checkbox and select type assign by conditions 
  //select--->value is greater than 10 type will be string more than 10 type will be Schema.Types.ObjectId
  //for checkbox if value is greater than  1 than value be array of string else it will be boolean
  var typeDict = {
    "text": "String",
    "number": "Number",
    "email": "String",
    "date": "Date",
    "radio": "String",
    "select": (data.attr.type == "select" && data.attr.values.length <= 10) ? "String" : 'Schema.Types.ObjectId',
    "checkbox": (data.attr.type == "checkbox" && data.attr.values.length > 1) ? "[String]" : "Boolean",
    "textarea": "String",
    "password":"String",
  }
  // condition to check is there datatype or not
  if (typeDict[data.attr.type]) {
    //this object has mutliple attributes based on conditions
    obj = {
      type: typeDict[data.attr.type],
      ...(data.attr.required != undefined) && { required: `[true,"${data.attr.name} is required"]` },
      ...(data.attr.min != undefined && data.attr.min) && { min: `[${data.min},"${data.attr.name} must be at least ${data.attr.min}"]` },
      ...(data.attr.min != undefined && data.attr.max) && { max: `[${data.attr.max},"${data.attr.name} must be up to ${data.attr.max}"]` },
      ...(data.attr.type == 'email'||data.attr.name == 'email'||data.attr.name == 'mail') && { match: `[new RegExp(/[a-z0-9]+@[a-z]+\.[a-z]{2,3}/), "Please enter a valid email address"]` },
      ...(data.attr.type == 'radio' || (data.attr.type == 'select' && data.attr.values.length <= 10) || (data.attr.type == 'checkbox' && data.attr.values.length > 1)) && { enum: `{values:constants.${data.attr.name},message:"Invalid selection for ${data.attr.name}"}` },
      ...(data.attr.type == 'select' && (data.attr.values.length > 10) && { ref: `"dropdownconstant"` }),
      ...(data.attr.pattern) &&{ match: `[new RegExp(/${data.attr.pattern}/), "Please enter a valid ${data.attr.name} "]` },
      }
    return obj;
  }
  else {
    return null;
  }

};
/**
 * This function is to create model 
 * @param {*} projectFolderPath -project folder path 
 * @param {*} model -model name
 * @param {*} modelProperty -model property and attributes 
 */
function createModel(projectFolderPath, model, modelProperty) {

   var constant=checkConstantFileModel(modelProperty);
    app.render("Model", { model: model, modelProperty: modelProperty, constantFile: constant.constantFile }, (err, res) => {
      if (err) console.log("Error occurs in model creation");
      makeFile(`${projectFolderPath}/Model/${model}.js`, res).then(() => {
      console.log("Model Created");

    }).catch((err) => { console.log("Error occurs in model creation") });
  })


};
/**
 * This function is to create controller
 * @param {*} projectFolderPath -project folder path
 * @param {*} controller -controller name
 * @param {*} model -model name
 */
function createController(projectFolderPath, controller, model,costant=false) {
 // var constant=checkConstantFileModel(modelProperty);
  app.render("Controller", { controller: controller, model: model,constant:costant }, (err, res) => {
    if (err) console.log("Error occurs in controller creation");
    makeFile(`${projectFolderPath}/Controller/${controller}Controller.js`, res).then(() => {
      console.log("Controller Created");
    }).catch((err) => { console.log(err) });
  })
};

/**
 * This function is to create route
 * @param {*} projectFolderPath -project folder path
 * @param {*} controllerName -controller name
 */
function createRoute(projectFolderPath, controllerName) {

  app.render("Route", { controllerName: controllerName }, (err, res) => {
    if (err) console.log("Error occur in route creation");
    makeFile(`${projectFolderPath}/Route/${controllerName}Route.js`, res).then(() => {
      console.log("Route Created");
    }).catch((err) => { console.log("Error occur in route creation") });
  })



};

/**
 * This is used to create index.js file
 * @param {*} projectFolderPath -project folder path
 * @param {*} title -project title
 * @param {*} modelProperty -model property 
 */
function createIndex(projectFolderPath, title,modelProperty) {

  var constant=checkConstantFileModel(modelProperty)
  app.render("Index", { title: title,constantRoute:constant.constantModel}, (err, res) => {
    if (err) console.log(err);
    makeFile(`${projectFolderPath}/index.js`, res).then(() => {
      console.log("Index Created");
    }).catch((err) => { console.log("Error occur in Index creation") });
  })
};

/**
 * Package.json cretion function
 * @param {*} projectFolderPath -project path
 * @param {*} title -project title
 */
function createPackage(projectFolderPath, title) {

  app.render("Package", { title: title }, (err, res) => {
    if (err) console.log("Error occur in Package.json creation");
    makeFile(`${projectFolderPath}/package.json`, res).then(() => {
      console.log("Package.json Created");
    }).catch((err) => { console.log("Error occur in Package.json creation") });
  })
};
/**
 * this is to create connection.js file
 * @param {*} projectFolderPath -project folder path 
 */
function createConnection(projectFolderPath,title) {
  app.render("Connection",{title:title}, (err, res) => {
    if (err) console.log("Error occur in connection.js creation");
    makeFile(`${projectFolderPath}/connection.js`, res).then(() => {
      console.log("connection.js Created");
    }).catch((err) => { console.log("Error occur in connection.js creation") });
  })
};

/**
 * This function is used to create constant file and constant model 
 * @param {*} projectFolderPath -project folder path
 * @param {*} rawData -it is raw model property of
 */
function createConstants(projectFolderPath, rawData,databaseConnection) {
  var constatntDist = {};
  var constantDB=false;
  var mongoDB = 'mongodb://127.0.0.1/'+databaseConnection;
  console.log(mongoDB);
  mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
  
  //Get the default connection
  var db = mongoose.connection;
  
  //Bind connection to error event (to get notification of connection errors)
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));

  Object.keys(rawData).forEach((key) => {

    //this condition is for the radio button and checkbox 
    //values must be more than 1  
    if (rawData[key].length > 1 && !rawData[key].child) {
      constatntDist[_.first(rawData[key]).attr.name]=rawData[key].map((x)=>{return `"${x.attr.value}"`});
    }

    //this is condition for the dropdown
    else if (_.first(rawData[key]).child) {

      constatntDist[_.first(rawData[key]).attr.name] = _.first(rawData[key]).child.filter((x) => { return x.attr }).map((y) => `"${y.attr.value}"`);
      //check if values are more than 10
      var childLength=constatntDist[_.first(rawData[key]).attr.name].length 
      if (childLength> 10) {
        //data which will be instered into database
        dropDownBulkData = constatntDist[_.first(rawData[key]).attr.name].map((x) => { return { master: key.toUpperCase(), constant_value: x.replace(/\"/g, '') } });
        dropdownconstant.insertMany(dropDownBulkData).then((res) => { console.log(`${key} data insert`) }).catch((e) => { console.log(e) }) 
        delete constatntDist[_.first(rawData[key]).attr.name];
        //set flag true
        constantDB=true;
      }
    }
  })
  
  //constant into database
  //model controller route creation
  if(constantDB){
    createModel(projectFolderPath, 'dropdownconstant', { constants: { type: 'String' }, master: { type: 'String' } });
    createController(projectFolderPath,'dropdownconstant','dropdownconstant',true);
    createRoute(projectFolderPath,'dropdownconstant','dropdownconstant');
  }
  
  //constants into constant file
  if (constatntDist) {
    app.render("Constants", { constants: constatntDist }, (err, res) => {
      if (err) console.log(err.message)
      makeFile(`${projectFolderPath}/constants.js`, res).then(() => {
        console.log("constant.js created")
      }).catch((err) => { console.log("Error occur in constant.js creation") });
    })
  }

};
/**
 * 
 * @param {*} projectFolderPath -path where this folder should be created
 */
function createDir(projectFolderPath) {
  var folders = ["Model", "Controller", "Route"];
  _.map((folders), (x) => {
    makeDir(dirRoute = `${projectFolderPath}/${x}`).catch((err) => console.log(err))
  })

};

/**
 * 
 * this is useful to check in file costant file or constant route should add or not 
 * @param {*} modelProperty -array of an object 
 * @returns default it will return {constantFile:false,constantModel:false}
 */
function checkConstantFileModel(modelProperty) {
  var addConstantFile = false;
  var addConstantModel = false;

  var enumPropeties = _.filter(modelProperty, (v, k) => { return v.enum; });
  var objectType = _.filter(modelProperty, (v, k) => { return v.type == 'Schema.Types.ObjectId'; });
  if (enumPropeties.length > 0) {
    addConstantFile = true;
  }
  if (objectType.length > 0) {
    addConstantModel = true;
  }
  return {constantFile:addConstantFile,constantModel:addConstantModel}
}

module.exports = { removeDir, createDir, ModelAttributes, createModel, createController, createRoute, createIndex, createPackage, createConnection, createConstants };
