import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addComment, getPost, listComments, toggleLike, updatePost, deletePost, updateComment, deleteComment } from "./api";
import { getCurrentUser } from "shared/utils/userData";
import { getUserPublic } from "shared/api/users";
import { BiArrowBack, BiSubdirectoryRight } from "react-icons/bi";
import { AiOutlineHeart, AiOutlineUser, AiOutlineEdit, AiOutlineDelete, AiOutlineComment } from "react-icons/ai";
import "./PostDetail.css";

const PostDetail: React.FC = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<{ id: string; nick?: string } | null>(null);
  const [authorName, setAuthorName] = useState<string>("");
  const [selfAltId, setSelfAltId] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(5);
  const ownerIdFromPost = React.useMemo(() => {
    const uid: any = (post as any)?.userId;
    if (uid && typeof uid === 'object') return uid.id || uid._id || String(uid);
    if (uid) return String(uid);
    return '';
  }, [post]);

  useEffect(() => {
    let mounted = true;
    async function run() {
      try {
        const p = await getPost(postId as string);
        if (!mounted) return;
        setPost(p);
        setEditTitle(p.title);
        setEditContent(p.content);
        setEditRating(p.rating || 5);
        const list = await listComments(postId as string);
        if (!mounted) return;
        setComments(list);
        // derive author name safely
        try {
          const uid: any = (p as any).userId;
          const ownerId = uid && typeof uid === 'object' ? (uid.id || uid._id || String(uid)) : (uid ? String(uid) : '');
          if ((p as any)?.author && typeof (p as any).author.nickname === 'string') setAuthorName((p as any).author.nickname);
          else if (uid && typeof uid === 'object' && typeof uid.nickname === 'string') setAuthorName(uid.nickname);
          else if (ownerId) {
            const u = await getUserPublic(ownerId);
            if (u?.nickname || (u as any)?.nick) setAuthorName(u.nickname || (u as any).nick);
            else setAuthorName(ownerId);
          }
        } catch {}
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "게시글을 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (postId) run();
    return () => {
      mounted = false;
    };
  }, [postId]);

  useEffect(() => {
    (async () => {
      try {
        const u = await getCurrentUser();
        setUser(u);
        if (u?.id) {
          try {
            const me = await getUserPublic(u.id);
            if (me && (me as any)._id) setSelfAltId(String((me as any)._id));
          } catch {}
        }
      } catch {}
    })();
  }, []);

  const onLike = async () => {
    if (!post) return;
    try {
      const p = await toggleLike(post._id);
      setPost(p);
    } catch {}
  };

  const onComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await addComment({
        postId: postId as string,
        content: commentText.trim(),
      });
      setCommentText("");
      const list = await listComments(postId as string);
      setComments(list);
      setPost((prev: any) => (prev ? { ...prev, commentCount: Array.isArray(list) ? list.length : prev.commentCount } : prev));
    } catch (e: any) {
      alert(e?.message || "댓글 작성 실패");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loadingState">불러오는 중…</div>;
  if (error || !post)
    return <div className="errorState">{error || "게시글이 없습니다."}</div>;

  return (
    <div className="postDetailContainer">
      <div className="postDetailContent">
        <button
          className="backButton"
          onClick={() => {
            navigate('/community', {
              state: post ? { updatedPost: { id: post._id, commentCount: post.commentCount ?? 0, likes: post.likes ?? 0 } } : undefined,
            });
          }}
        >
          <BiArrowBack size={18} /> 목록으로
        </button>

        <div className="postHeader">
          {post.moviePoster ? (
            <img
              src={`https://image.tmdb.org/t/p/w185${post.moviePoster}`}
              alt={post.movieTitle}
              className="postMoviePoster"
            />
          ) : (
            <div className="postPosterPlaceholder">🎬</div>
          )}
          <div className="postHeaderInfo">
            <h2 className="postTitle">{post.title}</h2>
            <div className="postMovieInfo">
              영화: {post.movieTitle}
              <span className="postRating">⭐ {post.rating}</span>
            </div>
            <div className="postAuthor">작성자: {authorName || '익명'}</div>
            <div className="postStats">
              <span><AiOutlineHeart /> {post.likes ?? 0}</span>
              <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                <AiOutlineComment /> {post.commentCount ?? 0}
              </span>
            </div>
            <div className="postActions">
              <button className="likeButton" onClick={onLike}>
                <AiOutlineHeart /> 좋아요
              </button>
              {user && ownerIdFromPost && (
                String(user.id) === String(ownerIdFromPost) ||
                (selfAltId && String(selfAltId) === String(ownerIdFromPost)) ||
                (!!authorName && !!user.nick && user.nick === authorName)
              ) && (
                <>
                  <button className="editButton" onClick={() => setEditing((v)=>!v)}>
                    <AiOutlineEdit /> {editing ? '수정 취소' : '수정'}
                  </button>
                  <button
                    className="deleteButton"
                    onClick={async ()=>{
                      if (window.confirm('게시글을 삭제할까요?')){
                        try { await deletePost(post._id); navigate('/community'); } catch(e) { alert('삭제 실패'); }
                      }
                    }}
                  >
                    <AiOutlineDelete /> 삭제
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {!editing ? (
          <div className="postContent">{post.content}</div>
        ) : (
          <div style={{ marginTop: 12 }}>
            <div className="formSection">
              <label className="formLabel">제목</label>
              <input className="textInput" value={editTitle} onChange={(e)=>setEditTitle(e.target.value)} />
            </div>
            <div className="formSection">
              <label className="formLabel">평점 (1-5)</label>
              <div className="ratingInput">
                <input type="number" min={1} max={5} value={editRating} onChange={(e)=>setEditRating(Number(e.target.value))} />
              </div>
            </div>
            <div className="formSection">
              <label className="formLabel">본문</label>
              <textarea className="textArea" value={editContent} onChange={(e)=>setEditContent(e.target.value)} rows={8} />
            </div>
            <div className="formActions">
              <button
                className="submitBtn"
                onClick={async ()=>{
                  try {
                    const updated = await updatePost(post._id, { title: editTitle, content: editContent, rating: Math.max(1, Math.min(5, Number(editRating))) || 5 });
                    setPost(updated);
                    setEditing(false);
                  } catch(e) { alert('수정 실패'); }
                }}
              >수정 완료</button>
              <button className="cancelBtn" onClick={()=>{ setEditing(false); setEditTitle(post.title); setEditContent(post.content); setEditRating(post.rating); }}>취소</button>
            </div>
          </div>
        )}

        <div className="postDivider" />

        <div className="commentsSection">
          <h3 className="commentsTitle">댓글 {comments.length}</h3>
          <div className="commentInput">
            <input
              className="commentInputField"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 입력하세요"
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onComment();
                }
              }}
            />
            <button
              className="commentSubmitButton"
              disabled={submitting}
              onClick={onComment}
            >
              등록
            </button>
          </div>

          <div className="commentsList">
            {comments.map((c) => {
              const name =
                typeof c?.author?.nickname === "string"
                  ? c.author.nickname
                  : typeof c?.userId === "object"
                  ? c.userId.nickname || c.userId.id || c.userId._id
                  : String(c.userId ?? "익명");
              const ownerId = typeof c?.userId === 'object' ? (c.userId?.id || c.userId?._id || String(c.userId)) : String(c.userId);
              return (
                <div key={c._id} className="commentItem">
                  <div className="commentAuthor"><AiOutlineUser style={{ marginRight:6 }} />{name}</div>
                  <div className="commentContent">{c.content}</div>
                  {user && String(user.id) === String(ownerId) && (
                    <div className="commentBtns" style={{ marginTop: 6 }}>
                      <button className="commentActionBtn" onClick={async ()=>{
                        const next = window.prompt('댓글 내용을 수정하세요', c.content);
                        if (next && next.trim()) {
                          try { await updateComment(c._id, next.trim()); const list = await listComments(postId as string); setComments(list); } catch(e) { alert('수정 실패'); }
                        }
                      }}><AiOutlineEdit /> 수정</button>
                      <button className="commentActionBtn" onClick={async ()=>{
                        if (window.confirm('댓글을 삭제할까요?')){
                          try { await deleteComment(c._id); const list = await listComments(postId as string); setComments(list); } catch(e) { alert('삭제 실패'); }
                        }
                      }}><AiOutlineDelete /> 삭제</button>
                    </div>
                  )}
                  {Array.isArray(c.replies) && c.replies.length > 0 && (
                    <div className="commentReplies">
                      {c.replies.map((r: any) => {
                        const rname =
                          typeof r?.author?.nickname === "string"
                            ? r.author.nickname
                            : typeof r?.userId === "object"
                            ? r.userId.nickname || r.userId.id || r.userId._id
                            : String(r.userId ?? "익명");
                        const rowner = typeof r?.userId === 'object' ? (r.userId?.id || r.userId?._id || String(r.userId)) : String(r.userId);
                        return (
                          <div key={r._id} className="replyItem">
                            <div className="replyAuthor"><BiSubdirectoryRight style={{ marginRight:6 }} />{rname}</div>
                            <div className="replyContent">{r.content}</div>
                            {user && String(user.id) === String(rowner) && (
                              <div className="commentBtns" style={{ marginTop: 6 }}>
                                <button className="commentActionBtn" onClick={async ()=>{
                                  const next = window.prompt('댓글 내용을 수정하세요', r.content);
                                  if (next && next.trim()) {
                                    try { await updateComment(r._id, next.trim()); const list = await listComments(postId as string); setComments(list); } catch(e) { alert('수정 실패'); }
                                  }
                                }}><AiOutlineEdit /> 수정</button>
                                <button className="commentActionBtn" onClick={async ()=>{
                                  if (window.confirm('댓글을 삭제할까요?')){
                                    try { await deleteComment(r._id); const list = await listComments(postId as string); setComments(list); } catch(e) { alert('삭제 실패'); }
                                  }
                                }}><AiOutlineDelete /> 삭제</button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            {comments.length === 0 && (
              <div className="emptyComments">첫 댓글을 남겨보세요 💭</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
