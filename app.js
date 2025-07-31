const express = require("express")
const path= require("path")
const dbConnection = require("./App/Config/dbCon.js")
const dotenv = require('dotenv').config()



const app= express()

dbConnection()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

const AdminSetupRouter = require("./App/Router/adminSetupRoute.js")
app.use(AdminSetupRouter)

const AdminRouter= require("./App/Router/AdminRoute.js")
app.use("/api/admin",AdminRouter)

const AuthRouter = require("./App/Router/authRoute.js")
app.use("/api",AuthRouter)

const UserRouter= require("./App/Router/UserRoute.js")
app.use("/api",UserRouter)




const port = 4006

app.listen(port, ()=>{
    console.log(`server running port http://localhost:${port}`);
})