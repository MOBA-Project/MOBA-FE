import React, { useState } from "react";
import axios from "axios";

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
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, width: 320 }}>
        <h2>Login</h2>
        <input
          placeholder="ID"
          value={id}
          onChange={(e) => setID(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        {error && <div style={{ color: "tomato" }}>{error}</div>}
        <button type="submit">Sign in</button>
        <a href="/account">Create an account</a>
      </form>
    </div>
  );
};

export default Login;
