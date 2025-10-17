import React, { useState } from "react";
import DOMPurify from "dompurify";
import { checkIdAvailable, signup as signupApi } from "../../../features/auth/api";
import "../AccountForm/LoginForm.css";
import { Link, useNavigate } from "react-router-dom";

const LoginForm = ({ wiseSaying, currentSlide }) => {
  const [nick, setNick] = useState("");
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState(""); // 비밀번호 확인 상태 추가

  const [idError, setIdError] = useState("");
  const [pwError, setPwError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const [isIdCheck, setIsIdCheck] = useState(false);
  const [isIdAvailable, setIsIdAvailable] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const navigate = useNavigate();

  // 아이디 중복 확인
  const isIdCheckHandler = async () => {
    const idRegex = /^[a-z\d]{5,10}$/;
    if (id === "") {
      setIdError("아이디를 입력해주세요.");
      setIsIdAvailable(false);
      return false;
    } else if (!idRegex.test(id)) {
      setIdError("아이디는 5~10자의 영소문자, 숫자만 입력 가능합니다.");
      setIsIdAvailable(false);
      return false;
    }

    try {
      const res = await checkIdAvailable(id);
      if (res.available) {
        setIdError("사용 가능한 아이디입니다.");
        setIsIdCheck(true);
        setIsIdAvailable(true);
        return true;
      }
    } catch (error) {
      if (error?.status === 409 || error?.response?.status === 409) {
        setIdError("이미 사용 중인 아이디입니다.");
        setIsIdAvailable(false);
      } else {
        setIdError("서버 오류입니다. 나중에 다시 시도해주세요.");
      }
      return false;
    }
  };

  // 비밀번호 유효성 검사
  const pwCheckHandler = () => {
    const pwRegex = /^[a-z\d!@*&-_]{8,16}$/;
    if (pw === "") {
      setPwError("비밀번호를 입력해주세요.");
      return false;
    } else if (!pwRegex.test(pw)) {
      setPwError("비밀번호는 8~16자의 영소문자, 숫자, 특수문자(!@*&-_)");
      return false;
    } else if (confirm !== pw) {
      setConfirmError("비밀번호가 일치하지 않습니다.");
      return false;
    } else {
      setPwError("");
      setConfirmError("");
      return true;
    }
  };

  // 회원가입 처리
  const signupHandler = async (e) => {
    e.preventDefault();
    const idCheckResult = await isIdCheckHandler();
    if (!idCheckResult) return;
    if (!isIdCheck || !isIdAvailable) {
      alert("아이디 중복 검사를 해주세요.");
      return;
    }

    const passwordCheckResult = pwCheckHandler();
    if (!passwordCheckResult) return;

    try {
      const resp = await signupApi({ id, password: pw, nickname: nick });
      if (resp?._id || resp?.id) {
        alert("회원가입이 완료되었습니다.");
        navigate("/");
      }
    } catch (error) {
      alert("회원가입에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className='Account-container'>
      <div className='Account-content'>
        <div
          className='saying'
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(wiseSaying[currentSlide]?.text || ""),
          }}
        ></div>
        <form className='accountForm' onSubmit={signupHandler}>
          <div className='nickContainer'>
            <input
              type='text'
              placeholder='닉네임'
              onChange={(e) => setNick(e.target.value)}
              value={nick}
              className='Account-Input1'
              maxLength={16}
            />
          </div>
          <div className='idContainer'>
            <input
              type='text'
              placeholder='아이디'
              onChange={(e) => setId(e.target.value)}
              value={id}
              className='Account-Input1'
              id='id'
              maxLength={16}
            />
            <div className='idCheckButtonContainer'>
              <button
                type='button'
                onClick={isIdCheckHandler}
                className='idCheckButton'
              >
                아이디 중복 확인
              </button>
            </div>

            {idError && <small>{idError}</small>}
          </div>
          <div className='pwContainer'>
            <input
              type='password'
              placeholder='비밀번호'
              onChange={(e) => setPw(e.target.value)}
              value={pw}
              className='Account-Input2'
              id='pw'
              maxLength={16}
            />
            {pwError && <small>{pwError}</small>}
          </div>
          <div className='confirmContainer'>
            <input
              type='password'
              placeholder='비밀번호 확인'
              onChange={(e) => setConfirm(e.target.value)}
              value={confirm}
              className='Account-Input2'
              id='confirm'
              maxLength={16}
            />
            {confirmError && <small>{confirmError}</small>}
          </div>
          <div className='Account-BtnContainer'>
            <button className='Account-Btn'>회원가입</button>
          </div>
          <Link
            className='afl'
            style={{ textDecoration: "none", marginTop: 10 }}
            to='/'
          >
            로그인
          </Link>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
