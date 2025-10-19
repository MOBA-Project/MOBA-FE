import React from 'react';
import './MobileBlocker.css';

const isMobileUA = () => {
  if (typeof navigator === 'undefined') return false;
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const MobileBlocker: React.FC = () => {
  const [blocked, setBlocked] = React.useState(false);

  React.useEffect(() => {
    const check = () => {
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
      // Block if small viewport or explicit mobile UA
      setBlocked(vw < 768 || isMobileUA());
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!blocked) return null;
  return (
    <div className="mobileBlockerOverlay" role="dialog" aria-modal="true">
      <div className="mobileBlockerCard">
        <h3>PC에서 접속해 주세요</h3>
        <p>
          현재 모바일 화면은 준비 중입니다. 데스크톱(PC) 환경에서 이용해 주세요.
        </p>
      </div>
    </div>
  );
};

export default MobileBlocker;

