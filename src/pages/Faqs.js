import React, { useEffect, useState } from 'react';
import { Accordion, Container, Row, Col } from 'react-bootstrap';
import AOS from 'aos';
import axios from 'axios';
import 'aos/dist/aos.css';
import '../assets/css/Faqs.css';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const Faqs = () => {
    const [faqs, setFaqs] = useState([]);

    useEffect(() => {
        AOS.init({ duration: 800, once: true });

        const fetchFaqs = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/general/faqs`);
                setFaqs(res.data);
            } catch (err) {
                console.error('Failed to fetch FAQs:', err);
            }
        };

        fetchFaqs();
    }, []);

    return (
        <div className="Faqs-container">
            <div className="hero-section">
                <div className="animated-blob-1"></div>
                <div className="animated-blob-2"></div>
                <h1 className="hero-title">FAQs</h1>
            </div>

            <Container className="py-5">
                <Row className="justify-content-center mb-4" data-aos="fade-down">
                    <Col md={8} className="text-center">
                        <h2>Frequently Asked Questions</h2>
                        <p className="text-muted">Got questions? We’ve got answers.</p>
                    </Col>
                </Row>

                <Row>
                    <Col md={10} className="mx-auto" data-aos="fade-up">
                        <Accordion defaultActiveKey="0">
                            {faqs.length === 0 ? (
                                <p className="text-muted">No FAQs available at the moment.</p>
                            ) : (
                                faqs.map((faq, index) => (
                                    <Accordion.Item eventKey={index.toString()} key={faq.id}>
                                        <Accordion.Header>{faq.question}</Accordion.Header>
                                        <Accordion.Body>{faq.answer}</Accordion.Body>
                                    </Accordion.Item>
                                ))
                            )}
                        </Accordion>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Faqs;
