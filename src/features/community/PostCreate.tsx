import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPost } from './api';
import { searchMovies, fetchMovieDetail } from '../movies/api';
import './Community.css';

const PostCreate: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const doSearch = async () => {
    if (!query.trim()) return;
    try {
      const d = await searchMovies(query, 1);
      setResults(d.results || []);
    } catch {
      setResults([]);
    }
  };

  // If movieId is provided from Detail page, preselect and lock the movie
  useEffect(() => {
    const mid = params.get('movieId');
    if (!mid) return;
    (async () => {
      try {
        const mv = await fetchMovieDetail(mid);
        setSelected({ id: mv.id, title: mv.title || mv.name, poster_path: mv.poster_path });
      } catch {
        // ignore
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) {
      return setError('로그인이 필요합니다. 먼저 로그인해주세요.');
    }
    if (!selected) return setError('영화를 선택하세요.');
    if (!title.trim() || !content.trim()) return setError('제목/본문을 입력하세요.');
    setSubmitting(true);
    try {
      const p = await createPost({
        title: title.trim(),
        content: content.trim(),
        movieId: selected.id,
        movieTitle: selected.title || selected.name,
        moviePoster: selected.poster_path || null,
        rating: Math.max(1, Math.min(5, Number(rating))) || 5,
      });
      navigate(`/community/posts/${p._id}`);
    } catch (e: any) {
      setError(e?.message || '작성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="communityContainer">
      <h2 style={{ color: '#fff' }}>감상문 작성</h2>
      <form onSubmit={onSubmit} className="postCreateForm">
        <div>
          <div className="fieldLabel">영화 선택</div>
          {!selected && (
            <>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="textInput" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="영화 제목을 검색" style={{ flex: 1 }} />
                <button type="button" onClick={doSearch}>검색</button>
              </div>
              {results.length > 0 && (
                <div className="movieSearchList">
                  {results.map((m) => (
                    <div key={m.id} className="movieItem" onClick={()=>setSelected(m)}>
                      {m.poster_path ? <img alt={m.title||m.name} src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} /> : <div style={{ width: 62, height: 92, background: '#f2f2f2' }}/>} 
                      <div>
                        <div>{m.title || m.name}</div>
                        <small style={{ color: '#999' }}>id: {m.id}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {selected && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              {selected.poster_path ? <img alt={selected.title||selected.name} src={`https://image.tmdb.org/t/p/w92${selected.poster_path}`} /> : <div style={{ width: 62, height: 92, background: '#f2f2f2' }}/>} 
              <div>
                <div style={{ fontWeight: 600 }}>{selected.title || selected.name}</div>
                <small style={{ color: '#999' }}>id: {selected.id}</small>
              </div>
              <button type="button" onClick={()=>{ setSelected(null); setResults([]); }}>변경</button>
            </div>
          )}
        </div>

        <div>
          <div className="fieldLabel">제목</div>
          <input className="textInput" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="제목" />
        </div>
        <div>
          <div className="fieldLabel">본문</div>
          <textarea className="textArea" value={content} onChange={(e)=>setContent(e.target.value)} placeholder="내용" rows={10} />
        </div>
        <div>
          <div className="fieldLabel">평점 (1-5)</div>
          <input className="textInput" type="number" min={1} max={5} value={rating} onChange={(e)=>setRating(Number(e.target.value))} />
        </div>
        {error && <div style={{ color: 'tomato' }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="submitBtn" type="submit" disabled={submitting}>작성</button>
          <button className="cancelBtn" type="button" onClick={()=>navigate(-1)}>취소</button>
        </div>
      </form>
    </div>
  );
};

export default PostCreate;
