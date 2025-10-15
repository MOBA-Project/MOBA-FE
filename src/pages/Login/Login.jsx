import React, { useState } from "react";
import axios from "axios";
import { FaRegUserCircle, FaLock } from "react-icons/fa";
import ImageSlider from "../../shared/components/Slider/Slider";
import "../Login/Login.css";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/images/Logo2.png";

const Login = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [id, setID] = useState("");
  const [pw, setPw] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const accountOnClick = () => {
    navigate("/account");
  };

  const onIdHandler = (e) => setID(e.target.value);
  const onPwHandler = (e) => setPw(e.target.value);

  const loginHandler = async (e) => {
    e.preventDefault();
    if (!id || !pw) {
      setErrorMessage("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5001/users/login", {
        id,
        pw,
      });
      if (response.status === 200) {
        const token = response.data.token;
        console.log("토큰 발행 성공: ", token);
        localStorage.setItem("token", token);
        console.log("토큰을 로컬 스토리지에 저장했습니다");
        alert("로그인 성공!");
        navigate("/main");
        // Redirect to another page
      }
    } catch (error) {
      setErrorMessage(
        error.response?.status === 401
          ? "아이디 또는 비밀번호가 올바르지 않습니다."
          : "서버 오류입니다. 나중에 다시 시도해주세요."
      );
    }
  };

  const wiseSaying = [
    {
      id: 1,
      text: ' "우린 어디쯤 있는 거지?"<br />"그냥 흘러가는 대로 가보자." <br /><br />  - 영화 \'라라랜드\'中',
    },
    {
      id: 2,
      text: " \"네가 원하는 것은 무엇이들 말만해.\" <br /><br />  - 영화 '노트북'中",
    },
    {
      id: 3,
      text: '"큰 힘에는 큰 책임이 따른다." <br /><br />  - 영화 \'스파이더맨 노웨이홈 中"',
    },
    {
      id: 4,
      text: ' " 한 번 만난 인연은 잊혀지는 것이 아니라" <br /> "잊고 있을 뿐이다. "<br /><br /> - 영화 \' 센과 치히로의 행방불명 中 ',
    },
    {
      id: 5,
      text: '"사랑은 너보다 다른 사람의 필요함을"<br /> "우선시 하는 것이야."<br /><br /> - 영화 \'겨울왕국" 中',
    },
  ];

  return (
    <>
      <ImageSlider onSlideChange={setCurrentSlide} />
      <div>
        <div className="loginLogo">
          <img src={Logo} alt="" />
        </div>
        <div className="Login-container">
          <div className="Login-content">
            <div
              className="saying"
              dangerouslySetInnerHTML={{
                __html: wiseSaying[currentSlide]?.text,
              }}
            ></div>
            {/* <FaRegUserCircle className='loginIcon1' /> */}
            <input
              type="text"
              placeholder="아이디"
              onChange={onIdHandler}
              value={id}
              className="Login-Input1"
            />
            {/* <FaLock className='loginIcon2' /> */}
            <input
              type="password"
              placeholder="비밀번호"
              onChange={onPwHandler}
              value={pw}
              className="Login-Input2"
            />
            {errorMessage && (
              <small className="errorMessage">{errorMessage}</small>
            )}
            <button onClick={loginHandler} className="Login-Btn">
              로그인
            </button>
            <p className="aoc" onClick={accountOnClick}>
              회원가입
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
