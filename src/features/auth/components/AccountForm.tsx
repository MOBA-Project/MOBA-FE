import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { checkId, signup } from 'features/auth/api/users';
import './AccountForm.css';

type Saying = { id: number; text: string };
type Props = { wiseSaying: Saying[]; currentSlide: number };

const AccountForm: React.FC<Props> = ({ wiseSaying, currentSlide }) => {
  const [nick, setNick] = useState('');
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');

  const [idError, setIdError] = useState('');
  const [pwError, setPwError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const [isIdCheck, setIsIdCheck] = useState(false);
  const [isIdAvailable, setIsIdAvailable] = useState(false);

  const isIdCheckHandler = async () => {
    const idRegex = /^[a-z\d]{5,10}$/;
    if (!id) {
      setIdError('아이디를 입력해주세요.');
      setIsIdAvailable(false);
      return false;
    }
    if (!idRegex.test(id)) {
      setIdError('아이디는 5~10자의 영소문자, 숫자만 입력 가능합니다.');
      setIsIdAvailable(false);
      return false;
    }
    try {
      const ok = await checkId({ id });
      if (ok) {
        setIdError('사용 가능한 아이디입니다.');
        setIsIdCheck(true);
        setIsIdAvailable(true);
        return true;
      }
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setIdError('이미 사용 중인 아이디입니다.');
        setIsIdAvailable(false);
      } else {
        setIdError('서버 오류입니다. 나중에 다시 시도해주세요.');
      }
    }
    return false;
  };

  const pwCheckHandler = () => {
    const pwRegex = /^[a-z\d!@*&-_]{8,16}$/;
    if (!pw) {
      setPwError('비밀번호를 입력해주세요.');
      return false;
    }
    if (!pwRegex.test(pw)) {
      setPwError('비밀번호는 8~16자의 영소문자, 숫자, 특수문자(!@*&-_)');
      return false;
    }
    if (confirm !== pw) {
      setConfirmError('비밀번호가 일치하지 않습니다.');
      return false;
    }
    setPwError('');
    setConfirmError('');
    return true;
  };

  const signupHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    const idOK = await isIdCheckHandler();
    if (!idOK || !isIdCheck || !isIdAvailable) {
      alert('아이디 중복 검사를 해주세요.');
      return;
    }
    if (!pwCheckHandler()) return;
    try {
      const ok = await signup({ id, pw, nick });
      if (ok) {
        alert('회원가입이 완료되었습니다. 로그인 해주세요.');
        window.location.href = '/';
      }
    } catch (e) {
      alert('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className='Account-container'>
      <div className='Account-content'>
        <div
          className='saying'
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(wiseSaying[currentSlide]?.text || '') }}
        />
        <form className='accountForm' onSubmit={signupHandler}>
          <div className='nickContainer'>
            <input className='Account-Input1' type='text' placeholder='닉네임' value={nick} onChange={(e)=>setNick(e.target.value)} maxLength={16} />
          </div>
          <div className='idContainer'>
            <input className='Account-Input1' type='text' placeholder='아이디' value={id} onChange={(e)=>setId(e.target.value)} id='id' maxLength={16} />
            <div className='idCheckButtonContainer'>
              <button type='button' onClick={isIdCheckHandler} className='idCheckButton'>아이디 중복 확인</button>
            </div>
            {idError && <small>{idError}</small>}
          </div>
          <div className='pwContainer'>
            <input className='Account-Input2' type='password' placeholder='비밀번호' value={pw} onChange={(e)=>setPw(e.target.value)} id='pw' maxLength={16} />
            {pwError && <small>{pwError}</small>}
          </div>
          <div className='confirmContainer'>
            <input className='Account-Input2' type='password' placeholder='비밀번호 확인' value={confirm} onChange={(e)=>setConfirm(e.target.value)} id='confirm' maxLength={16} />
            {confirmError && <small>{confirmError}</small>}
          </div>
          <div className='Account-BtnContainer'>
            <button className='Account-Btn'>회원가입</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountForm;
