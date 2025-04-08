import React, { useState, useEffect } from "react";
import axios from "axios";
import "../myPage/MyPage.css";
import Menu from "../../assets/components/Sidebar/Menu";

const MyPage = () => {
  const [nickname, setNickname] = useState("");
  useEffect(() => {
    const token = localStorage.getItem("token"); // 로컬 스토리지에서 토큰 가져오기
    if (token) {
      axios
        .get("http://localhost:5000/protected", {
          headers: {
            Authorization: `Bearer ${token}`, // Authorization 헤더에 토큰 포함
          },
        })
        .then((response) => {
          setNickname(response.data.nick); // 서버로부터 받은 닉네임 설정
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
            <button>회원정보 수정</button>
          </div>
        </div>
        <hr />
        <div className='myPageLikeMovies'>
          <span className='myPageSpan'>My Like Movies</span>
        </div>
        <hr />
        <div className='myPageReviewMovies'>
          <span classNamen='myPageSpan'>My Review Movies</span>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
