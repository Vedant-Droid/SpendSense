import mongoose from "mongoose";
import bcrypt from "bcrypt";


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        // minlength: 6
    }
     
},{timestamps:true});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password=await bcrypt.hash(this.password,10);
    next();
  }catch(error){
    return next(error);
  }
});

userSchema.methods.validatePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User=mongoose.model("User",userSchema);
export default User
//exported as User or users i dunno