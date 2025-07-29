import express from 'express'
import User from '../model/user.model.js'
import jwt from 'jsonwebtoken'
const router = express.Router()

router.post("/register", async (req, res) => {
    let { email, password } = req.body;

    if ([email, password].some((field) => field?.trim() === "")) {
        console.log("all field are req")
        return res.status(400).json({ message: "All fields are required" });
    }

    email = email.trim().toLowerCase();

    try {
        const user = await User.findOne({ email });
        if (user) {
            console.log("email already exists");
            return res.status(400).json({ message: "Email already exists" });
        }

        const newUser = new User({ email, password });
        await newUser.save();
        console.log("user saved");

        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        const options = {
            httpOnly: true,
            secure: true
        }
        console.log("cookie sent")
        return res
        .status(200)
        .cookie("TokenViaCookie",token, options)
        .json({message:"token sent via cookie"})
        

    } catch (error) {
        console.error("Registration error:", error.message);
        return res.status(500).json({ message: "Something went wrong at Server Side" });
    }
});

router.post("/login",async(req,res)=>{
    const {email,password}=req.body
    if([email,password].some((field)=>field?.trim()==="")){
        console.log("all field are req")
        return res.status(404).json({message:"All fields are required"});
    }

    try {
        const user=await User.findOne({email})
        if(!user){
            console.log("user does not exist")
            return res.status(400).json({message:"User Doesn't exist :("});
        }
        const passwordIsValid=await user.validatePassword(password)
        if(!passwordIsValid){
            console.log("user exist but wrong password")
            return res.status(401).json({message:"Invalid Password Awww :("})
        }

        const message="u made it this far noice"

        const token = jwt.sign(
                { id: user._id, email: user.email,message:message },
                process.env.JWT_SECRET,
                {expiresIn:'24h'}
            );
        const options = {
            httpOnly: true,
            secure: true
        }
        // console.log("user logged in successfully via login")
        // console.log("cookie sent during login")
        return res
        .status(200)
        .cookie("TokenViaCookie",token, options)
        .json({message:"token sent via cookie"})
        

    } catch (error) {
        console.error("Login Error: ",error.message)
        return res.status(503).json({message:"Server Error"})
    }
})

export default router