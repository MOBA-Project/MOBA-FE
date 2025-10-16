import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchReviewsByMovie,
  fetchMovieReviewStats,
  reactReview,
  fetchReviewRootComments,
  fetchReviewReplies,
  addReviewComment,
  updateReviewComment,
  deleteReviewComment,
  createReview,
  reactReviewComment,
} from './api';

type User = { id: string; nick: string } | null;

const CommentBox: React.FC<{ onSubmit: (text: string)=>void; placeholder?: string; initial?: string; onCancel?: ()=>void }>
  = ({ onSubmit, placeholder, initial = '', onCancel }) => {
  const [text, setText] = useState(initial);
  return (
    <div style={{ display:'flex', gap:8, marginTop:8 }}>
      <textarea value={text} onChange={(e)=>setText(e.target.value)} placeholder={placeholder} rows={3} style={{ flex:1, padding:8 }} />
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <button onClick={()=>{ if(text.trim()) { onSubmit(text.trim()); setText(''); }}} style={{ height:40 }}>등록</button>
        {onCancel && <button onClick={onCancel} style={{ height:32 }}>취소</button>}
      </div>
    </div>
  );
};

const ReviewItem: React.FC<{
  review: any;
  user: User;
}> = ({ review, user }) => {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggleExpanded = (rootId: string) => setExpanded(prev => ({ ...prev, [rootId]: !prev[rootId] }));

  // Root comments
  const { data: roots, refetch: refetchRoots } = useQuery({
    queryKey: ['review', review._id, 'comments', 'root'],
    queryFn: () => fetchReviewRootComments(review._id, 1, 10, 'recent'),
  });

  const addRoot = useMutation({
    mutationFn: (text: string) => addReviewComment(review._id, text),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['review', review._id, 'comments', 'root'] }); },
  });

  const addReply = useMutation({
    mutationFn: ({ rootId, text }: { rootId: string; text: string }) => addReviewComment(review._id, text, rootId),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['review', review._id, 'comments', vars.rootId] });
      qc.invalidateQueries({ queryKey: ['review', review._id, 'comments', 'root'] });
    },
  });

  const editComment = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => updateReviewComment(review._id, id, text),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['review', review._id, 'comments', 'root'] });
      qc.invalidateQueries({ predicate: (q)=> Array.isArray(q.queryKey) && q.queryKey[0]==='review' && q.queryKey[2]==='comments' && q.queryKey[3]===vars.id });
    }
  });

  const deleteCommentMut = useMutation({
    mutationFn: (id: string) => deleteReviewComment(review._id, id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ['review', review._id, 'comments', 'root'] });
      qc.invalidateQueries({ predicate: (q)=> Array.isArray(q.queryKey) && q.queryKey[0]==='review' && q.queryKey[2]==='comments' && q.queryKey[3]===id });
    }
  });

  const likeReviewMut = useMutation({
    mutationFn: () => reactReview(review._id, 'like'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['movie', review.movieId, 'reviews'] })
  });
  const dislikeReviewMut = useMutation({
    mutationFn: () => reactReview(review._id, 'dislike'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['movie', review.movieId, 'reviews'] })
  });

  return (
    <div style={{ border:'1px solid #333', borderRadius:8, padding:12, marginBottom:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:28, height:28, borderRadius:'50%', background:'#424685', color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight:900 }}>
          {String(review.userId).charAt(0).toUpperCase()}
        </div>
        <div style={{ color:'#ddd', fontWeight:700 }}>평점 {review.rating}</div>
        <div style={{ color:'#888', fontSize:12, marginLeft:8 }}>{new Date(review.createdAt).toLocaleString()}</div>
        <button onClick={()=> user ? likeReviewMut.mutate() : alert('로그인이 필요합니다.')} style={{ marginLeft:'auto', background:'transparent', border:'none', color:'#ffd166', cursor:'pointer' }}>좋아요 {review.likes || 0}</button>
        <button onClick={()=> user ? dislikeReviewMut.mutate() : alert('로그인이 필요합니다.')} style={{ background:'transparent', border:'none', color:'#f88', cursor:'pointer' }}>싫어요 {review.dislikes || 0}</button>
      </div>
      <div style={{ color:'#eee', whiteSpace:'pre-wrap', marginTop:6 }}>{review.content}</div>

      <div style={{ marginTop: 10 }}>
        <CommentBox placeholder='댓글을 남겨보세요' onSubmit={(t)=>{ if(!user) return alert('로그인이 필요합니다.'); addRoot.mutate(t); }} />
        <div style={{ marginTop: 8 }}>
          {(roots?.items || roots?.reviews || roots || []).map((root: any) => (
            <RootCommentView key={root.id}
              reviewId={review._id}
              user={user}
              root={root}
              expanded={!!expanded[root.id]}
              onToggle={()=>toggleExpanded(root.id)}
              onReply={(text)=>{ if(!user) return alert('로그인이 필요합니다.'); addReply.mutate({ rootId: root.id, text }); }}
              onEdit={(id, text)=> editComment.mutate({ id, text })}
              onDelete={(id)=> { if (window.confirm('정말로 삭제하시겠습니까?')) deleteCommentMut.mutate(id); }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const RootCommentView: React.FC<{
  reviewId: string;
  user: User;
  root: any;
  expanded: boolean;
  onToggle: ()=>void;
  onReply: (text: string)=>void;
  onEdit: (id: string, text: string)=>void;
  onDelete: (id: string)=>void;
}> = ({ reviewId, user, root, expanded, onToggle, onReply, onEdit, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const { data: replies } = useQuery({
    enabled: expanded,
    queryKey: ['review', reviewId, 'comments', root.id],
    queryFn: () => fetchReviewReplies(reviewId, root.id, 1, 50, 'recent'),
  });
  const likeCommentMut = useMutation({
    mutationFn: () => reactReviewComment(reviewId, root.id),
  });

  return (
    <div style={{ padding:'8px 0', borderBottom:'1px solid #222' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:28, height:28, borderRadius:'50%', background:'#424685', color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight:900 }}>
          {String(root.userId).charAt(0).toUpperCase()}
        </div>
        <div style={{ color:'#ddd', fontWeight:700 }}>{root.userId}</div>
        <div style={{ color:'#888', fontSize:12 }}>{new Date(root.createdAt).toLocaleString()}</div>
        <button onClick={()=> user ? likeCommentMut.mutate() : alert('로그인이 필요합니다.')} style={{ marginLeft:'auto', background:'transparent', border:'none', color:'#ffd166', cursor:'pointer' }}>
          ★ {root.likesBy?.length || 0}
        </button>
      </div>
      {!editing ? (
        <div style={{ color:'#eee', whiteSpace:'pre-wrap', marginTop:6 }}>{root.content}</div>
      ) : (
        <CommentBox initial={root.content} onSubmit={(t)=>{ onEdit(root.id, t); setEditing(false);} } onCancel={()=>setEditing(false)} />
      )}
      <div style={{ display:'flex', gap:8, marginTop:6 }}>
        <button onClick={()=> setReplyOpen(v=>!v)}>답글</button>
        <button onClick={onToggle}>{expanded ? '답글 숨기기' : `답글 ${(root.repliesCount||0)}개 보기`}</button>
        {/* NOTE: 사용자 닉은 서버에 없음(데모). 본인 여부 판단은 생략 */}
        <button onClick={()=>setEditing(true)}>수정</button>
        <button onClick={()=> onDelete(root.id)}>삭제</button>
      </div>
      {replyOpen && <CommentBox placeholder='답글을 입력하세요' onSubmit={(t)=>{ onReply(t); setReplyOpen(false);} } onCancel={()=>setReplyOpen(false)} />}
      {expanded && (
        <div style={{ marginLeft: 24, marginTop:8 }}>
          {(replies?.items || []).map((rep: any) => (
            <ChildCommentView key={rep.id} reviewId={reviewId} user={user} c={rep} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

const ChildCommentView: React.FC<{ reviewId: string; user: User; c: any; onEdit: (id: string, text: string)=>void; onDelete: (id: string)=>void }>
  = ({ reviewId, user, c, onEdit, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const likeCommentMut = useMutation({ mutationFn: () => reactReviewComment(reviewId, c.id) });
  return (
    <div style={{ padding:'8px 0', borderBottom:'1px solid #222' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:24, height:24, borderRadius:'50%', background:'#555', color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight:900 }}>
          {String(c.userId).charAt(0).toUpperCase()}
        </div>
        <div style={{ color:'#ddd', fontWeight:700 }}>{c.userId}</div>
        <div style={{ color:'#888', fontSize:12 }}>{new Date(c.createdAt).toLocaleString()}</div>
        <button onClick={()=> user ? likeCommentMut.mutate() : alert('로그인이 필요합니다.')} style={{ marginLeft:'auto', background:'transparent', border:'none', color:'#ffd166', cursor:'pointer' }}>
          ★ {c.likesBy?.length || 0}
        </button>
      </div>
      {!editing ? (
        <div style={{ color:'#eee', whiteSpace:'pre-wrap', marginTop:6 }}>{c.content}</div>
      ) : (
        <CommentBox initial={c.content} onSubmit={(t)=>{ onEdit(c.id, t); setEditing(false);} } onCancel={()=>setEditing(false)} />
      )}
      <div style={{ display:'flex', gap:8, marginTop:6 }}>
        <button onClick={()=>setEditing(true)}>수정</button>
        <button onClick={()=>{ if(window.confirm('정말로 삭제하시겠습니까?')) onDelete(c.id); }}>삭제</button>
      </div>
    </div>
  );
};

const CreateReviewBox: React.FC<{ movieId: number; onCreated: ()=>void; user: User }>
  = ({ movieId, onCreated, user }) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: () => createReview({ movieId, rating, content }),
    onSuccess: (created) => {
      setContent('');
      // Optimistically prepend the created review to the cached list
      qc.setQueryData(['movie', movieId, 'reviews'], (prev: any) => {
        if (!prev) return prev;
        // support both {reviews:[]} and {items:[]}
        if (Array.isArray(prev)) return [created, ...prev];
        if (Array.isArray(prev.reviews)) {
          const total = (prev.total || prev.reviews.length) + 1;
          return { ...prev, reviews: [created, ...prev.reviews], total, totalPages: Math.max(1, Math.ceil(total / (prev.limit || 10))) };
        }
        if (Array.isArray(prev.items)) {
          const total = (prev.total || prev.items.length) + 1;
          return { ...prev, items: [created, ...prev.items], total, totalPages: Math.max(1, Math.ceil(total / (prev.limit || 10))) };
        }
        return prev;
      });
      qc.invalidateQueries({ queryKey: ['movie', movieId, 'reviewStats'] });
      onCreated();
    },
  });
  return (
    <div style={{ border:'1px dashed #444', borderRadius:8, padding:12, margin:'12px 0' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ color:'#ddd' }}>평점</span>
        <input type='number' min={1} max={5} value={rating} onChange={e=>setRating(Number(e.target.value))} style={{ width:60 }}/>
      </div>
      <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder='리뷰를 작성하세요' rows={4} style={{ width:'100%', marginTop:8, padding:8 }} />
      <div style={{ display:'flex', gap:8, marginTop:8 }}>
        <button onClick={()=>{ if(!user) return alert('로그인이 필요합니다.'); if(!content.trim()) return; mut.mutate(); }}>리뷰 등록</button>
      </div>
    </div>
  );
};

const ReviewsSection: React.FC<{ movieId: number; user: User }> = ({ movieId, user }) => {
  const qc = useQueryClient();
  const { data: stats } = useQuery({ queryKey: ['movie', movieId, 'reviewStats'], queryFn: () => fetchMovieReviewStats(movieId) });
  const { data: list, refetch } = useQuery({ queryKey: ['movie', movieId, 'reviews'], queryFn: () => fetchReviewsByMovie(movieId, 1, 10, { sort: 'recent' }) });

  const items = useMemo(() => (list?.reviews || list?.items || list || []), [list]);

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ color:'#fff' }}>리뷰</h3>
      <div style={{ color:'#ccc', marginBottom: 8 }}>평균 {stats?.averageRating || 0} / 리뷰 {stats?.totalReviews || 0}</div>
      <CreateReviewBox movieId={movieId} user={user} onCreated={()=>{ qc.invalidateQueries({ queryKey: ['movie', movieId, 'reviews'] }); qc.invalidateQueries({ queryKey: ['movie', movieId, 'reviewStats'] }); }} />
      <div>
        {items.map((rv: any) => (
          <ReviewItem key={rv._id} review={rv} user={user} />
        ))}
      </div>
    </div>
  );
};

export default ReviewsSection;
