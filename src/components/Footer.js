import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import axios from 'axios';
import '../assets/css/Footer.css';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const Footer = () => {
  const [contact, setContact] = useState({
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/general/contact-info`);
        setContact(res.data);
      } catch (err) {
        console.error('Failed to fetch contact info:', err);
      }
    };

    fetchContactInfo();
  }, []);

  return (
    <footer className="footer">
      <nav className="footer-nav">
        <ul>
          <li><a href="/about">About Us</a></li>
          <li><a href="/privacy-policy">Privacy Policy</a></li>
          <li><a href="/faq">FAQs</a></li>
          <li><a href="/terms-and-conditions">Terms & Conditions</a></li>
        </ul>
      </nav>
      <hr />

      <div className="footer-top">
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/login">Hire a Helper</Link></li>
            <li><Link to="/login">Become a Helper</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Find Jobs</h3>
          <ul>
            <li>Nanny Jobs</li>
            <li>Hourse Help Jobs</li>
            <li>Part-time Opportunities</li>
            <li>Live-in Roles</li>
          </ul>
        </div>

        <div className="footer-section" style={{ textAlign: 'left' }}>
          <h3>Contact</h3>
          <p>Email: {contact.email || 'loading...'}</p>
          <p>Phone: {contact.phone || 'loading...'}</p>
          {contact.address && <p>Address: {contact.address}</p>}
        </div>

      </div>

      <div className="footer-socials">
        <FaFacebookF />
        <FaTwitter />
        <FaInstagram />
        <FaLinkedinIn />
      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} ThriveMama. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
