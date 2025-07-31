const { hashPassword, comparePassword } = require("../Middleware/auth")
const UserModel = require("../Model/UserModel")

const fs = require('fs')
const path = require('path')






class UserController {

async updatePassword(req, res) {
        try {
            const user_id = req.body.user_id;
            const { password } = req.body;
            if (!password) {
                return res.status(400).json({
                    message: 'Password is required'
                });
            }
            const userdata = await UserModel.findOne({ _id: user_id });
            if (userdata) {
                const newPassword = await hashPassword(password);
                const updateuser = await UserModel.findOneAndUpdate({ _id: user_id },
                    {
                        $set: {
                            password: newPassword
                        }
                    });
                res.status(200).json({
                    message: 'Password updated successfully',

                });
            } else {
                res.status(400).json({
                    message: 'password not updated'
                });
            }

        } catch (err) {
            console.log(err);
        }
    }

    async userProfile(req, res) {
        try {
            const user = await UserModel.findById(req.user._id).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({ message: 'User profile', user });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error fetching profile' });
        }
    }

    async updateProfile(req, res) {
        try {
            const id = req.params.id;

            const existingUser = await UserModel.findById(id);
            if (!existingUser) {
                return res.status(404).json({ message: "User not found" });
            }

            const { name, email, password } = req.body;

            const updatedData = { name, email };

            if (password) {
                const hashedPassword = await hashPassword(password);
                updatedData.password = hashedPassword;
            }

            // If new image is uploaded
            if (req.file) {
                updatedData.image = req.file.filename;

                // Delete previous image
                if (existingUser.image) {
                    const oldImagePath = path.join(__dirname, '..', '..', 'uploads', existingUser.image);
                    fs.unlink(oldImagePath, (err) => {
                        if (err) {
                            console.error(`Failed to delete previous image ${existingUser.image}:`, err);
                        } else {
                            console.log(`Previous image ${existingUser.image} deleted successfully`);
                        }
                    });
                }
            }

            const updatedUser = await UserModel.findByIdAndUpdate(id, updatedData, { new: true });

            res.status(200).json({
                message: "Profile updated successfully",
                data: updatedUser
            });

        } catch (error) {
            console.error("Update profile error:", error.message);
            res.status(500).json({
                message: "Internal server error"
            });
        }
    }

}

module.exports = new UserController()