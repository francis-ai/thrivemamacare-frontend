import React, { useEffect, useState } from 'react';
import { FaUserShield, FaUsers, FaCalendarAlt, FaHeadset } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Container, Row, Col, Image, Card } from 'react-bootstrap';
import axios from 'axios';
import '../assets/css/About.css';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const About = () => {
  const [story, setStory] = useState(null);
  const [founder, setFounder] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    async function fetchSections() {
      try {
        const [storyRes, founderRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/admin/get-story`),
          axios.get(`${BASE_URL}/api/admin/get-founder`),
        ]);
        if (storyRes.data.length) {
          const s = storyRes.data[0];
          setStory({
            title: s.title,
            content: s.content,
            imageUrl: `${BASE_URL}/uploads/story/${s.story_image}`,
          });
        }
        if (founderRes.data.length) {
          const f = founderRes.data[0];
          setFounder({
            title: f.title,
            content: f.content,
            imageUrl: `${BASE_URL}/uploads/founder/${f.founder_image}`,
          });
        }
      } catch (err) {
        console.error('Error loading content:', err);
      }
    }
    fetchSections();
  }, []);

  return (
    <div className="About-container">
      <div className="hero-section">
        <div className="animated-blob-1"></div>
        <div className="animated-blob-2"></div>
        <h1 className="hero-title">About Us</h1>
      </div>

      <Container className="about-us py-5">
        <Row className="text-center mb-5" data-aos="fade-down">
          <Col><h1 className="section-title">Empowering Families, One Helper at a Time</h1></Col>
        </Row>

        {story && (
          <Row className="mb-5 align-items-center" data-aos="fade-up">
            <Col md={6}>
              <Image src={story.imageUrl} fluid rounded className="shadow" alt="Our Story" />
            </Col>
            <Col md={6}>
              <h3 className="main-heading">{story.title}</h3>
              <p>{story.content}</p>
            </Col>
          </Row>
        )}

        {/* Mission always static */}
        <Row className="mb-5" data-aos="zoom-in">
          <Col>
            <h3 className="text-center">Our Mission</h3>
            <p className="text-center">
              To connect families with trusted, thoroughly vetted caregivers — giving parents peace of mind, and empowering caregivers
              to thrive in meaningful careers.
            </p>
          </Col>
        </Row>

        <Row className="mb-5 text-center" data-aos="fade-up">
          {[
            { icon: FaUserShield, title: 'Vetted Caregivers', desc: 'We lead with empathy in everything we do.' },
            { icon: FaUsers, title: 'Trust & Transparency', desc: 'We build honest, safe relationships with families and caregivers.' },
            { icon: FaCalendarAlt, title: 'Flexible Care Options', desc: 'Flexible options for short-term and long-term care.' },
            { icon: FaHeadset, title: 'Always Here', desc: 'A supportive team you can reach any time.' },
          ].map(({ icon: Icon, title, desc }, idx) => (
            <Col md={3} sm={6} key={idx} className="mb-4">
              <Card className="value-card h-100" data-aos="zoom-in">
                <Card.Body className="text-center">
                  <Icon size={36} className="mb-3 value-icon" />
                  <Card.Title>{title}</Card.Title>
                  <Card.Text>{desc}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {founder && (
          <Row className="mb-5 align-items-center" data-aos="fade-up">
            <Col md={6}>
              <h3 className="main-heading">{founder.title}</h3>
              <p>{founder.content}</p>
            </Col>
            <Col md={6}>
              <Image src={founder.imageUrl} fluid rounded className="shadow founder-image" alt="Founder" />
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default About;
