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
    module.exports={DataTypeConverion};
