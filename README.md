# HTMLToNode
* Generate Node crud from uploaded html file
* identify HTML elements and convert to Node.js model with validation
* generate crud APIs
* package.json,index.js ,connection.js files
* Database is created dynamically

# How to run
* cd Project
* npm i
* nodemon
* on port 8080 use POST method form data key name  should be file 
curl:
curl --location --request POST 'localhost:8080' \
--form 'file=@"/E:/form.html"'
* In the output it returns either folder path when Node.js  project generated or sends an invalid HTML   
* If API response give a folder path then go there
* npm i
* generated code run on localhost 9000
* dropdown api localhost:9000/dropdownconstant 

# Standard input HTML to genrate nodejs crud
* HTML elements should have names and all text element names should be different and all grouped element names should be different
```<intput type="text" name="name"/> <input type="number" name="name"/> <input type="radio" name="name" value="yes"/>Yes```
This html not genrate valid crud api and model
* HTML element should have a name attribute otherwise Node.js the project will not generate

# NPM packages used
1. **body-parser** -parse request to json
2. **cheerio** -parsing HTML -->get HTML tags that need to process from anywhere like inside the div tag
3. **ejs**-template engine used to generate files dynamically
4. **express**-nodejs framework
5. **html2json**-convert html to json
6. **lodash**-for array, object function group by, first, map and filters
7. **mongoose**-for ODM
8. **multer**- to upload file
9. **nodemon**-automatically restarting application

# Constraints
1. Name is essential to generate the Node Code
2. For Dropdowns with more than 10 options you need to add that reference id after fetching data from that master because there is one collection for dropdown 
EX:

| _id  | master |constant_value |
| ------------- | ------------- |------------- |
| d37598739487598394 | CITY  |SURAT|
| d73758973985735939  | STATE  |GUJARAT



In schema city and state both refer to this schema if you add STATE id in CITY it will accept 
It show after get list add that value

3. in  checkbox name should be same then it will be an array of string else different name than data type will be boolean 

```node version :v16.15.1```
