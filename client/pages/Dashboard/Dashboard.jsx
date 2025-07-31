import React, { useEffect } from "react";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import ReactMarkdown from 'react-markdown';
import Navbar from "../../components/Navbar/Navbar";
import "./Dashboard.css";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#f71f31ff",
  "#FFBB28",
  "#FF8042",
  "#a76cf2",
  "#fc5c65",
  "#e61c70ff",
];

export default function Dashboard() {

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [avgSpentPerDay, setAvgSpentPerDay] = useState(0);
  const [userName, setUserName] = useState("");
  const [totalSpent, setTotalSpent] = useState(0);
  const [data, setData] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [insight, setInsight] = useState("Alright AI, JUDGE ME.");

  const formatDateTime = (isoString) => {
    const dateObj = new Date(isoString);
    const date = dateObj.toLocaleDateString("en-GB"); // DD/MM/YYYY
    const time = dateObj.toLocaleTimeString("en-GB"); // HH:mm:ss
    return `${date}, ${time}`;
  };

  const handleAddExpense = async () => {
    const newExpense = { title, amount, category };

    try {
      const response = await fetch("/user/addExpense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newExpense),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Expense added successfully:", data);
        // Reset input fields
        setTitle("");
        setAmount("");
        setCategory("");

        // await fetchUserName();
        await fetchAverageSpent();
        await fetchTotalSpent();
        await fetchCategorySummary();
        await fetchExpenses();
      
      } else {
        console.error("Error adding expense:", data.message);
      }
    } catch (error) {
      console.error("Network error:", error.message);
    }
  };

  const fetchAverageSpent = async () => {
    try {
      const res = await fetch("/user/avgDailySpent", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setAvgSpentPerDay(data.avgSpentPerDay);
    } catch (err) {
      console.error("Failed to fetch average spent:", err);
    }
  };

  const fetchUserName = async () => {
    try {
      const res = await fetch("/user/userInfo", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setUserName(data.name);
    } catch (err) {
      console.error("Failed to fetch username:", err);
    }
  };

  const fetchTotalSpent = async () => {
    try {
      const res = await fetch("/user/totalSpent", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setTotalSpent(data.totalSpent);
    } catch (err) {
      console.error("Failed to fetch total spent:", err);
    }
  };

  const fetchCategorySummary = async () => {
    try {
      const res = await fetch("/user/categorySummary", {
        method: "GET",
        credentials: "include",
      });
      const result = await res.json();
      setData(result.summary);
    } catch (err) {
      console.error("Failed to fetch category summary:", err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch("/user/recentLogs");
      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      console.error("Error fetching recent expenses:", err);
    }
  };

  const fetchInsight = async () => {
    setInsight("Loading Hehehe....")
    try {
      const res = await fetch('/user/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await res.json();
      setInsight(data.insight || "API Error");
    } catch (error) {
      setInsight("Error loading insights");
      console.error("Error fetching insights:", error);
    }
  };


  useEffect(() => {
    fetchAverageSpent();
    fetchUserName();
    fetchTotalSpent();
    fetchCategorySummary();
    fetchExpenses();
  }, []);

  return (
    <div className="Page">
      <div className="PageSection">
        <div className="navbar">
          <Navbar />
        </div> 
        <div className="PageContentParent">
          <div className="PageContentDashboard">
            <div className="HiUsernameAddExpenseAIInsightChart">
              <div className="HiUsernameAddExpenseAIInsight">

                
                <div className="HiUsernameAddExpense">
                  <div className="HiUsernameAvgSpent">
                    <div className="HiUsername">Hey {userName}!,</div>
                    <div className="AvgSpent">
                      {/* Avg Daily Spend : ₹{avgSpentPerDay} Broken Probably */}
                      Welcome Back UwU
                    </div>
                  </div>
                  <div className="AddExpense">
                    <h3 style={{ marginBottom: "0.5rem" }}>Add Expense</h3>

                    <div className="AddExpenseContent">
                      <div className="LeftInputs">
                        <div className="input-group">
                          <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                          />
                        </div>

                        <div className="input-group">
                          <input
                            type="number"
                            placeholder="Amount (₹)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="RightInputs">
                        <div className="input-group category-select">
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                          >
                            <option value="">Category</option>
                            <option value="Food">Food</option>
                            <option value="Transport">Transport</option>
                            <option value="Bills">Bills</option>
                            <option value="Rent">Rent</option>
                            <option value="Subscription">Subscription</option>
                            <option value="Groceries">Groceries</option>
                            <option value="Purchase">Purchase</option>
                            <option value="Miscellenious">Miscellenious</option>
                          </select>
                        </div>

                        <button onClick={handleAddExpense}>+</button>
                      </div>
                    </div>
                  </div>
                  
                </div>
                <div className="AIInsight">
                  <div className="AITitle">
                    <div>
                      AI Insights
                    </div>
                    <div>
                      <button onClick={()=>fetchInsight()}>Hit Me!</button>
                    </div>
                  </div>
                  <div className="AIData">
                    <ReactMarkdown>{insight}</ReactMarkdown>
                  </div>
                </div>
              </div>
              <div className="Chart">
                <h2 className="chart-title">Category Analytics</h2>

                <div className="chart-content">
                  <div className="chart-legend">
                    <ul>
                      {data.map((entry, index) => (
                        <li
                          key={index}
                          style={{
                            color: COLORS[index % COLORS.length],
                            marginBottom: "8px",
                          }}
                        >
                          {entry.category}: ₹{entry.total}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="chart-pie">
                    <ResponsiveContainer width={250} height={250}>
                      <PieChart>
                        <Pie
                          data={data}
                          dataKey="total"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          innerRadius={40}
                          label
                        >
                          {data.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1a2238",
                            borderRadius: "8px",
                            border: "1px solid #01102cff",
                          }}
                          itemStyle={{
                            color: "#f3f3f3ff",
                            fontWeight: "bold",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
            <div className="RecentExpenseLogsBarGraphs">
              <div className="RecentExpenseLogs">
                <h2>Recent Expenses</h2>
                {expenses.length !== 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Date / Time</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((log) => (
                        <tr key={log._id}>
                          <td>{log.title}</td>
                          <td>{log.category}</td>
                          <td>{formatDateTime(log.createdAt)}</td>
                          <td>₹{log.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <h2>Start Adding Expenses!!</h2>
                )}
              </div>

              <div className="BarGraph">
                <h2>Financial Insights</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a2238",
                        borderRadius: "8px",
                        border: "1px solid #01102cff",
                      }}
                      itemStyle={{
                        color: "#f3f3f3ff",
                        fontWeight: "bold",
                      }}
                    />

                    <Bar dataKey="total">
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
