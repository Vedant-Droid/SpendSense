import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Navbar from '../../components/Navbar/Navbar';
import './Logs.css';

export default function Logs() {
  const [expenses, setExpenses] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [trendChartData, setTrendChartData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [updatedTitle, setUpdatedTitle] = useState("");
  const [updatedAmount, setUpdatedAmount] = useState("");
  const [updatedCategory, setUpdatedCategory] = useState("");

  const handleEdit = (exp) => {
    setShowModal(true);
    setEditId(exp._id);
    setUpdatedTitle(exp.title);
    setUpdatedAmount(exp.amount);
    setUpdatedCategory(exp.category);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch("/user/logs", { method: "GET", credentials: "include" });
      const data = await response.json();
      if (response.ok) {
        setExpenses(data);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Couldn't fetch logs:", error);
    }
  };

  const handleDelete = async (id) => {
    if(showModal) return
    try {
      const response = await fetch(`/user/deleteExpense/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (response.ok) {
        setExpenses((prev) => prev.filter((exp) => exp._id !== id));
        fetchTotalSpent();
        fetchTrendChartData()
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    }

  };
  const handleUpdate = async () => {
    try {
      const response = await fetch(`/user/editExpense/${editId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: updatedTitle,
          amount: updatedAmount,
          category: updatedCategory
        })
      });

      if (response.ok) {
        fetchLogs();
        fetchTrendChartData()
        closeModal();
      } else {
        console.error("Failed to update expense");
      }
    } catch (error) {
      console.error("Error updating expense:", error);
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

  const fetchTrendChartData = async () => {
    try {
      const response = await fetch('/user/dailySummary', {
        method: "GET",
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setTrendChartData(data);
      }
    } catch (error) {
      console.error("Failed to load trend chart data:", error);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchTotalSpent();
    fetchTrendChartData();
  }, []);

  return (
    <div className='Page'>
      <div className='PageSection'>
        <div className='navbar'>
          <Navbar />
        </div>
        <div className='PageContentParent'>
          <div className='PageContentLogs'>

            
            <div className="logs-window">
              <div id="total-spent-this-month-box">
                <div id="totalAmount">
                  <h1>Total</h1>
                  <h2>Amount:</h2>
                </div>
                <div id="Amount">
                  <h2>₹{totalSpent}</h2>
                </div>
              </div>

              <div className="expense-list">
                {expenses.map((exp) => (
                  <div key={exp._id} className="expense-item">
                    <div id="titamtcatdatetime">
                      <div id="title-amount">
                        <div id="title">{exp.title}</div>
                        <div id="amt">₹{exp.amount}</div>
                      </div>
                      <div id="category-datetime">
                        <div id="cat">{exp.category}</div>
                        <div id="dattime">{new Date(exp.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div id="editdel">
                      <button id="btn" onClick={() => handleEdit(exp)}>Edit</button>
                      <button id="btn" onClick={() => handleDelete(exp._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            
            <div className='TrendChart'>
              <div className='Title'>Trend Chart</div>
              <div id='Chart'>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendChartData}>
                    <XAxis dataKey="date" />
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
                    <Line type="monotone" dataKey="amount" stroke="#60a5fa" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          
          {showModal && (
            <div className="EditExpense">
              <h3 style={{ marginBottom: "0.5rem" }}>Edit Expense</h3>
              <div className="AddExpenseContent">
                <div className="LeftInputs">
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Title"
                      value={updatedTitle}
                      onChange={(e) => setUpdatedTitle(e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="number"
                      placeholder="Amount (₹)"
                      value={updatedAmount}
                      onChange={(e) => setUpdatedAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="RightInputs">
                  <div className="input-group category-select">
                    <select
                      value={updatedCategory}
                      onChange={(e) => setUpdatedCategory(e.target.value)}
                    >
                      <option value="">Category</option>
                      <option value="Food">Food</option>
                      <option value="Transport">Transport</option>
                      <option value="Bills">Bills</option>
                      <option value="Rent">Rent</option>
                      <option value="Subscription">Subscription</option>
                      <option value="Groceries">Groceries</option>
                      <option value="Purchase">Purchase</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-buttons">
                <button className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button className="save-btn" onClick={() => handleUpdate(editId)}>Save</button>
              </div>

              
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
