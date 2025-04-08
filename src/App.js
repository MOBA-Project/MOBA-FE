import "./App.css";
import Login from "./pages/Login/Login.jsx";
import CreateAccount from "./pages/Login/Account.jsx";
import Main from "./pages/Main/Main.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Menu from "./assets/components/Sidebar/Menu.jsx";
import ImageSlider from "./assets/components/Slider/Slider.jsx";
import Moviespage from "./pages/Movies/Moviespage.jsx";
import Search from "./pages/Search/Search.jsx";
import MyPage from "./pages/myPage/MyPage.jsx";
import MovieDetail from "./assets/components/MovieDetail.jsx";

function App() {
  return (
    <div className="App">
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
          <Route path="/movie/:movieID" element={<MovieDetail />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
