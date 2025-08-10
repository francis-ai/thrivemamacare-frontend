// src/components/BackgroundAnimation.js
import React from 'react';
import '../assets/css/HowItWorks.css';

const HowItWorks = () => {
    return (
      <div className="background-animation-wrapper">
        <div className="background-animation">
          <svg className="animated-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path className="line line1" d="M0,30 C20,50 80,10 100,30" />
            <path className="line line2" d="M0,70 C20,50 80,90 100,70" />
          </svg>
        </div>
  
        <div className="content-overlay container">
            <div className="content-overlay">
                <h2>How It Works</h2>
                <div className="steps-container">
                    <div className="step-box">
                        <div className="step-number">1</div>
                        <div className="step-title">Create an Account</div>
                        <div className="step-description">
                            Sign up and set up your profile as a parent or caregiver.
                        </div>
                    </div>
                    <div className="step-box">
                        <div className="step-number">2</div>
                        <div className="step-title">Search & Connect</div>
                        <div className="step-description">
                            Browse profiles, read reviews, and connect with others.
                        </div>
                    </div>
                    <div className="step-box">
                        <div className="step-number">3</div>
                        <div className="step-title">Hire & Manage</div>
                        <div className="step-description">
                            Schedule, communicate, and manage everything in one place.
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  };

export default HowItWorks;
