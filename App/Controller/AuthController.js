const { hashPassword, comparePassword } = require("../Middleware/auth")
const sendEmailVerificationOTP = require("../Helper/emailVerification")
const EmailVerificationModel = require("../Model/OtpModel")
const UserModel = require("../Model/UserModel")
const jwt = require("jsonwebtoken")




class AuthController{
    async register(req, res) {
        try {
            const { name, email, password,role } = req.body
            if (!name || !email || !password) {
                return res.status(500).json({
                    message: 'All fields are required'
                });
            }

            if (role && role === "admin") {
                return res.status(403).json({ message: "Cannot register as admin." });
            }

            const existUser = await UserModel.findOne({ email });
            if (existUser) {
                return res.status(400).json({
                    message: 'User already exist'
                });
            }

            const hashedPassword = await hashPassword(password);

            // Check if image was uploaded
            const image = req.file ? req.file.filename : null;

            const user = await new UserModel({
                name,
                email,
                password: hashedPassword,
                image,
                role: role || "user"
            }).save();

            sendEmailVerificationOTP(req, user)

            res.status(201).json({
                message: 'User created successfully and otp send to your email',
                user: user
            });
        } catch (err) {
            console.log(err);

        }

    }

    //verifyotp
    async verifyOtp(req, res) {
        try {
            const { email, otp } = req.body;

            if (!email || !otp) {
                return res.status(400).json({ status: false, message: "All fields are required" });
            }
            const existingUser = await UserModel.findOne({ email });


            if (!existingUser) {
                return res.status(404).json({ status: "failed", message: "Email doesn't exists" });
            }


            if (existingUser.is_verified) {
                return res.status(400).json({ status: false, message: "Email is already verified" });
            }
            // Check if there is a matching email verification OTP
            const emailVerification = await EmailVerificationModel.findOne({ userId: existingUser._id, otp });
            if (!emailVerification) {
                if (!existingUser.is_verified) {

                    await sendEmailVerificationOTP(req, existingUser);
                    return res.status(400).json({ status: false, message: "Invalid OTP, new OTP sent to your email" });
                }
                return res.status(400).json({ status: false, message: "Invalid OTP" });
            }

            const currentTime = new Date();

            const expirationTime = new Date(emailVerification.createdAt.getTime() + 15 * 60 * 1000);
            if (currentTime > expirationTime) {

                await sendEmailVerificationOTP(req, existingUser);
                return res.status(400).json({ status: "failed", message: "OTP expired, new OTP sent to your email" });
            }

            existingUser.is_verified = true;
            await existingUser.save();


            await EmailVerificationModel.deleteMany({ userId: existingUser._id });
            return res.status(200).json({ status: true, message: "Email verified successfully" });


        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: "Unable to verify email, please try again later" });
        }
    }


      async resetPasswordLink(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ status: false, message: "Email field is required" });
            }
            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.status(404).json({ status: false, message: "Email doesn't exist" });
            }

            const secret = user._id + process.env.JWT_ACCESS_TOKEN_SECRET_KEY;
            const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '20m' });


            const resetLink = `${process.env.FRONTEND_HOST}/account/reset-password-confirm/${user._id}/${token}`;
            //console.log(resetLink);


            await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: user.email,
                subject: "Password Reset Link",
                html: `<p>Hello ${user.name},</p><p>Please <a href="${resetLink}">Click here</a> to reset your password.</p>`
            });

            res.status(200).json({ status: true, message: "Password reset email sent. Please check your email.", resetLink });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: false, message: "Unable to send password reset email. Please try again later." });

        }
    }


    async confirmPassword(req, res) {
        try {
            const { password, confirm_password } = req.body;
            const { id, token } = req.params;
            const user = await UserModel.findById(id);
            if (!user) {
                return res.status(404).json({ status: false, message: "User not found" });
            }

            const new_secret = user._id + process.env.JWT_ACCESS_TOKEN_SECRET_KEY;
            jwt.verify(token, new_secret);

            if (!password || !confirm_password) {
                return res.status(400).json({ status: false, message: "New Password and Confirm New Password are required" });
            }

            if (password !== confirm_password) {
                return res.status(400).json({ status: false, message: "New Password and Confirm New Password don't match" });
            }

            const salt = await bcrypt.genSalt(10);
            const newHashPassword = await bcrypt.hash(password, salt);


            await UserModel.findByIdAndUpdate(user._id, { $set: { password: newHashPassword } });


            res.status(200).json({ status: "success", message: "Password reset successfully" });

        } catch (error) {
            return res.status(500).json({ status: "failed", message: "Unable to reset password. Please try again later." });
        }
    }


    //login
    async login(req, res) {
        try {
            const { email, password } = req.body;
         
            if (!email || !password) {
                return res.status(400).json({
                    message: 'All fields are required'
                });
            }
            const user = await UserModel.findOne({ email });
            //console.log('user',user);   

            if (!user) {
                return res.status(400).json({
                    message: 'User not found'
                });
            }

            if (!user.is_verified) {
                return res.status(401).json({ status: false, message: "Your account is not verified" });
            }
            const isMatch = await comparePassword(password, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    message: 'Invalid credentials'
                });
            }
            const token = jwt.sign({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }, process.env.JWT_ACCESS_TOKEN_SECRET_KEY, { expiresIn: "2h" })

            res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                }
            });

        } catch (err) {
            log(err);
        }
    }


     
}

module.exports = new AuthController()