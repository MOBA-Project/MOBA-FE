import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Menu.css";
import Logo from "../../../assets/images/Logo2.png";

const Menu = () => {
  const navigate = useNavigate();
  const [nick, setNick] = useState<string>("");
  const [authed, setAuthed] = useState<boolean>(false);
  useEffect(() => {
    (async () => {
      try {
        const { getCurrentUser } = await import('shared/utils/userData');
        const u = await getCurrentUser();
        if (u?.nick) setNick(u.nick);
        setAuthed(!!u);
      } catch {
        setAuthed(false);
      }
    })();
  }, []);
  const initials = nick ? nick.charAt(0).toUpperCase() : "U";

  const [scrolled, setScrolled] = useState<boolean>(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`sidebarContainer`}>
      <div className="title1">
        <Link to="/main">
          <img src={Logo} style={{ width: 200, paddingTop: 20 }} alt="" />
        </Link>
        <Link style={{ textDecoration: "none" }} to="/movies">
          <span>Movies</span>
        </Link>
        <Link style={{ textDecoration: "none" }} to="/community">
          <span>Community</span>
        </Link>
        <Link style={{ textDecoration: "none" }} to="/mylist">
          <span>Mylist</span>
        </Link>
      </div>
      <div className="title2">
        {authed ? (
          <button
            className="avatarCircle"
            onClick={() => navigate("/mypage")}
            title="프로필"
          >
            {initials}
          </button>
        ) : (
          <button
            onClick={() => navigate("/")}
            title="로그인"
            style={{
              background: "#4a5fc1",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            로그인
          </button>
        )}
      </div>
    </div>
  );
};

export default Menu;
