import React, { useState } from "react";
import axios from "axios";
import './Login.css';
import Logo from 'assets/images/Logo2.png';

const Login: React.FC = () => {
  const [id, setID] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://localhost:5001/users/login", {
        id,
        pw,
      });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/main";
    } catch (err: any) {
      setError("로그인에 실패했습니다.");
    }
  };

  return (
    <div className="authContainer">
      <div className="authPanel">
        <img src={Logo} alt="logo" className="authLogo" />
        <h2 className="authTitle">Sign in</h2>
        <form onSubmit={onSubmit} className="authForm">
          <input className="authInput" placeholder="ID" value={id} onChange={(e)=>setID(e.target.value)} />
          <input className="authInput" placeholder="Password" type="password" value={pw} onChange={(e)=>setPw(e.target.value)} />
          {error && <div className="authError">{error}</div>}
          <button type="submit" className="authButton">Log in</button>
        </form>
        <a href="/account" className="authLink">Create an account</a>
      </div>
    </div>
  );
};

export default Login;
