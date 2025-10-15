import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";
import Menu from "../../shared/components/Sidebar/Menu";
import { Row } from "antd";
import { Link } from 'react-router-dom';
import { message } from "antd";
import { getLikedMovies, getReviewedMovies } from "../../shared/utils/userData";

const MyPage = () => {
  const [nickname, setNickname] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [liked, setLiked] = useState<any[]>([]);
  const [reviewed, setReviewed] = useState<any[]>([]);
  const [editing, setEditing] = useState<boolean>(false);
  const [newNick, setNewNick] = useState<string>("");
  const [newPw, setNewPw] = useState<string>("");
  const [currentPw, setCurrentPw] = useState<string>("");
  useEffect(() => {
    const token = localStorage.getItem("token"); // 로컬 스토리지에서 토큰 가져오기
    if (token) {
      axios
        .get("http://localhost:5001/users/protected", {
          headers: {
            Authorization: `Bearer ${token}`, // Authorization 헤더에 토큰 포함
          },
        })
        .then((response) => {
          setNickname(response.data.nick); // 서버로부터 받은 닉네임 설정
          setUserId(response.data.id);
          setLiked(getLikedMovies(response.data.id));
          setReviewed(getReviewedMovies(response.data.id));
        })
        .catch((error) => {
          console.error("유저 정보를 가져오는 데 실패했습니다:", error);
        });
    }
  }, []);
  return (
    <div className='myPageContainer'>
      <Menu />
      <div className='myPageContent'>
        <div className='myPageNick'>
          <div>닉네임 : {nickname}</div>
          <div>
            <button onClick={() => { setEditing(v => !v); setNewNick(nickname); }}>회원정보 수정</button>
          </div>
        </div>
        {editing && (
          <div style={{ marginTop: 12, background: "#111", padding: 12, borderRadius: 8 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap:'wrap' }}>
              <input value={newNick} placeholder='새 닉네임' onChange={(e)=>setNewNick(e.target.value)} />
              <input value={newPw} placeholder='새 비밀번호(선택)' type='password' onChange={(e)=>setNewPw(e.target.value)} />
              <input value={currentPw} placeholder='현재 비밀번호' type='password' onChange={(e)=>setCurrentPw(e.target.value)} />
              <button onClick={async()=>{
                try {
                  const token = localStorage.getItem('token');
                  const res = await axios.put('http://localhost:5001/users/update', { nick: newNick, pw: newPw, currentPw }, { headers: { Authorization: `Bearer ${token}` } });
                  setNickname(res.data.nick);
                  message.success('수정되었습니다.');
                  setEditing(false);
                  setNewPw('');
                  setCurrentPw('');
                } catch(err){
                  console.error(err);
                  message.error('수정 중 오류가 발생했습니다.');
                }
              }}>저장</button>
            </div>
            <div>
              <button onClick={()=>{ localStorage.removeItem('token'); window.location.href = '/'; }}>로그아웃</button>
            </div>
          </div>
        )}
        <hr />
        <div style={{ color:'#ddd', marginTop: 8 }}>
          나의 좋아요/리뷰 목록은 <Link to='/mylist' style={{ color:'#3498db', fontWeight:700 }}>Mylist 페이지</Link>에서 확인할 수 있어요.
        </div>
      </div>
    </div>
  );
};

export default MyPage;
