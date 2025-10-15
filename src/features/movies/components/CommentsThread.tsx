import React, { useEffect, useMemo, useState } from 'react';
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  toggleLikeComment,
  CommentItem,
} from '../../../shared/utils/comments';

type Props = { movieId: number; user: { id: string; nick: string } | null };

const CommentBox: React.FC<{ onSubmit: (text: string)=>void; placeholder?: string; initial?: string; onCancel?: ()=>void }>
  = ({ onSubmit, placeholder, initial = '', onCancel }) => {
  const [text, setText] = useState(initial);
  return (
    <div style={{ display:'flex', gap:8, marginTop:8 }}>
      <textarea value={text} onChange={(e)=>setText(e.target.value)} placeholder={placeholder}
        rows={3} style={{ flex:1, padding:8 }} />
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <button onClick={()=>{ if(text.trim()) { onSubmit(text.trim()); setText(''); }}} style={{ height:40 }}>등록</button>
        {onCancel && <button onClick={onCancel} style={{ height:32 }}>취소</button>}
      </div>
    </div>
  );
};

const CommentItemView: React.FC<{
  item: CommentItem;
  children?: React.ReactNode;
  me: { id: string; nick: string } | null;
  onReply: (parentId: string, text: string)=>void;
  onEdit: (id: string, text: string)=>void;
  onDelete: (id: string)=>void;
  onLike: (id: string)=>void;
}> = ({ item, children, me, onReply, onEdit, onDelete, onLike }) => {
  const [editing, setEditing] = useState(false);
  const [replying, setReplying] = useState(false);
  return (
    <div style={{ padding:'8px 0', borderBottom:'1px solid #222' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:28, height:28, borderRadius:'50%', background:'#424685', color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight:900 }}>
          {item.userNick?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div style={{ color:'#ddd', fontWeight:700 }}>{item.userNick}</div>
        <div style={{ color:'#888', fontSize:12 }}>{new Date(item.createdAt).toLocaleString()}</div>
        <button onClick={()=>onLike(item.id)} style={{ marginLeft:'auto', background:'transparent', border:'none', color:'#ffd166', cursor:'pointer' }}>
          ★ {item.likes?.length || 0}
        </button>
      </div>
      {!editing ? (
        <div style={{ color:'#eee', whiteSpace:'pre-wrap', marginTop:6 }}>{item.text}</div>
      ) : (
        <CommentBox initial={item.text} onSubmit={(t)=>{ onEdit(item.id, t); setEditing(false);} } onCancel={()=>setEditing(false)} />
      )}
      <div style={{ display:'flex', gap:8, marginTop:6 }}>
        <button onClick={()=>setReplying(v=>!v)}>답글</button>
        {me?.id === item.userId && <>
          <button onClick={()=>setEditing(true)}>수정</button>
          <button onClick={()=>onDelete(item.id)}>삭제</button>
        </>}
      </div>
      {replying && <CommentBox placeholder='답글을 입력하세요' onSubmit={(t)=>{ onReply(item.id, t); setReplying(false);} } onCancel={()=>setReplying(false)} />}
      <div style={{ marginLeft:24 }}>
        {children}
      </div>
    </div>
  );
};

const CommentsThread: React.FC<Props> = ({ movieId, user }) => {
  const [items, setItems] = useState<CommentItem[]>([]);
  useEffect(()=>{ setItems(getComments(movieId)); }, [movieId]);

  const tree = useMemo(()=>{
    const map: Record<string, CommentItem[]> = {} as any;
    for (const it of items) {
      const pid = it.parentId || 'root';
      map[pid] = map[pid] || [];
      map[pid].push(it);
    }
    return map;
  }, [items]);

  const renderChildren = (parentId: string | null) => {
    const list = tree[parentId || 'root'] || [];
    return list.map(it => (
      <CommentItemView key={it.id}
        item={it}
        me={user}
        onReply={(pid, text)=>{ if(!user) return alert('로그인이 필요합니다.'); setItems(addComment(movieId, user, text, pid)); }}
        onEdit={(id, text)=> setItems(updateComment(movieId, id, text))}
        onDelete={(id)=> setItems(deleteComment(movieId, id))}
        onLike={(id)=>{ if(!user) return alert('로그인이 필요합니다.'); setItems(toggleLikeComment(movieId, id, user.id)); }}
      >
        {renderChildren(it.id)}
      </CommentItemView>
    ));
  };

  return (
    <div style={{ marginTop: 16 }}>
      <h3 style={{ color:'#fff' }}>댓글</h3>
      <CommentBox
        placeholder='의견을 남겨보세요'
        onSubmit={(t)=>{ if(!user) return alert('로그인이 필요합니다.'); setItems(addComment(movieId, user, t, null)); }}
      />
      <div style={{ marginTop: 12 }}>
        {renderChildren(null)}
      </div>
    </div>
  );
};

export default CommentsThread;

