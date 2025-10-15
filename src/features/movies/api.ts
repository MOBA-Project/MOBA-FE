export const fetchMovies = async (page: number, genre: string) => {
  const genreParam = genre ? `&genre=${encodeURIComponent(genre)}` : '';
  const res = await fetch(`http://localhost:5001/movies?page=${page}${genreParam}`);
  if (!res.ok) throw new Error('Failed to fetch movies');
  return res.json();
};

export const fetchMovieDetail = async (id: string | number) => {
  const res = await fetch(`http://localhost:5001/movies/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch movie detail');
  return res.json();
};

export const searchMovies = async (query: string, page = 1) => {
  const res = await fetch(`http://localhost:5001/movies/search?query=${encodeURIComponent(query)}&page=${page}`);
  if (!res.ok) throw new Error('Failed to search movies');
  return res.json();
};

