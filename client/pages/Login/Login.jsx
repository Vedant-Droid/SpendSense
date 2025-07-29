import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import './Login.css';

function Login({setIsLoggedIn}){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [hasAccount,setHasAccount]=useState(true)
  
  const Navigate=useNavigate()

  const handleSubmit = async(e) => {
    e.preventDefault();
    const submittedEmail=email;
    const submittedPassword=password;

    console.log('Submitted Email:', submittedEmail);
    console.log('Submitted Password:', submittedPassword);

    await Authenticate(submittedEmail,submittedPassword)
  
  };
  const Authenticate=async(submittedEmail,submittedPassword)=>{
    try {
      let endpoint=hasAccount?"/auth/login":"/auth/register"
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: submittedEmail,
          password: submittedPassword,
        }),
        credentials: "include",
      });

      const data=await response.json()
      if (response.ok) {
        console.log(hasAccount ? "Logged in via cookie" : "Registered via cookie");
        setIsLoggedIn(true);
        Navigate("/dashboard")
      } else {
        throw new Error("Authentication failed");
      }

      
    }catch (error){
      console.error("Something went wrong while Authentication",error) 
    }
  }

  return(
    <div id="login-regis-page">
      <div id="login-regis-section">
        
        <h1 id="login-regis-text">{hasAccount?"Log-In!":"Register!"}</h1>
        
        <input 
          id="email-input"
          type="email"
          placeholder="Username"
          onChange={(e)=>setEmail(e.target.value)}/>
        <input 
          id="password-input"
          type="password"
          placeholder="Password"
          onChange={(e)=>setPassword(e.target.value)}/>
        
        <button id="submit-btn"onClick={handleSubmit}>{hasAccount?"Login":"Create New Account"}</button>
        <button id="toggle-btn"onClick={()=>setHasAccount(!hasAccount)}>{hasAccount?"I don't have an Account":"I have an Account"}</button>
      
      </div>
    </div>

  )
}
export default Login;

  


  
