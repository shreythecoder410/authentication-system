const { comparePassword } = require("../Middleware/auth")
const transporter = require("../Config/emailConfig")
const UserModel = require("../Model/UserModel")
const statuscode = require("../Helper/httpStatusCode")
const jwt = require('jsonwebtoken')
const { Error } = require('mongoose')



class AdminController {
    async adminLogin(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(statuscode.internalServerError).json({
                    message: 'All fields are required'
                });
            }
            const admin = await UserModel.findOne({ email });

            if (!admin) {
                return res.status(400).json({
                    message: 'Admin not found'
                });
            }

            const isMatch = await comparePassword(password, admin.password);
            if (!isMatch) {
                return res.status(statuscode.badRequest).json({
                    message: 'Invalid credentials'
                });
            }
            const token = jwt.sign({
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }, process.env.JWT_ACCESS_TOKEN_SECRET_KEY, { expiresIn: "2h" })

            return res.status(statuscode.success).json({
                message: 'Login successful',
                token,
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role
                }
            });

        } catch (err) {
            console.log(Error);

        }

    }

}

module.exports = new AdminController()