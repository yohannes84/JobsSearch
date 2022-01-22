
require("dotenv").config()
require("./api/data/db")
const express = require("express")
const routes = require("./api/routes")

const app = express();

app.use(function(req,res,next){
    console.log(req.method,req.url);
    next();
})

app.use(express.json());
app.use(express.urlencoded({extended:true}))

///CORS authentication
app.use("/api", function(req,res,next){
   res.header("Access-Control-Allow-Origin","http://localhost:4200") 
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,DELETE,POST,PUT");
   next();
})

app.use("/api", routes)

const server = app.listen(process.env.PORT, function(){
    const port = server.address().port;
    console.log("Sever is running on port: "+ port);
})
    
