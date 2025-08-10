import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../assets/css/Hero.css';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const Hero = () => {
  const [banners, setBanners] = useState({
    caption: '',
    tagline: '',
    banner1: '',
    banner2: '',
    banner3: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/get-settings`);
        const data = res.data;

        console.log('API data:', data); // ✅ Inspect this in your browser console

        setBanners({
          caption: data.caption || '',
          tagline: data.tagline || '',
          banner1: data.banner1 || data.banner_1 || '',
          banner2: data.banner2 || data.banner_2 || '',
          banner3: data.banner3 || data.banner_3 || ''
        });
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    fetchSettings();
  }, []);

  const getImageUrl = (filename) =>
    filename ? `${BASE_URL}/uploads/website-settings/${filename}` : '';

  return (
    <section className="hero-section">
      <div className="animated-blob-1"></div>
      <div className="animated-blob-2"></div>
      <div className="hero-content">
        <motion.div
          className="hero-text"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <p className="hero-label">Welcome to ThriveMama</p>
          <h1 className="hero-title">{banners.caption}</h1>
          <p className="hero-description">
            {banners.tagline}
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-left mb-2">Get Started</Link>
            <Link to="/about" className="btn btn-right mb-2">Learn More</Link>
          </div>
        </motion.div>

        <motion.div
          className="hero-images"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2 }}
        >
          {banners.banner1 && (
            <motion.img
              src={getImageUrl(banners.banner1)}
              alt="Banner 1"
              className="hero-img img-main"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5 }}
            />
          )}
          {banners.banner2 && (
            <motion.img
              src={getImageUrl(banners.banner2)}
              alt="Banner 2"
              className="hero-img img-top-left"
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 6 }}
            />
          )}
          {banners.banner3 && (
            <motion.img
              src={getImageUrl(banners.banner3)}
              alt="Banner 3"
              className="hero-img img-top-right"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
            />
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
