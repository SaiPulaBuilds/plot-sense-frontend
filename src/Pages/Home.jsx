import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">

      <nav className="navbar">
        <h2 className="logo">PlotSense</h2>
        <button className="nav-btn" onClick={() => navigate("/map")}>
          Open Map
        </button>
      </nav>

      <div className="hero">

        <div className="hero-left">
          <h1>Smart Land Plot Analysis</h1>
          <p>
            PlotSense helps you explore land plots, analyze locations,
            and make smarter real estate decisions using interactive maps.
          </p>

          <button
            className="cta-btn"
            onClick={() => navigate("/map")}
          >
            Explore Map
          </button>
        </div>

        <div className="hero-right">
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b"
            alt="map preview"
          />
        </div>

      </div>

      <div className="features">

        <div className="feature-card">
          <h3>📍 Location Insights</h3>
          <p>Analyze nearby infrastructure, connectivity and development.</p>
        </div>

        <div className="feature-card">
          <h3>🗺 Interactive Map</h3>
          <p>Explore land plots with an intuitive and responsive map.</p>
        </div>

        <div className="feature-card">
          <h3>📊 Smart Analytics</h3>
          <p>Understand land potential with intelligent data insights.</p>
        </div>

      </div>

    </div>
  );
};

export default Home;