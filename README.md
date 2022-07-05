# HTMLToNode
* Genrate Node crud from uploaded html file
* identify html elements and convert to nodejs model with validation
* genrate crud apis
* package.json,index.js ,connection.js files
* Database is created dyamically

# How to run
* cd Project
* npm i
* nodemon
* on port 8080 use post method form data key name  should be file 
curl:
curl --location --request POST 'localhost:8080' \
--form 'file=@"/E:/form.html"'
* In output it return either folder path when node is genrated or send invalid html   
* If api response give folder path then go there
* npm i
* genrated code run on localhost 9000
* dropdown api localhost:9000/dropdownconstant 

# Standard input HTML to genrate nodejs crud
* HTML elements should have name and all text element name should be different and all grouped element name should be different
```<intput type="text" name="name"/> <input type="number" name="name"/> <input type="radio" name="name" value="yes"/>Yes```
This html not genrate valid crud api and model
* HTML element should have name attribute otherwise nodejs project will not genrate

# NPM packages used
1. **body-parser** -parse request to json
2. **cheerio** -parsing html-->get html tags which need to process from anywhere like inside div tag
3. **ejs**-template engine used to genrate files dynamically
4. **express**-nodejs framework
5. **html2json**-convert html to json
6. **lodash**-for array ,object function groupby,first,map and filters
7. **mongoose**-for ODM
8. **multer**- to upload file
9. **nodemon**-automatically restarting application

# Constraints
1. Name is essential to generate the Node Code
2. Dropdowns with more than 10 options you need to add that reference id after fetching data from that master because there is one collection for dropdown 
EX:

| _id  | master |constant_value |
| ------------- | ------------- |------------- |
| d37598739487598394 | CITY  |SURAT|
| d73758973985735939  | STATE  |GUJARAT



In schema city and state both refer to this schema if you add STATE id in CITY it will accept 
It show after get list add that value

3. in  checkbox name should be same then it will be an array of string else different name than data type will be boolean 

```node version :v16.15.1```
