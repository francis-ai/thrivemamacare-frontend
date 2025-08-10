import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import AOS from 'aos';
import { Link } from 'react-router-dom';
import axios from 'axios';
import 'aos/dist/aos.css';
import '../assets/css/TermsAndConditions.css';
import { Typography } from '@mui/material';

const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function TermsAndConditions() {
  const [terms, setTerms] = useState([]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/general/terms`);
      setTerms(res.data);
    } catch (err) {
      console.error('Failed to load terms:', err);
    }
  };

  return (
    <div className="Terms-container">
      <div className="hero-section">
        <div className="animated-blob-1"></div>
        <div className="animated-blob-2"></div>
        <h1 className="hero-title">Terms & Conditions</h1>
      </div>

      <Container className="py-5">
        <Row className="justify-content-center" data-aos="fade-up">
          <Col md={10}>
            <h2 className="mb-4">Welcome to ThrivemamaCare</h2>
            <p>By using our platform, you agree to the following terms and conditions. Please read them carefully.</p>

            {/* Loop through terms */}
            {terms.map((term) => (
              <div key={term.id} className="mt-5">
                <h4>{term.title}</h4>
                <p>{term.content}</p>

                {/* Subtopics */}
                {term.subtopics?.map((sub) => (
                  <div key={sub.id} className="ps-3 mb-3">
                    <h6 className="fw-semibold">{sub.sub_number}</h6>
                    <p>{sub.content}</p>

                    {/* Subpoints */}
                    {sub.subpoints?.length > 0 && (
                      <ul className="ps-4">
                        {sub.subpoints.map((point) => (
                          <li key={point.id}>{point.point}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ))}

            <p className="mt-5 text-muted">
              Last updated: {terms.length > 0 ? new Date(terms[0].created_at || Date.now()).toLocaleDateString() : '—'}
            </p>
          </Col>
        </Row>
        <Typography
        component={Link}
        to="/helper-terms"
        sx={{
          textDecoration: 'none',
          p: 1,
          mt: '20px',
          border: '1px solid grey',
          borderRadius: 4
          }}>
          Helper Terms and Condition
        </Typography>
      </Container>
    </div>
  );
}
