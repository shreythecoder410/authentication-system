const express = require("express")
const UserController = require("../Controller/UserController")
const router = express.Router()
const userProfileImageUpload = require("../Helper/userProfileImage")
const {Auth} = require("../Middleware/auth")


router.use(Auth)
router.get("/update/password",UserController.updatePassword)
router.get("/profile",UserController.userProfile)
router.post('/profile/update/:id',userProfileImageUpload.single("image"),UserController.updateProfile)

module.exports = router