import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addComment, getPost, listComments, toggleLike } from "./api";

const PostDetail: React.FC = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function run() {
      try {
        const p = await getPost(postId as string);
        if (!mounted) return;
        setPost(p);
        const list = await listComments(postId as string);
        if (!mounted) return;
        setComments(list);
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
    } catch (e: any) {
      alert(e?.message || "댓글 작성 실패");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>불러오는 중…</div>;
  if (error || !post)
    return (
      <div style={{ padding: 16, color: "red" }}>
        {error || "게시글이 없습니다."}
      </div>
    );

  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <button onClick={() => navigate(-1)}>&larr; 목록으로</button>
      <div style={{ display: "flex", gap: 16 }}>
        {post.moviePoster ? (
          <img
            src={`https://image.tmdb.org/t/p/w185${post.moviePoster}`}
            alt={post.movieTitle}
            style={{
              width: 120,
              height: 180,
              objectFit: "cover",
              borderRadius: 6,
            }}
          />
        ) : (
          <div
            style={{
              width: 120,
              height: 180,
              background: "#f2f2f2",
              borderRadius: 6,
            }}
          />
        )}
        <div>
          <h2 style={{ margin: "0 0 8px" }}>{post.title}</h2>
          <div style={{ color: "#666", marginBottom: 6 }}>
            영화: {post.movieTitle} · 평점: {post.rating}
          </div>
          <div style={{ color: "#999", fontSize: 13 }}>
            ❤ {post.likes ?? 0} · 💬 {post.commentCount ?? 0}
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={onLike}>좋아요</button>
          </div>
        </div>
      </div>
      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
        {post.content}
      </div>

      <hr />
      <h3>댓글</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          style={{ flex: 1 }}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="댓글을 입력하세요"
        />
        <button disabled={submitting} onClick={onComment}>
          등록
        </button>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {comments.map((c) => {
          const name =
            typeof c?.author?.nickname === "string"
              ? c.author.nickname
              : typeof c?.userId === "object"
              ? c.userId.nickname || c.userId.id || c.userId._id
              : String(c.userId ?? "익명");
          return (
            <div
              key={c._id}
              style={{ border: "1px solid #eee", borderRadius: 6, padding: 10 }}
            >
              <div style={{ fontSize: 13, color: "white", marginBottom: 4 }}>
                {name}
              </div>
              <div style={{ color: "white", fontWeight: "bold" }}>
                {c.content}
              </div>
              {Array.isArray(c.replies) && c.replies.length > 0 && (
                <div
                  style={{
                    marginTop: 8,
                    paddingLeft: 12,
                    borderLeft: "2px solid #f0f0f0",
                    display: "grid",
                    gap: 8,
                  }}
                >
                  {c.replies.map((r: any) => {
                    const rname =
                      typeof r?.author?.nickname === "string"
                        ? r.author.nickname
                        : typeof r?.userId === "object"
                        ? r.userId.nickname || r.userId.id || r.userId._id
                        : String(r.userId ?? "익명");
                    return (
                      <div key={r._id}>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#666",
                            marginBottom: 4,
                          }}
                        >
                          {rname}
                        </div>
                        <div>{r.content}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {comments.length === 0 && (
          <div style={{ color: "#777" }}>첫 댓글을 남겨보세요.</div>
        )}
      </div>
    </div>
  );
};

export default PostDetail;
