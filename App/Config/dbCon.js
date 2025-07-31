const mongoose = require("mongoose")

const DBCon = async()=>{
    const con= await mongoose.connect(process.env.MONGO_URL)
    if(con){
        console.log('db connected');
        
    } else{
        console.log('db connection failed');
        
    }
}

module.exports= DBCon