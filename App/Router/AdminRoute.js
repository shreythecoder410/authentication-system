const express = require('express')
const AdminController = require("../Controller/AdminController")

const router = express.Router()


router.post("/login",AdminController.adminLogin)



module.exports = router