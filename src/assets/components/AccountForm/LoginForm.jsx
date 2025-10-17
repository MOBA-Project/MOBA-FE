import React, { useState } from "react";
import DOMPurify from "dompurify";
import { login as loginApi } from "../../../features/auth/api";
import "../AccountForm/LoginForm.css";
import { useNavigate } from "react-router-dom";

const LoginForm = ({ wiseSaying, currentSlide }) => {
  const [idError, setIdError] = useState("");
  const [pwError, setPwError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const [isIdCheck, setIsIdCheck] = useState(false);
  const [isIdAvailable, setIsIdAvailable] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [id, setID] = useState("");
  const [pw, setPw] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const onIdHandler = (e) => setID(e.target.value);
  const onPwHandler = (e) => setPw(e.target.value);

  const loginHandler = async (e) => {
    e.preventDefault();
    if (!id || !pw) {
      setErrorMessage("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const data = await loginApi({ id, password: pw });
      if (data?.accessToken) {
        alert("로그인 성공!");
        navigate("/main");
      }
    } catch (error) {
      setErrorMessage(
        error.response?.status === 401
          ? "아이디 또는 비밀번호가 올바르지 않습니다."
          : "서버 오류입니다. 나중에 다시 시도해주세요."
      );
    }
  };

  return (
    <div className="Account-container">
      <div className="Account-content">
        <div
          className="saying"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(wiseSaying[currentSlide]?.text || ""),
          }}
        ></div>
        <form className="accountForm" onSubmit={signupHandler}>
          <div className="idContainer">
            <input
              type="text"
              placeholder="아이디"
              onChange={(e) => setId(e.target.value)}
              value={id}
              className="Account-Input1"
              id="id"
              maxLength={16}
            />
            <button
              type="button"
              onClick={isIdCheckHandler}
              className="idCheckButton"
            >
              아이디 중복 확인
            </button>
            {idError && <small>{idError}</small>}
          </div>
          <div className="pwContainer">
            <input
              type="password"
              placeholder="비밀번호"
              onChange={(e) => setPw(e.target.value)}
              value={pw}
              className="Account-Input2"
              id="pw"
              maxLength={16}
            />
            {pwError && <small>{pwError}</small>}
          </div>

          <div className="Account-BtnContainer">
            <button className="Account-Btn">로그인</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
