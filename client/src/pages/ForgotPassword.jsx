import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../api/axios';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setIsSuccess(true);
        } catch (err) {
            // Don't reveal if email exists or not for security
            setIsSuccess(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Left Side - Branding */}
            <div className="auth-brand">
                <div className="brand-content">
                    <div className="brand-logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </div>
                    <h1 className="brand-title">Shiv Furniture</h1>
                    <p className="brand-tagline">Budget Accounting & ERP System</p>

                    <div className="brand-help">
                        <h3>Need Help?</h3>
                        <p>If you're having trouble accessing your account, our support team is here to help.</p>
                        <ul>
                            <li>Check your spam folder for reset emails</li>
                            <li>Make sure you're using the correct email</li>
                            <li>Contact admin if issues persist</li>
                        </ul>
                    </div>
                </div>

                <div className="brand-footer">
                    <p>Remember your password? <Link to="/login">Sign In</Link></p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="auth-form-container">
                <div className="auth-form-wrapper">
                    <Link to="/login" className="back-link">
                        <ArrowLeft size={18} />
                        <span>Back to Sign In</span>
                    </Link>

                    {!isSuccess ? (
                        <>
                            <div className="auth-header">
                                <h2>Forgot Password?</h2>
                                <p>No worries, we'll send you reset instructions.</p>
                            </div>

                            {error && (
                                <div className="auth-error">
                                    <AlertCircle size={18} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="auth-form">
                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <div className="input-wrapper">
                                        <Mail className="input-icon" size={18} />
                                        <input
                                            id="email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="auth-submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="spinner" size={18} />
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <span>Send Reset Link</span>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="success-state">
                            <div className="success-icon">
                                <CheckCircle size={40} />
                            </div>
                            <h2>Check Your Email</h2>
                            <p>
                                We've sent password reset instructions to <strong>{email}</strong>.
                                Please check your inbox and follow the link to reset your password.
                            </p>
                            <div className="success-actions">
                                <Link to="/login" className="auth-submit as-link">
                                    Back to Sign In
                                </Link>
                                <button
                                    type="button"
                                    className="resend-btn"
                                    onClick={() => { setIsSuccess(false); setEmail(''); }}
                                >
                                    Didn't receive? Try again
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .auth-page {
          display: flex;
          min-height: 100vh;
          background: #fafafa;
        }

        /* Left Brand Section */
        .auth-brand {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          color: white;
          position: relative;
          overflow: hidden;
        }

        .auth-brand::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .brand-content {
          position: relative;
          z-index: 1;
        }

        .brand-logo {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 20px rgba(249, 115, 22, 0.4);
        }

        .brand-logo svg {
          width: 28px;
          height: 28px;
        }

        .brand-title {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
        }

        .brand-tagline {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0 0 3rem;
        }

        .brand-help {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .brand-help h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 0.75rem;
        }

        .brand-help p {
          font-size: 0.9375rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0 0 1rem;
          line-height: 1.6;
        }

        .brand-help ul {
          margin: 0;
          padding-left: 1.25rem;
        }

        .brand-help li {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 0.5rem;
        }

        .brand-footer {
          position: relative;
          z-index: 1;
        }

        .brand-footer p {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
        }

        .brand-footer a {
          color: #f97316;
          font-weight: 600;
          text-decoration: none;
        }

        .brand-footer a:hover {
          text-decoration: underline;
        }

        /* Right Form Section */
        .auth-form-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .auth-form-wrapper {
          width: 100%;
          max-width: 420px;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          text-decoration: none;
          margin-bottom: 2rem;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #0f172a;
        }

        .auth-header {
          margin-bottom: 2rem;
        }

        .auth-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.5rem;
        }

        .auth-header p {
          font-size: 0.9375rem;
          color: #64748b;
          margin: 0;
        }

        .auth-error {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.875rem 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          color: #dc2626;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #334155;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .input-wrapper input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 2.875rem;
          font-size: 0.9375rem;
          color: #0f172a;
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .input-wrapper input::placeholder {
          color: #94a3b8;
        }

        .input-wrapper input:hover {
          border-color: #cbd5e1;
        }

        .input-wrapper input:focus {
          outline: none;
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12);
        }

        .auth-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.9375rem 1.5rem;
          font-size: 0.9375rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25);
          text-decoration: none;
        }

        .auth-submit:hover {
          background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
          box-shadow: 0 4px 16px rgba(249, 115, 22, 0.35);
          transform: translateY(-1px);
        }

        .auth-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Success State */
        .success-state {
          text-align: center;
        }

        .success-icon {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #059669;
          margin: 0 auto 1.5rem;
        }

        .success-state h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.75rem;
        }

        .success-state p {
          font-size: 0.9375rem;
          color: #64748b;
          margin: 0 0 2rem;
          line-height: 1.6;
        }

        .success-state strong {
          color: #0f172a;
        }

        .success-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .resend-btn {
          background: none;
          border: none;
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: color 0.2s;
        }

        .resend-btn:hover {
          color: #f97316;
        }

        /* Mobile Responsive */
        @media (max-width: 1024px) {
          .auth-brand {
            display: none;
          }

          .auth-form-container {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          }

          .auth-form-wrapper {
            background: white;
            padding: 2.5rem;
            border-radius: 20px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          }
        }

        @media (max-width: 480px) {
          .auth-form-container {
            padding: 1rem;
          }

          .auth-form-wrapper {
            padding: 1.5rem;
          }
        }
      `}</style>
        </div>
    );
}
