var http = require("http")

var server = http.createServer((req,res)=>{
    res.setHeader("Access-Control-Allow-origin","*")
    res.end(JSON.stringify({message:"Hello"}))
})
server.listen(5959,()=>{
    console.log("server is started")
})