import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Menu.css";
import Logo from "../../../assets/images/Logo2.png";

const Menu = () => {
  const navigate = useNavigate();
  const [nick, setNick] = useState<string>("");
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://localhost:5001/users/protected', { headers: { Authorization: `Bearer ${token}` }})
      .then(r=> r.ok ? r.json() : null)
      .then(data => { if (data?.nick) setNick(data.nick); })
      .catch(()=>{});
  }, []);
  const initials = nick ? nick.charAt(0).toUpperCase() : 'U';

  const [scrolled, setScrolled] = useState<boolean>(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`sidebarContainer`}>
      <div className='title1'>
        <Link to='/main'>
          <img src={Logo} style={{ width: 200, paddingTop: 20 }} alt='' />
        </Link>
        <Link style={{ textDecoration: "none" }} to='/movies'>
          <span>Movies</span>
        </Link>
        <span>Community</span>
        <Link style={{ textDecoration: "none" }} to='/search'>
          <span>Search</span>
        </Link>
        <Link style={{ textDecoration: "none" }} to='/mylist'>
          <span>Mylist</span>
        </Link>
      </div>
      <div className='title2'>
        <button className='avatarCircle' onClick={()=>navigate('/mypage')} title='프로필'>
          {initials}
        </button>
      </div>
    </div>
  );
};

export default Menu;
