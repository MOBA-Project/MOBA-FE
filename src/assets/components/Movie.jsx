import React from "react";
import { Col } from "antd";
import { Link } from "react-router-dom";

function Movie({ image, key, movieID, movieName }) {
  return (
    <Col lg={6} md={8} xs={24}>
      <div style={{ position: "relative" }}>
        <Link to={`/movie/${movieID}`}>
          {image ? (
            <img
              style={{ width: "100%", height: "400px" }}
              src={image}
              alt={movieName}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "400px",
                backgroundColor: "#e0e0e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              이미지가 없습니다.
            </div>
          )}
        </Link>
      </div>
    </Col>
  );
}

export default Movie;
