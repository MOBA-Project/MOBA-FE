import "./App.css";
import "./index.css";
import Login from "features/auth/Login";
import CreateAccount from "features/auth/Account";
import Main from "pages/Main/Main.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MainLayout from "shared/layouts/MainLayout";
import ImageSlider from "shared/components/Slider/Slider";
import Moviespage from "features/movies/MoviesPage";
import Search from "features/search/Search";
import MyPage from "features/profile/Profile";
import MovieDetail from "features/movies/MovieDetail";
import MyList from "features/mylist/MyList";
import CommunityPage from "features/community/CommunityPage";
import PostDetail from "features/community/PostDetail";
import PostCreate from "features/community/PostCreate";

const queryClient = new QueryClient();

function App() {
  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Auth routes (no layout) */}
            <Route path="/" element={<Login />} />
            <Route path="/account" element={<CreateAccount />} />

            {/* App routes with shared layout (menu + content) */}
            <Route element={<MainLayout />}>
              <Route path="/main" element={<Main />} />
              <Route path="/slider" element={<ImageSlider />} />
              <Route path="/movies" element={<Moviespage />} />
              <Route path="/search" element={<Search />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/mylist" element={<MyList />} />
              <Route path="/movie/:movieID" element={<MovieDetail />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/community/new" element={<PostCreate />} />
              <Route path="/community/posts/:postId" element={<PostDetail />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </div>
  );
}

export default App;
