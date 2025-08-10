import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import AOS from 'aos';
import axios from 'axios';
import 'aos/dist/aos.css';
import '../assets/css/WaitingList.css';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const WaitingList = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(false);
    setError('');

    try {
      await axios.post(`${BASE_URL}/api/waitlist`, formData); // Change port if different
      setSubmitted(true);
      setFormData({ name: '', email: '' });
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="WaitingList-container">
      <div className="hero-section">
        <div className="animated-blob-1"></div>
        <div className="animated-blob-2"></div>
        <h1 className="hero-title">Join Our Waiting List</h1>
      </div>

      <Container className="my-5">
        <Row className="justify-content-center" data-aos="fade-up">
          <Col md={8} lg={6}>
            <h3 className="text-center mb-4">We’re currently at capacity</h3>
            <p className="text-muted text-center">
              Thank you for your interest in ThrivemamaCare. Please fill out the form below to be added to our waiting list. We’ll notify you as soon as a spot opens up!
            </p>

            {submitted && (
              <Alert variant="success" className="text-center mt-3">
                You've been added to the waiting list. We'll contact you soon!
              </Alert>
            )}

            {error && (
              <Alert variant="danger" className="text-center mt-3">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit} className="mt-4 shadow p-4 rounded bg-light">
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <div className="d-grid">
                <Button className="waiting-list-submit-btn" type="submit">
                  Join Waiting List
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default WaitingList;