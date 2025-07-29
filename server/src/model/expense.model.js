import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
    trim: true,
    
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    default: "General",
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
