import React, { useEffect, useState } from 'react';
import Menu from '../../shared/components/Sidebar/Menu';
import { Row } from 'antd';
import Movie from '../movies/components/MovieCard';
import './MyList.css';
import { getLikedMovies, getReviewedMovies } from '../../shared/utils/userData';

const MyList = () => {
  const [userId, setUserId] = useState<string>('');
  const [liked, setLiked] = useState<any[]>([]);
  const [reviewed, setReviewed] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'liked' | 'reviewed'>('liked');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://localhost:5001/users/protected', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.id) return;
        setUserId(data.id);
        setLiked(getLikedMovies(data.id));
        setReviewed(getReviewedMovies(data.id));
      })
      .catch(() => {});
  }, []);

  const list = activeTab === 'liked' ? liked : reviewed;

  return (
    <div className="mylistContainer">
      <Menu />
      <div className="mylistContent">
        <div className="mylistHeader">
          <h2 style={{ margin:0 }}>Mylist</h2>
          <div className="actions">
            {activeTab==='liked' && (
              <button onClick={()=>{ if(!userId) return; localStorage.setItem(`likedMovies_${userId}`, JSON.stringify([])); setLiked([]); }}>좋아요 비우기</button>
            )}
            <button onClick={()=>window.scrollTo({top:0, behavior:'smooth'})}>맨위로</button>
          </div>
        </div>
        <div className="tabs">
          <button
            className={activeTab === 'liked' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('liked')}
          >
            좋아요 ({liked.length})
          </button>
          <button
            className={activeTab === 'reviewed' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('reviewed')}
          >
            리뷰 ({reviewed.length})
          </button>
        </div>
        <Row gutter={[32, 32]}>
          {list.length === 0 ? (
            <div className="emptyBox">비어있어요. 마음에 드는 영화를 추가해보세요.</div>
          ) : (
            list.map((m) => <Movie key={m.id} movieData={m} />)
          )}
        </Row>
      </div>
    </div>
  );
};

export default MyList;
