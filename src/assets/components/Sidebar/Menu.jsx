import React, { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import "../Sidebar/Menu.css";
import Logo from "../../images/Logo2.png";

const Menu = () => {
  const [isLoggendIn, setIsLoggendIN] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggendIN(false);
  };

  return (
    <div className='sidebarContainer'>
      <div className='title1'>
        <Link to='/main'>
          <img src={Logo} style={{ width: 200, paddingTop: 20 }} alt='' />
        </Link>
        <Link style={{ textDecoration: "none" }} to='/movies'>
          <span>Movies</span>
        </Link>
        <span>Community</span> <span>Mylist</span>{" "}
      </div>
      <div className='title2'>
        <Link style={{ textDecoration: "none", color: "white" }} to='/search'>
          <span style={{ paddingRight: 15 }}>검색창</span>
        </Link>
        <Link style={{ textDecoration: "none", color: "white" }} to='/'>
          <span style={{ paddingRight: 15 }} onClick={handleLogout}>
            Logout
          </span>
        </Link>
        <Link style={{ textDecoration: "none", color: "white" }} to='/mypage'>
          <span style={{ paddingRight: 15 }}>Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default Menu;
