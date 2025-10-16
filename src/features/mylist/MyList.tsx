import React, { useEffect, useState } from 'react';
import Menu from '../../shared/components/Sidebar/Menu';
import { Row } from 'antd';
import Movie from '../movies/components/MovieCard';
import './MyList.css';
import { getBookmarks, clearBookmarks } from '../../shared/utils/userData';
import { fetchMovieDetail } from '../movies/api';

const MyList = () => {
  const [userId, setUserId] = useState<string>('');
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [reviewed, setReviewed] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'reviewed'>('bookmarks');

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
        setBookmarks(getBookmarks(data.id));
        // Fetch my reviews from backend and hydrate with movie summaries
        fetch('http://localhost:5001/reviews/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then(async (reviews: any[]) => {
            if (!Array.isArray(reviews)) return setReviewed([]);
            const hydrated = await Promise.all(
              reviews.map(async (rv) => {
                try {
                  const mv = await fetchMovieDetail(rv.movieId);
                  return {
                    id: mv.id,
                    title: mv.title || mv.name,
                    poster_path: mv.poster_path,
                    to: `/movie/${mv.id}?review=${encodeURIComponent(rv._id)}`,
                  };
                } catch {
                  return { id: rv.movieId, title: `영화 ${rv.movieId}`, to: `/movie/${rv.movieId}?review=${encodeURIComponent(rv._id)}` };
                }
              })
            );
            setReviewed(hydrated);
          })
          .catch(() => setReviewed([]));
      })
      .catch(() => {});
  }, []);

  const list = activeTab === 'bookmarks' ? bookmarks : reviewed;

  return (
    <div className="mylistContainer">
      <Menu />
      <div className="mylistContent">
        <div className="mylistHeader">
          <h2 style={{ margin:0 }}>Mylist</h2>
          <div className="actions">
            {activeTab==='bookmarks' && (
              <button onClick={()=>{ if(!userId) return; clearBookmarks(userId); setBookmarks([]); }}>북마크 비우기</button>
            )}
            <button onClick={()=>window.scrollTo({top:0, behavior:'smooth'})}>맨위로</button>
          </div>
        </div>
        <div className="tabs">
          <button
            className={activeTab === 'bookmarks' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('bookmarks')}
          >
            북마크 ({bookmarks.length})
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
            list.map((m) => <Movie key={m.id} movieData={m} to={m.to} />)
          )}
        </Row>
      </div>
    </div>
  );
};

export default MyList;
