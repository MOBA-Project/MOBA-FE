import React, { useState, useEffect } from 'react';
import { Row } from 'antd';
import { getCurrentUser } from '../../shared/utils/userData';
import GenreSelector from './components/GenreSelector';
import AIMovieCard from './components/AIMovieCard';
import {
  usePersonalRecommendation,
  useSaveGenres,
  useSendFeedback,
} from './hooks/useAIRecommendation';
import './AIRecommendation.css';

const AIRecommendation: React.FC = () => {
  const [user, setUser] = useState<{ id: string; nick: string } | null>(null);
  const [showGenreSelector, setShowGenreSelector] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState<{
    [key: number]: 'like' | 'dislike' | null;
  }>({});

  // 사용자 정보 로드
  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = await getCurrentUser();
      if (mounted) setUser(u);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const userId = user?.id || null;

  // 개인화 추천 조회
  const {
    data: recommendationData,
    isLoading,
    error,
    refetch,
    isPartial,
    nextRefreshAfter,
  } = usePersonalRecommendation(userId);

  // 장르 저장 Mutation
  const saveGenresMutation = useSaveGenres();

  // 피드백 Mutation
  const sendFeedbackMutation = useSendFeedback();

  // Partial 응답 처리: nextRefreshAfter 초 후 자동 재조회
  useEffect(() => {
    if (isPartial && nextRefreshAfter) {
      const timer = setTimeout(() => {
        refetch();
      }, nextRefreshAfter * 1000);
      return () => clearTimeout(timer);
    }
  }, [isPartial, nextRefreshAfter, refetch]);

  // 장르 저장 핸들러
  const handleGenreSubmit = async (genreIds: number[]) => {
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      await saveGenresMutation.mutateAsync({
        userId,
        favoriteGenres: genreIds,
      });
      setShowGenreSelector(false);
    } catch (err) {
      console.error('장르 저장 실패:', err);
      alert('장르 저장에 실패했습니다.');
    }
  };

  // 좋아요 핸들러
  const handleLike = async (movieId: number) => {
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    setFeedbackLoading((prev) => ({ ...prev, [movieId]: 'like' }));
    try {
      await sendFeedbackMutation.mutateAsync({
        userId,
        movieId,
        label: 1,
        source: 'like',
      });
    } catch (err) {
      console.error('좋아요 실패:', err);
    } finally {
      setFeedbackLoading((prev) => ({ ...prev, [movieId]: null }));
    }
  };

  // 싫어요 핸들러
  const handleDislike = async (movieId: number) => {
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    setFeedbackLoading((prev) => ({ ...prev, [movieId]: 'dislike' }));
    try {
      await sendFeedbackMutation.mutateAsync({
        userId,
        movieId,
        label: 0,
        source: 'skip',
      });
    } catch (err) {
      console.error('싫어요 실패:', err);
    } finally {
      setFeedbackLoading((prev) => ({ ...prev, [movieId]: null }));
    }
  };

  // 로그인 체크
  if (!user) {
    return (
      <div className="aiRecoContainer">
        <div className="aiRecoContent">
          <div className="emptyState">
            <h2>로그인이 필요합니다</h2>
            <p>AI 영화 추천을 받으려면 로그인해주세요.</p>
          </div>
        </div>
      </div>
    );
  }

  // 장르 선택 모드
  if (showGenreSelector) {
    return (
      <div className="aiRecoContainer">
        <div className="aiRecoContent">
          <GenreSelector
            onSubmit={handleGenreSubmit}
            isLoading={saveGenresMutation.isPending}
          />
        </div>
      </div>
    );
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div className="aiRecoContainer">
        <div className="aiRecoContent">
          <div className="loadingState">
            <div className="loadingSpinner"></div>
            <p>AI가 당신의 취향을 분석하고 있습니다...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="aiRecoContainer">
        <div className="aiRecoContent">
          <div className="errorState">
            <h2>추천을 불러오지 못했습니다</h2>
            <p>장르를 선택하여 추천을 시작하세요.</p>
            <button
              className="primaryButton"
              onClick={() => setShowGenreSelector(true)}
            >
              장르 선택하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const items = recommendationData?.items || [];

  return (
    <div className="aiRecoContainer">
      <div className="aiRecoContent">
        {/* 헤더 */}
        <div className="aiRecoHeader">
          <div>
            <h1 className="aiRecoTitle">AI 영화 추천</h1>
            <p className="aiRecoSubtitle">
              당신의 취향을 학습하여 완벽한 영화를 추천합니다
            </p>
          </div>
          <button
            className="secondaryButton"
            onClick={() => setShowGenreSelector(true)}
          >
            장르 변경
          </button>
        </div>

        {/* Partial 응답 토스트 */}
        {isPartial && (
          <div className="partialToast">
            <div className="toastSpinner"></div>
            <span>더 나은 추천을 준비하고 있습니다...</span>
          </div>
        )}

        {/* 추천 리스트 */}
        {items.length === 0 ? (
          <div className="emptyState">
            <h2>추천 영화가 없습니다</h2>
            <p>장르를 선택하거나 영화에 피드백을 남겨보세요.</p>
            <button
              className="primaryButton"
              onClick={() => setShowGenreSelector(true)}
            >
              장르 선택하기
            </button>
          </div>
        ) : (
          <>
            <div className="resultsInfo">
              총 <strong>{items.length}개</strong>의 추천 영화
            </div>
            <Row gutter={[32, 32]}>
              {items.map((item) => (
                <AIMovieCard
                  key={item.movieId}
                  item={item}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  isLiking={feedbackLoading[item.movieId] === 'like'}
                  isDisliking={feedbackLoading[item.movieId] === 'dislike'}
                />
              ))}
            </Row>
          </>
        )}
      </div>
    </div>
  );
};

export default AIRecommendation;
