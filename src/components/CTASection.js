import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/CTASection.css'; 

const CTASection = () => {
  return (
    <section className="cta-section text-center">
      <div className="container">
        <h2 className="cta-title">Find the care you need from<br></br> someone you trust.</h2>
        <div className="cta-buttons">
          <Link to="/register" className="btn btn-left">Post a Job</Link>
          <Link to="/register" className="btn btn-right">Get Hired</Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
