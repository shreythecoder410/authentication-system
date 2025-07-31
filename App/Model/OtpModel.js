const mongoose = require("mongoose")
const Schema = mongoose.Schema

const otpSchema = new Schema({
    userId:{type: mongoose.Schema.Types.ObjectId, ref:"User",required: true},
    otp:{type: String,required: true},
    createdAt:{type: Date,default:Date.now, expires:"15m"}
})

const OtpModel = mongoose.model("EmailVerification", otpSchema);

module.exports = OtpModel;