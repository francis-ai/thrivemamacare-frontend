import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/AboutUs.css';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const AboutUs = () => {
  const [about, setAbout] = useState({
    title: '',
    content: '',
    about_image: ''
  });

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/get-about`);
        if (res.data.length > 0) {
          const data = res.data[0];
          setAbout({
            title: data.title,
            content: data.content,
            about_image: data.about_image
          });
        }
      } catch (error) {
        console.error('Error fetching About Us:', error);
      }
    };

    fetchAbout();
  }, []);

  return (
    <section className="about-us-section py-5">
      <div className="container">
        <div className="row align-items-center">
          {/* Left side: image */}
          <div className="col-md-6 image-stack text-center">
            <img
              src={`${BASE_URL}/uploads/about/${about.about_image}`}
              alt="About Us"
              className="img-left mb-4"
              style={{ maxWidth: '100%', height: 'auto', maxHeight: '350px', borderRadius: '8px' }}
            />
          </div>

          {/* Right side: text */}
          <div className="col-md-6 text-section">
            <p className="small-label">A bit</p>
            <h1 className="main-heading">{about.title || 'About Us'}</h1>
            <p className="description">{about.content}</p>
            <Link to="/about" className="about-btn">Learn More</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
