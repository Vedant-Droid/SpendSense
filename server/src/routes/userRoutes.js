import express from 'express'
import Expense from '../model/expense.model.js';
import mongoose from 'mongoose';
import User from '../model/user.model.js';
import {GoogleGenerativeAI} from '@google/generative-ai';
import bcrypt, { compareSync } from "bcrypt"

const router = express.Router()

router.post('/logout',(req, res)=>{
    // console.log("/logout route hit")
    res.clearCookie("TokenViaCookie", {
    httpOnly: true,
  });
  console.log("logged out and cookie has been deleted")
  res.status(200).json({ message: "Logged out successfully" });
});

router.get('/verify', async(req, res) => {
  res.status(200).json({ message: 'Token valid', user: req.user });
});

router.post('/addExpense',async(req,res)=>{

  try {
    const {title,amount,category}=req.body
    const userId=req.user.id
    const newExpense=new Expense({userId,title,amount,category})
    await newExpense.save()
    // console.log("Expense added to userId: ",userId)
    res.status(201).json({success:true,message:"Expense added successfully"})
  } catch (error) {
    console.error("error adding expense: ",error.message)
    res.status(500).json({success:false,message:"Server Error "})
  }

})

router.get('/logs',async(req,res)=>{
  try {
      const userId=req.user.id
      const logs=await Expense.find({userId}).sort({ createdAt: -1 })
      res.status(200).json(logs)
      // console.log("logs has been sent",logs)
  } catch (error) {
    console.log("error while loading logs: ",error)
    res.status(500).json({message:"failed to fetch logs"})
  }
})

router.delete('/deleteExpense/:id',async(req,res)=>{

  try{
    const {id}=req.params
    await Expense.findByIdAndDelete(id)
    res.status(200).json({message:"Expense deleted successfully"})
  
  }catch(error){
    res.status(500).json({message:"Failsed to deleted expense"})
  }
})

router.put("/editExpense/:id",async(req,res)=>{
  try {
    const userId = req.user.id;
    const expenseId= req.params.id;
    const { title, amount, category } = req.body;
  
  
    const expense=await Expense.findOne({_id:expenseId,userId})
    if(!expense){
      return res.status(404).json({message:"Expense not found"})
    }
  
    if(title) expense.title=title
    if(amount) expense.amount=amount
    if(category) expense.category=category

    await expense.save()

    res.status(200).json({message:"Expense Updated Successfully"})
    
  } catch (error) {
    console.error("Error Updating the Expense: ",error)
    res.status(500).json({message:"Server Error"})
  }

})

router.get('/avgDailySpent', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Expense.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) } // Removed paidOrSpent filter
      },
      {
        $group: {
          _id: "$date", // Grouping by each date
          dailySpent: { $sum: "$amount" } // Sum of amount per day
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$dailySpent" }, // Sum of all daily totals
          daysCount: { $sum: 1 } // Number of days with spending
        }
      },
      {
        $project: {
          _id: 0,
          avgPerDay: { $divide: ["$totalSpent", "$daysCount"] } // Calculate average
        }
      }
    ]);

    const avg = result[0]?.avgPerDay || 0;
    // console.log("Average spent per day is:", avg);
    res.status(200).json({ avgSpentPerDay: avg });

  } catch (err) {
    console.error("Error calculating average spent per day:", err);
    res.status(500).json({ error: "Failed to calculate average spent per day" });
  }
});

router.get('/userInfo', async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('email'); // email used as name

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // console.log("username is :",user.email)
    res.status(200).json({ name: user.email }); // return email as name
  } catch (error) {
    console.error("Error fetching user info:", error.message);
    res.status(500).json({ message: "Failed to fetch user info" });
  }
});

router.get('/totalSpent', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$amount" }
        }
      }
    ]);

    const total = result[0]?.totalSpent || 0;
    // console.log("total spent is:",total)
    res.status(200).json({ totalSpent: total });

  } catch (err) {
    console.error("Error calculating total spent:", err);
    res.status(500).json({ error: "Failed to calculate total spent" });
  }
});

router.get('/categorySummary',async (req, res) => {
  try {
    const userId = req.user.id;
    const summary = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          total: 1
        }
      }
    ]);
    // console.log("summary:",summary)
    res.status(200).json({ summary });
  } catch (error) {
    console.error("Error fetching category summary:", error);
    res.status(500).json({ error: "Failed to fetch category summary" });
  }
});

router.get('/recentLogs', async (req, res) => {
  try {
    const userId = req.user.id;
    const expenses = await Expense.find({ userId }).sort({ createdAt: -1 }).limit(5);
    res.json(expenses);
  } catch (error) {
    console.error("Failed to fetch recent logs:", error);
    res.status(500).json({ error: 'Server Error' });
  }
});

router.post("/insights", async (req, res) => {
  const userId = req.user.id;
  const genAI = new GoogleGenerativeAI(process.env.geminiAPIKey);

  try {
    const expenses = await Expense.find({ userId }).sort({ createdAt: -1 }).limit(10);

    if (!expenses.length) {
      return res.status(404).json({ message: "No expenses found" });
    }

    const formattedExpenses = expenses
      .map((e, i) => `${i + 1}. Title: ${e.title}, ₹${e.amount}, Category: ${e.category}, Date: ${new Date(e.createdAt).toLocaleDateString()}`)
      .join("\n");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log(formattedExpenses)
    const prompt = `
    You are an expert financial advisor. Analyze the following expense logs and give smart financial insights.
    Also analyze the date of spent and then analyze the trend and frequency of repetaive spents for that particular category.
    the date is in format of dd/mm/yyy
    ${formattedExpenses}
    dont cross the limit of 40 words.
    Make it interesting to read.
    Suggest how can i reduce my spendings.
    Give 3 personalized and useful insights in bullet points.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    res.json({ insight: text });
  } catch (error) {
    console.error("Error generating insights:", error);
    res.status(500).json({ message: "AI Error" });
  }
});

router.get("/dailySummary",async(req,res)=>{
  try {
    const userId=req.user.id
    const summary=await Expense.aggregate([
      {
        $match:{userId: new mongoose.Types.ObjectId(userId)}
      },
      {  
        $group:{
          // _id is the DATE of the total amount on that particular date
          _id:{
            $dateToString:{format:"%Y-%m-%d",date:"$createdAt"}
          },
          totalAmount:{$sum:"$amount"}
        }
      },
      {
        $sort:{_id:1}
      }
    ])
    
    //formatted={ date:"2025-07-18",amount:310}
    const formatted=summary.map(entry=>({
      date:entry._id,  //"2025-07-18"
      amount:entry.totalAmount
    }))
    // console.log("trend chart data sent")
    res.status(200).json(formatted)
  
  } catch (error) {
    console.error("Error getting daily summary: ",error)
    res.status(500).json({message:"Internal Server Error"})
  }
})

router.get("/userInfoProfile",async(req,res)=>{
  try {
    const userId=req.user.id
    const user=await User.findById(userId)
    if(!user){
      return res.status(404).json({message:"User not found"})
    }
    // console.log("user profile data sent")
    res.status(200).json(user)
  } catch (error) {
    console.error("Error fetching user profile: ",error)
    res.status(500).json({message:"Internal Server Error"})
  }
})

router.put("/updatePassword",async(req,res)=>{

  const userId=req.user.id
  const {oldPassword,newPassword}=req.body

  if(!oldPassword||!newPassword){
    res.status(400).json({message:"Old and New password are requried"})
  }

  const user=await User.findById(userId)

  if(!user){
    res.status(400).json({message:"User not found"})
  }

  
  if(bcrypt.compare(newPassword,user.password)){
    res.status(400).json({message:"New password should be different from old password"})
  }

  const isMatch= await bcrypt.compare(oldPassword,user.password)
  if(!isMatch){
    res.status(400).json({message:"Incorrect Old Password"})
  }

  // const hashedPassword=await bcrypt.hash(newPassword,10)

  user.password=newPassword
  await user.save()
  console.log("Password has been changed")

router.put("/updateUserName",async(req,res)=>{
  
  const userId=req.user.id
  const {newUserName}=req.body

  if(!newUserName){
    res.status(400).json("Please enter a username")
  }

  const user=await User.findById(userId)

  if(!user){
    res.status(400).json("User not found")
  }

  user.email=newUserName
  await mongoose.save()


})




})

router.put("/updateUsername",async(req,res)=>{
  const {newUsername}=req.body
  const userId=req.user.id

  try {
    const user=await User.findById(userId)
    if(!user){
      return res.status(404).json({message:"User not found"})
    }
  
    user.email=newUsername
    await user.save()
    console.log("Username updated successfully")
    res.status(200).json({message:"Username updated successfully"})
  
  } catch (error) {
    console.error("Error updating username: ",error)
    res.status(500).json({message:"Internal Server Error"})
  }


})
export default router