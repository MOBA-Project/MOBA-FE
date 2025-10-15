import React, { useState } from "react";
import ImageSlider from 'shared/components/Slider/Slider';
import Logo from 'assets/images/Logo2.png';
import './Account.css';
import AccountForm from './components/AccountForm';

const CreateAccount: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const wiseSaying = [
    { id: 1, text: ' "우린 어디쯤 있는 거지?"<br />"그냥 흘러가는 대로 가보자." <br /><br />  - 영화 \'라라랜드\'中' },
    { id: 2, text: " \"네가 원하는 것은 무엇이들 말만해.\" <br /><br />  - 영화 '노트북'中" },
    { id: 3, text: '"큰 힘에는 큰 책임이 따른다." <br /><br />  - 영화 \'스파이더맨 노웨이홈 中"' },
    { id: 4, text: ' " 한 번 만난 인연은 잊혀지는 것이 아니라" <br /> "잊고 있을 뿐이다. "<br /><br /> - 영화 \' 센과 치히로의 행방불명 中 ' },
    { id: 5, text: '"사랑은 너보다 다른 사람의 필요함을"<br /> "우선시 하는 것이야."<br /><br /> - 영화 \'겨울왕국" 中' },
  ];

  return (
    <div className='Account-main'>
      <ImageSlider onSlideChange={setCurrentSlide} />
      <div className='loginLogo'>
        <img src={Logo} alt='logo' />
      </div>
      <AccountForm wiseSaying={wiseSaying} currentSlide={currentSlide} />
    </div>
  );
};

export default CreateAccount;
