import React from "react";
import Slider from "react-slick";
import Background1 from "../../images/Background-img.jpg";
import Background2 from "../../images/Background-img2.jpg";
import Background3 from "../../images/Background-img3.jpg";
import Background4 from "../../images/Background-img4.jpg";
import Background5 from "../../images/Background-img5.jpg";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../Slider/Slider.css";

const ImageSlider = ({ onSlideChange }) => {
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: false,
    beforeChange: (oldIndex, newIndex) => {
      onSlideChange(newIndex); // 부모 컴포넌트에 슬라이드 인덱스 전달
    },
  };

  return (
    <div className="SliderMain">
      <Slider {...sliderSettings}>
        <div>
          <img className="sliderBg" src={Background1} alt="Background 1" />
        </div>
        <div>
          <img className="sliderBg" src={Background2} alt="Background 2" />
        </div>
        <div>
          <img className="sliderBg" src={Background3} alt="Background 3" />
        </div>
        <div>
          <img className="sliderBg" src={Background4} alt="Background 4" />
        </div>
        <div>
          <img className="sliderBg" src={Background5} alt="Background 5" />
        </div>
      </Slider>
    </div>
  );
};

export default ImageSlider;
