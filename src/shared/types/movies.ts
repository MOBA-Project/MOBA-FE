export type MovieVideo = {
  id: string;
  key: string;
  site: 'YouTube' | string;
  type?: string;
};

export type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
};

export type MoviesResponse = {
  page: number;
  results: Movie[];
  total_pages?: number;
  total_results?: number;
};

