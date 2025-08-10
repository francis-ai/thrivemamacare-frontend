import React, { useState, useEffect } from 'react';
import { Carousel } from 'react-bootstrap';
import axios from 'axios';
import '../assets/css/Testimonials.css';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const Testimonials = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchApprovedReviews();
  }, []);

  const fetchApprovedReviews = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/approved-reviews`);
      setReviews(res.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const getImageUrl = (userType, image) => {
    if (!image) return '/default-avatar.jpg';
    const base =
      userType === 'user'
        ? `${BASE_URL}/uploads/users/`
        : `${BASE_URL}/uploads/caregivers/`;
    return `${base}${image}`;
  };

  return (
    <section className="testimonials-container py-5">
      <h2 className="section-title text-center mb-5">What Our Clients Say</h2>

      {isMobile ? (
        <Carousel indicators={false} controls={true} interval={3000} fade>
          {reviews.map((review) => (
            <Carousel.Item key={review.id}>
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <div className="testimonial-header">
                    <img
                      src={getImageUrl(review.user_type, review.profile_image)}
                      alt="client"
                      className="testimonial-img"
                    />
                    <div className="testimonial-info">
                      <h5 className="testimonial-name">{review.name}</h5>
                      <p className="testimonial-title">{review.user_type}</p>
                    </div>
                  </div>
                  <p className="testimonial-text">"{review.review}"</p>
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      ) : (
        <div className="testimonials-grid">
          {reviews.map((review) => (
            <div className="testimonial-card" key={review.id}>
              <div className="testimonial-content">
                <div className="testimonial-header">
                  <img
                    src={getImageUrl(review.user_type, review.profile_image)}
                    alt="client"
                    className="testimonial-img"
                  />
                  <div className="testimonial-info">
                    <h5 className="testimonial-name">{review.name}</h5>
                    <p className="testimonial-title">{review.user_type}</p>
                  </div>
                </div>
                <p className="testimonial-text">"{review.review}"</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Testimonials;
