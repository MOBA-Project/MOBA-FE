import React, { useState } from "react";
import axios from "axios";

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
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, width: 360 }}>
        <h2>Create Account</h2>
        <input placeholder="Nickname" value={nick} onChange={(e)=>setNick(e.target.value)} />
        <input placeholder="ID" value={id} onChange={(e)=>setId(e.target.value)} />
        <input placeholder="Password" type="password" value={pw} onChange={(e)=>setPw(e.target.value)} />
        {message && <div>{message}</div>}
        <button type="submit">Sign up</button>
        <a href="/">Back to login</a>
      </form>
    </div>
  );
};

export default CreateAccount;

