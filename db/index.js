const mongoose=require("mongoose")

const connectToMongodb=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("DB Connected Successfully!!")
    }
    catch(error){
        console.log(error)
    }
}

module.exports=connectToMongodb