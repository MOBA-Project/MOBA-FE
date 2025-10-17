import React from 'react';
import { Link } from 'react-router-dom';
import { Col } from 'antd';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { BiDislike } from 'react-icons/bi';
import { IMAGE_BASE_URL } from '../../../config';
import { PersonalRecommendationItem } from '../api';

interface AIMovieCardProps {
  item: PersonalRecommendationItem;
  onLike: (movieId: number) => void;
  onDislike: (movieId: number) => void;
  isLiking?: boolean;
  isDisliking?: boolean;
  isLiked?: boolean;
  isDisliked?: boolean;
  showActions?: boolean;
}

const AIMovieCard: React.FC<AIMovieCardProps> = ({
  item,
  onLike,
  onDislike,
  isLiking = false,
  isDisliking = false,
}) => {
  const posterUrl = item.posterPath
    ? `${IMAGE_BASE_URL}w500${item.posterPath}`
    : null;

  // reasons 파싱 (예: "matchedGenres:2" → "장르 2개 일치")
  const parseReasons = (reasons?: string[]): string[] => {
    if (!reasons || reasons.length === 0) return [];

    const parsed: string[] = [];
    reasons.forEach((reason) => {
      if (reason.startsWith('matchedGenres:')) {
        const count = reason.split(':')[1];
        parsed.push(`장르 ${count}개 일치`);
      } else if (reason.startsWith('vote:')) {
        const vote = parseFloat(reason.split(':')[1]).toFixed(1);
        parsed.push(`평점 ${vote}`);
      } else if (reason.startsWith('popularity:')) {
        parsed.push('인기작');
      } else if (reason.startsWith('recency:')) {
        parsed.push('최신작');
      } else if (reason.startsWith('tfidf:')) {
        parsed.push('콘텐츠 유사');
      } else if (reason.startsWith('sbert:')) {
        parsed.push('AI 추천');
      }
    });

    return parsed.slice(0, 3); // 최대 3개만 표시
  };

  const reasonLabels = parseReasons(item.reasons);

  return (
    <Col lg={6} md={8} xs={24}>
      <div className="aiMovieCard">
        <Link to={`/movie/${item.movieId}`} className="aiMovieCardLink">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={item.title}
              className="aiMovieCardImage"
            />
          ) : (
            <div className="aiMovieCardPlaceholder">이미지 없음</div>
          )}

          {/* 추천 이유 오버레이 */}
          {reasonLabels.length > 0 && (
            <div className="aiMovieCardReasons">
              {reasonLabels.map((label, idx) => (
                <span key={idx} className="reasonBadge">
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* 추천 점수 */}
          <div className="aiMovieCardScore">
            {Math.round(item.score * 100)}% 매칭
          </div>
        </Link>

        {/* 피드백 버튼 */}
        <div className="aiMovieCardActions">
          <button
            className="feedbackButton likeButton"
            onClick={(e) => {
              e.preventDefault();
              onLike(item.movieId);
            }}
            disabled={isLiking || isDisliking}
            title="좋아요"
          >
            {isLiking ? '...' : <AiFillHeart size={20} />}
          </button>
          <button
            className="feedbackButton dislikeButton"
            onClick={(e) => {
              e.preventDefault();
              onDislike(item.movieId);
            }}
            disabled={isLiking || isDisliking}
            title="관심 없음"
          >
            {isDisliking ? '...' : <BiDislike size={20} />}
          </button>
        </div>

        {/* 영화 제목 */}
        <Link to={`/movie/${item.movieId}`} className="aiMovieCardTitle">
          {item.title}
        </Link>
      </div>
    </Col>
  );
};

export default AIMovieCard;
