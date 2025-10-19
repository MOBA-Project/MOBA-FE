import React, { useState } from "react";
import { login } from './api';
import { useNavigate } from 'react-router-dom';
import ImageSlider from 'shared/components/Slider/Slider';
import Logo from 'assets/images/Logo2.png';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [id, setID] = useState("");
  const [pw, setPw] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    if (!id || !pw) {
      setErrorMessage("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    try {
      const data = await login({ id, password: pw });
      if (data?.accessToken) localStorage.setItem("token", data.accessToken);
      navigate('/main');
    } catch (err: any) {
      setErrorMessage("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  const wiseSaying = [
    { id: 1, text: ' "우린 어디쯤 있는 거지?"<br />"그냥 흘러가는 대로 가보자." <br /><br />  - 영화 \'라라랜드\'中' },
    { id: 2, text: " \"네가 원하는 것은 무엇이들 말만해.\" <br /><br />  - 영화 '노트북'中" },
    { id: 3, text: '"큰 힘에는 큰 책임이 따른다." <br /><br />  - 영화 \'스파이더맨 노웨이홈 中"' },
    { id: 4, text: ' " 한 번 만난 인연은 잊혀지는 것이 아니라" <br /> "잊고 있을 뿐이다. "<br /><br /> - 영화 \' 센과 치히로의 행방불명 中 ' },
    { id: 5, text: '"사랑은 너보다 다른 사람의 필요함을"<br /> "우선시 하는 것이야."<br /><br /> - 영화 \'겨울왕국" 中' },
  ];

  return (
    <>
      <ImageSlider onSlideChange={setCurrentSlide} />
      <div className="Login-main">
        <div className="loginLogo">
          <img src={Logo} alt="logo" />
        </div>
        <div className="Login-container">
          <div className="Login-content">
            <div
              className="saying"
              dangerouslySetInnerHTML={{ __html: wiseSaying[currentSlide]?.text }}
            />
            <input
              className="Login-Input1"
              type="text"
              placeholder="아이디"
              value={id}
              onChange={(e) => setID(e.target.value)}
            />
            <input
              className="Login-Input2"
              type="password"
              placeholder="비밀번호"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
            {errorMessage && (
              <small className="errorMessage">{errorMessage}</small>
            )}
            <button onClick={() => onSubmit()} className="Login-Btn">
              로그인
            </button>
            <p className="aoc" onClick={() => navigate('/account')}>
              회원가입
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
