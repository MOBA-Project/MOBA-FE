import React, { useState } from "react";
import axios from "axios";
import './Login.css';
import Logo from 'assets/images/Logo2.png';

const CreateAccount: React.FC = () => {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [nick, setNick] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      await axios.post("http://localhost:5001/users/signup", { id, pw, nick });
      setMessage("회원가입이 완료되었습니다. 로그인 해주세요.");
    } catch (err: any) {
      setMessage("회원가입에 실패했습니다.");
    }
  };

  return (
    <div className="authContainer">
      <div className="authPanel">
        <img src={Logo} alt="logo" className="authLogo" />
        <h2 className="authTitle">Create Account</h2>
        <form onSubmit={onSubmit} className="authForm">
          <input className="authInput" placeholder="Nickname" value={nick} onChange={(e)=>setNick(e.target.value)} />
          <input className="authInput" placeholder="ID" value={id} onChange={(e)=>setId(e.target.value)} />
          <input className="authInput" placeholder="Password" type="password" value={pw} onChange={(e)=>setPw(e.target.value)} />
          {message && <div className="authInfo">{message}</div>}
          <button type="submit" className="authButton">Sign up</button>
        </form>
        <a href="/" className="authLink">Back to login</a>
      </div>
    </div>
  );
};

export default CreateAccount;
