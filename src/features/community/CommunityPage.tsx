import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { listPosts } from './api';
import './Community.css';
import { AiOutlineHeart, AiOutlineComment } from 'react-icons/ai';

const PageSize = 10;

const CommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const location = useLocation() as any;
  const pendingUpdateRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listPosts(page, PageSize)
      .then(({ items, total }) => {
        if (!mounted) return;
        // Merge any pending update (from PostDetail state)
        const upd = pendingUpdateRef.current || location?.state?.updatedPost;
        let next = items;
        if (upd && upd.id) {
          next = items.map((it: any) =>
            String(it._id) === String(upd.id)
              ? { ...it, commentCount: typeof upd.commentCount === 'number' ? upd.commentCount : it.commentCount, likes: typeof upd.likes === 'number' ? upd.likes : it.likes }
              : it
          );
        }
        setItems(next);
        setTotal(total || items.length);
      })
      .catch(() => {
        if (!mounted) return;
        setError('게시글을 불러오지 못했습니다.');
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [page]);

  // Capture navigation state update once then clear it
  useEffect(() => {
    const upd = location?.state?.updatedPost;
    if (upd && upd.id) {
      pendingUpdateRef.current = upd;
      // Clear state to avoid reapplying on future navigations
      window.history.replaceState({}, document.title);
    }
  }, [location?.state]);

  const pageCount = Math.max(1, Math.ceil(total / PageSize));

  return (
    <div className="communityContainer">
      <div className="communityHeader">
        <h2 style={{ margin: 0, color: '#fff' }}>커뮤니티</h2>
        <button className="writeBtn" onClick={() => navigate('/community/new')}>감상문 작성</button>
      </div>
      {loading && <p>불러오는 중…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <div className="postGrid">
          {items.map((p: any) => (
            <div key={p._id} onClick={() => navigate(`/community/posts/${p._id}`)} className="postCard">
              <div style={{ display: 'flex', gap: 12 }}>
                {p.moviePoster ? (
                  <img src={`https://image.tmdb.org/t/p/w185${p.moviePoster}`} alt={p.movieTitle} style={{ width: 92, height: 138, objectFit: 'cover', borderRadius: 6 }} />
                ) : (
                  <div style={{ width: 92, height: 138, background: '#f2f2f2', borderRadius: 6 }} />
                )}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 6px' }}>{p.title}</h3>
                  <div style={{ color: '#a8a8c9', marginBottom: 6 }}>
                    영화: {p.movieTitle} · 평점: {p.rating}
                  </div>
                  <div className="postMeta" style={{ display:'flex', gap:12, alignItems:'center' }}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                      <AiOutlineComment /> {p.commentCount ?? 0}
                    </span>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                      <AiOutlineHeart /> {p.likes ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: '#777' }}>게시글이 없습니다.</div>}
        </div>
      )}
      <div className="pager">
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>이전</button>
        <span>{page} / {pageCount}</span>
        <button disabled={page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>다음</button>
      </div>
    </div>
  );
};

export default CommunityPage;
