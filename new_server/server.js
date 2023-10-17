const express = require('express')

app = express()

app.get('/',(req,res)=>{
    req.send("Test")
})

app.listen(port:3000)