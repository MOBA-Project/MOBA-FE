import "./App.css";
import Login from "features/auth/Login";
import CreateAccount from "features/auth/Account";
import Main from "pages/Main/Main.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Menu from "shared/components/Sidebar/Menu";
import ImageSlider from "shared/components/Slider/Slider";
import Moviespage from "features/movies/MoviesPage";
import Search from "features/search/Search";
import MyPage from "features/profile/Profile";
import MovieDetail from "features/movies/MovieDetail";
import MyList from "features/mylist/MyList";

const queryClient = new QueryClient();

function App() {
  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/account" element={<CreateAccount />} />
            <Route path="/main" element={<Main />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/slider" element={<ImageSlider />} />
            <Route path="/movies" element={<Moviespage />} />
            <Route path="/search" element={<Search />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/mylist" element={<MyList />} />
            <Route path="/movie/:movieID" element={<MovieDetail />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </div>
  );
}

export default App;
