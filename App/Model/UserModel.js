const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserSchema = new Schema({
    name:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    password:{
        type:String,
        required: true
    },
    image:{
        type:String,
        required: false
    },
    is_verified:{
        type:Boolean,
        default:false
    },
    // is_admin:{
    //     type:Boolean,
    //     default:false
    // },

    role:{
        type:String,
        enum:["user","admin","author"],
        default: 'user'
    }
},{
    timestamps: true
})

const UserModel = mongoose.model("User", UserSchema)
module.exports = UserModel