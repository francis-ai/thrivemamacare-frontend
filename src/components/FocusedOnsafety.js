import React from 'react';
import { ShieldCheck, CreditCard, WarningCircle, ClipboardText } from 'phosphor-react';
import '../assets/css/FocusedOnSafety.css';

const FocusedOnSafety = () => {
  return (
    <section className="focused-on-safety-container py-5">
      <h2 className="section-title text-center mb-5">Focused on Safety</h2>
      <div className="safety-scroll-container">
        <div className="safety-icons-container">
          <div className="safety-card">
            <ShieldCheck size={60} className="safety-icon" />
            <p className="safety-title">Background Checks</p>
          </div>
          <div className="safety-card">
            <CreditCard size={60} className="safety-icon" />
            <p className="safety-title">Identity Verification</p>
          </div>
          <div className="safety-card">
            <WarningCircle size={60} className="safety-icon" />
            <p className="safety-title">Fraud Prevention</p>
          </div>
          <div className="safety-card">
            <ClipboardText size={60} className="safety-icon" />
            <p className="safety-title">Safety Screening</p>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default FocusedOnSafety;
