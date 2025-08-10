import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import '../assets/css/Privacy.css'; 

const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function Privacy() {
  const [policyData, setPolicyData] = useState([]);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/general/privacy-policy`);
        setPolicyData(res.data);
      } catch (err) {
        console.error('Failed to load privacy policy:', err);
      }
    };

    fetchPolicy();
  }, []);

  return (
    <div className="Privacy-container">
      <div className="hero-section">
        <div className="animated-blob-1"></div>
        <div className="animated-blob-2"></div>
        <h1 className="hero-title">Privacy Policy</h1>
      </div>

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={10}>
            {policyData.length === 0 && (
              <p className="text-muted">Privacy policy is loading or not available.</p>
            )}

            {policyData.map((section) => (
              <div key={section.id} className="mb-5">
                <h3>{section.title}</h3>
                <p>{section.content}</p>

                {section.subtopics && section.subtopics.length > 0 && (
                  <div className="ps-3">
                    {section.subtopics.map((sub) => (
                      <div key={sub.id} className="mb-3">
                        <h5>{sub.title}</h5>
                        <p>{sub.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
