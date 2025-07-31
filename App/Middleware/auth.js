const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")



const hashPassword = (password) => {
    try {
        const salt = 10
        const hashedPassword = bcrypt.hashSync(password, salt)
        return hashedPassword

    } catch (err) {
        console.log(err)
    }
}

const comparePassword =(password, hashedPassword)=>{
    return bcrypt.compare(password,hashedPassword)
}


const Auth = async (req, res, next) => {
    const token = req.body?.token || req.query?.token || req.headers["x-access-token"]
    if (!token) return res.status(401).json({ message: "token is required" })

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY)
        req.user = decoded
        next()
    } catch (err) {
        res.status(401).json({ message: "Invalid token" })
    }
}

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access only' });
  next();
};


const isAuthor = (req, res, next) => {
    // console.log("User from token:", req.user);
  if (req.user.role !== 'author') return res.status(403).json({ message: 'Author access only' });
  next();
};


const isUser = (req, res, next) => {
  if (req.user.role !== 'user') return res.status(403).json({ message: 'user access only' });
  next();
};


module.exports = { Auth,hashPassword,comparePassword, isAdmin,isAuthor,isUser}