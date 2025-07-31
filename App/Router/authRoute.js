const express = require("express")
const AuthController = require("../Controller/AuthController")
const userProfileImageUpload = require("../Helper/userProfileImage")
const router = express.Router()


router.post("/auth/register", userProfileImageUpload.single('image'), AuthController.register)
router.post("/auth/verify-otp",AuthController.verifyOtp)
router.post("/auth/reset-password-link",AuthController.resetPasswordLink)
router.post("/auth/reset-password/:id/:token",AuthController.confirmPassword)
router.post("/auth/login",AuthController.login)

module.exports= router