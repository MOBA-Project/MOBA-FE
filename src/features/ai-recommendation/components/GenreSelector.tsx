import React, { useState } from 'react';
import { GENRE_MAP, GenreKey } from '../api';

interface GenreSelectorProps {
  onSubmit: (selectedGenreIds: number[]) => void;
  initialSelected?: GenreKey[];
  isLoading?: boolean;
}

const GENRE_LABELS: { [key in GenreKey]: string } = {
  action: '액션',
  adventure: '모험',
  animation: '애니메이션',
  comedy: '코미디',
  crime: '범죄',
  documentary: '다큐멘터리',
  drama: '드라마',
  family: '가족',
  fantasy: '판타지',
  history: '역사',
  horror: '공포',
  music: '음악',
  mystery: '미스터리',
  romance: '로맨스',
  'sci-fi': 'SF',
  thriller: '스릴러',
  war: '전쟁',
  western: '서부',
};

const GenreSelector: React.FC<GenreSelectorProps> = ({
  onSubmit,
  initialSelected = [],
  isLoading = false,
}) => {
  const [selected, setSelected] = useState<Set<GenreKey>>(new Set(initialSelected));

  const toggleGenre = (genre: GenreKey) => {
    const newSelected = new Set(selected);
    if (newSelected.has(genre)) {
      newSelected.delete(genre);
    } else {
      newSelected.add(genre);
    }
    setSelected(newSelected);
  };

  const handleSubmit = () => {
    const genreIds = Array.from(selected).map((key) => GENRE_MAP[key]);
    onSubmit(genreIds);
  };

  const genres = Object.keys(GENRE_MAP) as GenreKey[];

  return (
    <div className="genreSelectorContainer">
      <h3 className="genreSelectorTitle">좋아하는 장르를 선택하세요</h3>
      <p className="genreSelectorSubtitle">선택한 장르를 바탕으로 영화를 추천해드립니다</p>

      <div className="genreGrid">
        {genres.map((genre) => (
          <button
            key={genre}
            className={`genreButton ${selected.has(genre) ? 'selected' : ''}`}
            onClick={() => toggleGenre(genre)}
            disabled={isLoading}
          >
            {GENRE_LABELS[genre]}
          </button>
        ))}
      </div>

      <div className="genreActions">
        <button
          className="submitButton"
          onClick={handleSubmit}
          disabled={selected.size === 0 || isLoading}
        >
          {isLoading ? '저장 중...' : `추천 받기 (${selected.size}개 선택)`}
        </button>
      </div>
    </div>
  );
};

export default GenreSelector;
