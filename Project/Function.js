
var fs = require('fs');    
    function removeDir(projectFolderPath) {
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
    
    
    
    function DataTypeConverion(data) { 
     var typeDict={
         "text":"String"
     }
     if(typeDict[data]){
         return {type:typeDict[data]}
     } 
     else{
         return null;
     }

    };
    
    
    
    function GetDataFromHTML(jsonObj){

    }
    
    module.exports={removeDir,DataTypeConverion};
