import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { Card } from './common/Card';
import { Icon } from './common/Icon';
import { FormField } from './common/FormField';

interface CandidatePortalProps {
  onLogout: () => void;
}

export const CandidatePortal: React.FC<CandidatePortalProps> = ({ onLogout }) => {
  const { addCandidate } = useContext(AppContext);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validatePhone = (phoneNumber: string): boolean => {
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    return indianPhoneRegex.test(phoneNumber);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!validatePhone(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    addCandidate({
      fullName: fullName,
      contact: {
        phone: `+91${phone}`,
        email: '', // No email field in the form
      },
    });
    
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="bg-casino-primary min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <Icon name="check-circle" className="w-16 h-16 text-casino-success mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-casino-gold">Submission Successful!</h2>
          <p className="text-casino-text-muted mt-2 mb-6">
            Thank you for your interest. Our HR team will get in touch with you shortly.
          </p>
          <button
            onClick={onLogout}
            className="w-full bg-casino-gold hover:bg-yellow-600 text-casino-primary font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
          >
            Return to Login
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-casino-primary min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-casino-gold">SmartHire</h1>
          <p className="text-casino-text-muted mt-2">Candidate Registration</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            label="Full Name"
            name="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="Enter your full name"
          />
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-casino-text-muted mb-1">
              Phone Number (India) <span className="text-casino-danger">*</span>
            </label>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-600 bg-casino-secondary text-casino-text-muted text-sm h-11">
                +91
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                placeholder="10-digit mobile number"
                className="w-full bg-casino-secondary border border-gray-600 rounded-r-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-casino-gold text-casino-text h-11"
                maxLength={10}
                pattern="[6-9][0-9]{9}"
              />
            </div>
          </div>

          {error && <p className="text-sm text-casino-danger text-center">{error}</p>}
          
          <div>
            <button type="submit" className="w-full bg-casino-gold hover:bg-yellow-600 text-casino-primary font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors">
              <Icon name="check-circle" className="w-5 h-5 mr-2" />
              Save & Submit
            </button>
          </div>
          <div className="text-center">
             <button type="button" onClick={onLogout} className="text-sm text-casino-text-muted hover:text-casino-gold">
                Cancel
             </button>
          </div>
        </form>
      </Card>
    </div>
  );
};