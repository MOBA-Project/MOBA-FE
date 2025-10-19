import React, { useState, useEffect } from 'react';
import { Row } from 'antd';
import { getCurrentUser } from '../../shared/utils/userData';
import GenreSelector from './components/GenreSelector';
import AIMovieCard from './components/AIMovieCard';
import { useCandidates } from './hooks/useAIRecommendation';
import { previewRecommendations, commitPreferences, PersonalRecommendationItem, getPersonalRecommendation, getJobStatus } from './api';
import './AIRecommendation.css';

type Step = 'genre' | 'feedback' | 'preview' | 'confirmed' | 'final';

const AIRecommendation: React.FC = () => {
  const [user, setUser] = useState<{ id: string; nick: string } | null>(null);
  const [step, setStep] = useState<Step>('genre');

  // 선택한 장르
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

  // 로컬 피드백 (좋아요/싫어요)
  const [likes, setLikes] = useState<number[]>([]);
  const [dislikes, setDislikes] = useState<number[]>([]);

  // 미리보기/확정 결과
  const [previewResults, setPreviewResults] = useState<PersonalRecommendationItem[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isCommitLoading, setIsCommitLoading] = useState(false);
  const [isPartial, setIsPartial] = useState(false);

  // 최종 추천 결과
  const [finalResults, setFinalResults] = useState<PersonalRecommendationItem[]>([]);
  const [isFinalLoading, setIsFinalLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

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

  // 장르 기반 후보 영화 조회 (피드백 단계에서 사용)
  const {
    data: candidatesData,
    isLoading: isCandidatesLoading,
  } = useCandidates(selectedGenres, 1, 20);

  const candidates = candidatesData?.items || [];

  // 1단계: 장르 선택 완료
  const handleGenreSubmit = (genreIds: number[]) => {
    setSelectedGenres(genreIds);
    setStep('feedback');
    setLikes([]);
    setDislikes([]);
  };

  // 2단계: 후보 영화에서 좋아요
  const handleCandidateLike = (movieId: number) => {
    setLikes((prev) => {
      if (prev.includes(movieId)) return prev.filter((id) => id !== movieId);
      return [...prev, movieId];
    });
    setDislikes((prev) => prev.filter((id) => id !== movieId));
  };

  // 2단계: 후보 영화에서 싫어요
  const handleCandidateDislike = (movieId: number) => {
    setDislikes((prev) => {
      if (prev.includes(movieId)) return prev.filter((id) => id !== movieId);
      return [...prev, movieId];
    });
    setLikes((prev) => prev.filter((id) => id !== movieId));
  };

  // 3단계: 미리보기 호출
  const handlePreview = async () => {
    setIsPreviewLoading(true);
    try {
      const response = await previewRecommendations({
        favoriteGenres: selectedGenres,
        likes,
        dislikes,
        size: 20,
      });
      setPreviewResults(response.items);
      setIsPartial(response.meta.partial);
      setStep('preview');
    } catch (err) {
      console.error('미리보기 실패:', err);
      alert('미리보기를 불러오지 못했습니다.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // 4단계: 확정 (commit)
  const handleCommit = async () => {
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    setIsCommitLoading(true);
    try {
      const response = await commitPreferences({
        userId,
        favoriteGenres: selectedGenres,
        likes,
        dislikes,
      });

      // 백그라운드 작업 ID가 있으면 저장
      setStep('confirmed');
    } catch (err) {
      console.error('확정 실패:', err);
      alert('저장에 실패했습니다.');
    } finally {
      setIsCommitLoading(false);
    }
  };

  // confirmed 단계에서 자동으로 최종 추천 가져오기
  useEffect(() => {
    if (step === 'confirmed' && userId) {
      const fetchFinalRecommendations = async () => {
        setIsFinalLoading(true);

        // 백그라운드 분석을 위해 약간의 지연 추가 (3초)
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
          const response = await getPersonalRecommendation(userId, 20);
          setFinalResults(response.items);
          setIsPartial(response.meta.partial);

          // jobId가 있으면 폴링 시작
          if (response.meta.jobId) {
            setJobId(response.meta.jobId);
          } else {
            // jobId가 없으면 바로 final 단계로
            setStep('final');
          }
        } catch (err) {
          console.error('최종 추천 조회 실패:', err);
          alert('추천 영화를 불러오지 못했습니다.');
        } finally {
          setIsFinalLoading(false);
        }
      };

      fetchFinalRecommendations();
    }
  }, [step, userId]);

  // Job 상태 폴링
  useEffect(() => {
    if (!jobId || step !== 'confirmed') return;

    const pollInterval = setInterval(async () => {
      try {
        const status = await getJobStatus(jobId);

        if (status.status === 'completed') {
          // Job 완료되면 최종 추천 다시 가져오기
          if (userId) {
            const response = await getPersonalRecommendation(userId, 20);
            setFinalResults(response.items);
            setIsPartial(false);
            setStep('final');
          }
          clearInterval(pollInterval);
        } else if (status.status === 'failed') {
          // Job 실패해도 기존 결과로 진행
          setStep('final');
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Job 상태 확인 실패:', err);
      }
    }, 2000); // 2초마다 확인

    // 30초 후 타임아웃
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      setStep('final');
    }, 30000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [jobId, step, userId]);

  // 미리보기에서 다시 피드백 단계로
  const handleBackToFeedback = () => {
    setStep('feedback');
  };

  // 처음부터 다시
  const handleReset = () => {
    setStep('genre');
    setSelectedGenres([]);
    setLikes([]);
    setDislikes([]);
    setPreviewResults([]);
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

  // 1단계: 장르 선택
  if (step === 'genre') {
    return (
      <div className="aiRecoContainer">
        <div className="aiRecoContent">
          <div className="aiRecoHeader">
            <h1 className="aiRecoTitle">AI 영화 추천</h1>
            <p className="aiRecoSubtitle">
              장르 선택 → 샘플 평가 → 맞춤 추천 흐름으로 진행됩니다
            </p>
          </div>
          <GenreSelector onSubmit={handleGenreSubmit} isLoading={false} />
        </div>
      </div>
    );
  }

  // 2단계: 피드백 수집
  if (step === 'feedback') {
    return (
      <div className="aiRecoContainer">
        <div className="aiRecoContent">
          <div className="aiRecoHeader">
            <div>
              <h1 className="aiRecoTitle">샘플 영화 평가</h1>
              <p className="aiRecoSubtitle">
                마음에 드는 영화는 좋아요, 관심 없는 영화는 싫어요를 눌러주세요.
                <br />
                평가 완료 후 하단의 '추천 미리보기' 버튼을 눌러주세요!
              </p>
            </div>
            <button className="secondaryButton" onClick={handleReset}>
              처음부터
            </button>
          </div>

          <div className="feedbackStats">
            <span className="statBadge like">좋아요 {likes.length}개</span>
            <span className="statBadge dislike">싫어요 {dislikes.length}개</span>
          </div>

          {isCandidatesLoading ? (
            <div className="loadingState">
              <div className="loadingSpinner"></div>
              <p>샘플 영화를 불러오는 중...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="emptyState">
              <h2>샘플 영화가 없습니다</h2>
              <p>다른 장르를 선택해보세요.</p>
              <button className="primaryButton" onClick={handleReset}>
                장르 다시 선택
              </button>
            </div>
          ) : (
            <>
              <Row gutter={[32, 32]}>
                {candidates.map((movie) => {
                  const isLiked = likes.includes(movie.id);
                  const isDisliked = dislikes.includes(movie.id);
                  const item: PersonalRecommendationItem = {
                    movieId: movie.id,
                    title: movie.title,
                    posterPath: movie.poster_path,
                    score: 0,
                  };
                  return (
                    <AIMovieCard
                      key={movie.id}
                      item={item}
                      onLike={handleCandidateLike}
                      onDislike={handleCandidateDislike}
                      isLiked={isLiked}
                      isDisliked={isDisliked}
                    />
                  );
                })}
              </Row>

              <div className="actionButtons">
                <button
                  className="primaryButton large"
                  onClick={handlePreview}
                  disabled={isPreviewLoading || (likes.length === 0 && dislikes.length === 0)}
                >
                  {isPreviewLoading ? '분석 중...' : '추천 미리보기'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // 3단계: 미리보기 결과
  if (step === 'preview') {
    return (
      <div className="aiRecoContainer">
        <div className="aiRecoContent">
          <div className="aiRecoHeader">
            <div>
              <h1 className="aiRecoTitle">추천 미리보기</h1>
              <p className="aiRecoSubtitle">
                아래 추천 결과가 마음에 드시면 확정 버튼을 눌러주세요
              </p>
            </div>
            <button className="secondaryButton" onClick={handleBackToFeedback}>
              피드백 수정
            </button>
          </div>

          {isPartial && (
            <div className="partialToast">
              <div className="toastSpinner"></div>
              <span>일부 영화 정보를 가져오는 중입니다...</span>
            </div>
          )}

          {previewResults.length === 0 ? (
            <div className="emptyState">
              <h2>추천 결과가 없습니다</h2>
              <p>피드백을 조정해보세요.</p>
              <button className="primaryButton" onClick={handleBackToFeedback}>
                피드백 수정
              </button>
            </div>
          ) : (
            <>
              <div className="resultsInfo">
                총 <strong>{previewResults.length}개</strong>의 추천 영화
              </div>
              <Row gutter={[32, 32]}>
                {previewResults.map((item) => (
                  <AIMovieCard
                    key={item.movieId}
                    item={item}
                    onLike={() => {}}
                    onDislike={() => {}}
                    showActions={false}
                  />
                ))}
              </Row>

              <div className="actionButtons">
                <button
                  className="primaryButton large"
                  onClick={handleCommit}
                  disabled={isCommitLoading}
                >
                  {isCommitLoading ? '저장 중...' : '이 추천으로 확정하기'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // 4단계: 확정 완료 (분석 중)
  if (step === 'confirmed') {
    return (
      <div className="aiRecoContainer">
        <div className="aiRecoContent">
          <div className="successState">
            <div className="successIcon">✓</div>
            <h2>취향 저장 완료!</h2>
            <p>이제 AI가 당신의 취향을 학습하여 더 나은 추천을 제공합니다.</p>
            <p className="successNote">
              백그라운드에서 영화 분석이 진행 중입니다. 잠시 후 더 정확한 추천을 받을 수 있습니다.
            </p>
            {isFinalLoading && (
              <div className="loadingState">
                <div className="loadingSpinner"></div>
                <p>개인화 추천을 생성하는 중...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 5단계: 최종 추천 결과
  if (step === 'final') {
    return (
      <div className="aiRecoContainer">
        <div className="aiRecoContent">
          <div className="aiRecoHeader">
            <div>
              <h1 className="aiRecoTitle">AI 개인화 추천</h1>
              <p className="aiRecoSubtitle">
                당신의 취향을 바탕으로 선별된 맞춤 영화 추천입니다
              </p>
            </div>
            <button className="secondaryButton" onClick={handleReset}>
              추천 다시 받기
            </button>
          </div>

          {isPartial && (
            <div className="partialToast">
              <div className="toastSpinner"></div>
              <span>더 정확한 추천을 위해 분석이 진행 중입니다...</span>
            </div>
          )}

          {finalResults.length === 0 ? (
            <div className="emptyState">
              <h2>추천 결과가 없습니다</h2>
              <p>다시 시도해주세요.</p>
              <button className="primaryButton" onClick={handleReset}>
                처음부터 다시
              </button>
            </div>
          ) : (
            <>
              <div className="resultsInfo">
                총 <strong>{finalResults.length}개</strong>의 맞춤 추천 영화
              </div>
              <Row gutter={[32, 32]}>
                {finalResults.map((item) => (
                  <AIMovieCard
                    key={item.movieId}
                    item={item}
                    onLike={() => {}}
                    onDislike={() => {}}
                    showActions={false}
                  />
                ))}
              </Row>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default AIRecommendation;
