const express = require('express');
const router = express.Router();
const UserModel = require("../Model/UserModel")
const bcrypt = require('bcryptjs');

router.get('/create-admin', async (req, res) => {
    try {
        const hashedPassword = bcrypt.hashSync('admin123', 10);

        const existingAdmin = await UserModel.findOne({ email: "admin@example.com" });
        if (existingAdmin) return res.send("Admin already exists.");

        const admin = new UserModel({
            name: "Admin",
            email: "admin@example.com",
            phone: "9874563217",
            password: hashedPassword,
            is_verified: true,
            is_admin: true,
            role: "admin"
        });

        await admin.save();
        res.send("Admin created successfully.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating admin.");
    }
});

module.exports = router;
