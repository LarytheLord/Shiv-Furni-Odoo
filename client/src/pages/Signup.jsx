import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle, Loader2, ArrowRight, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/axios';

export default function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        loginId: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    // Validation rules
    const validations = {
        loginIdLength: formData.loginId.length >= 6 && formData.loginId.length <= 12,
        loginIdUnique: true, // Will be checked on submit
        passwordLength: formData.password.length >= 8,
        passwordUpper: /[A-Z]/.test(formData.password),
        passwordLower: /[a-z]/.test(formData.password),
        passwordSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
        passwordsMatch: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0
    };

    const isPasswordValid = validations.passwordLength && validations.passwordUpper && validations.passwordLower && validations.passwordSpecial;
    const isFormValid = formData.name.trim() && validations.loginIdLength && formData.email.trim() && isPasswordValid && validations.passwordsMatch;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate all fields
        if (!formData.name.trim()) {
            setError('Please enter your name');
            return;
        }
        if (!validations.loginIdLength) {
            setError('Login ID must be between 6-12 characters');
            return;
        }
        if (!formData.email.trim()) {
            setError('Please enter your email');
            return;
        }
        if (!isPasswordValid) {
            setError('Password does not meet requirements');
            return;
        }
        if (!validations.passwordsMatch) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/register', {
                name: formData.name,
                loginId: formData.loginId,
                email: formData.email,
                password: formData.password
            });
            navigate('/login', { state: { message: 'Account created successfully! Please sign in.' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const ValidationItem = ({ valid, text }) => (
        <div className={`validation-item ${valid ? 'valid' : ''}`}>
            {valid ? <CheckCircle size={14} /> : <XCircle size={14} />}
            <span>{text}</span>
        </div>
    );

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
                    <h1 className="brand-title">Join Shiv Furniture</h1>
                    <p className="brand-tagline">Create your invoicing account today</p>

                    <div className="brand-steps">
                        <div className="step-item">
                            <div className="step-number">1</div>
                            <div className="step-text">
                                <h4>Create Account</h4>
                                <p>Set up your credentials</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <div className="step-number">2</div>
                            <div className="step-text">
                                <h4>Get Access</h4>
                                <p>Start managing invoices</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <div className="step-number">3</div>
                            <div className="step-text">
                                <h4>Grow Your Business</h4>
                                <p>Track budgets & analytics</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="brand-footer">
                    <p>Already have an account? <Link to="/login">Sign In</Link></p>
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="auth-form-container">
                <div className="auth-form-wrapper signup-form">
                    <div className="auth-header">
                        <h2>Create Account</h2>
                        <p>Fill in your details to get started</p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={18} />
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="loginId">
                                Login ID
                                <span className="label-hint">(6-12 characters)</span>
                            </label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={18} />
                                <input
                                    id="loginId"
                                    name="loginId"
                                    type="text"
                                    autoComplete="username"
                                    placeholder="Choose a unique login ID"
                                    value={formData.loginId}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    maxLength={12}
                                />
                            </div>
                            {formData.loginId && (
                                <div className={`field-status ${validations.loginIdLength ? 'valid' : 'invalid'}`}>
                                    {validations.loginIdLength ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                    <span>{formData.loginId.length}/12 characters</span>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={18} />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {formData.password && (
                                <div className="password-requirements">
                                    <ValidationItem valid={validations.passwordLength} text="At least 8 characters" />
                                    <ValidationItem valid={validations.passwordUpper} text="One uppercase letter" />
                                    <ValidationItem valid={validations.passwordLower} text="One lowercase letter" />
                                    <ValidationItem valid={validations.passwordSpecial} text="One special character" />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    placeholder="Re-enter your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {formData.confirmPassword && (
                                <div className={`field-status ${validations.passwordsMatch ? 'valid' : 'invalid'}`}>
                                    {validations.passwordsMatch ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                    <span>{validations.passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={isLoading || !isFormValid}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="spinner" size={18} />
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign Up</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer mobile-only">
                        <p>Already have an account?</p>
                        <Link to="/login" className="auth-link">
                            Sign In <ArrowRight size={16} />
                        </Link>
                    </div>
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
          flex: 0 0 45%;
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

        .auth-brand::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -30%;
          width: 80%;
          height: 80%;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, transparent 60%);
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
          letter-spacing: -0.025em;
        }

        .brand-tagline {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0 0 3rem;
        }

        .brand-steps {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .step-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .step-number {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9375rem;
        }

        .step-text h4 {
          font-size: 0.9375rem;
          font-weight: 600;
          margin: 0 0 0.125rem;
        }

        .step-text p {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
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
          overflow-y: auto;
        }

        .auth-form-wrapper {
          width: 100%;
          max-width: 460px;
        }

        .signup-form {
          padding: 1rem 0;
        }

        .auth-header {
          margin-bottom: 1.5rem;
        }

        .auth-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.5rem;
          letter-spacing: -0.025em;
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
          gap: 1rem;
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
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .label-hint {
          font-size: 0.75rem;
          font-weight: 400;
          color: #94a3b8;
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
          padding: 0.8125rem 1rem 0.8125rem 2.875rem;
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

        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          padding: 0.375rem;
          color: #94a3b8;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .password-toggle:hover {
          color: #64748b;
          background: #f1f5f9;
        }

        .field-status {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .field-status.valid {
          color: #10b981;
        }

        .field-status.invalid {
          color: #f43f5e;
        }

        .password-requirements {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.375rem;
          margin-top: 0.5rem;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 8px;
        }

        .validation-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .validation-item.valid {
          color: #10b981;
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
          margin-top: 0.75rem;
        }

        .auth-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
          box-shadow: 0 4px 16px rgba(249, 115, 22, 0.35);
          transform: translateY(-1px);
        }

        .auth-submit:active {
          transform: translateY(0);
        }

        .auth-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .auth-footer {
          display: none;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .auth-footer p {
          font-size: 0.9375rem;
          color: #64748b;
          margin: 0;
        }

        .auth-link {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #f97316;
          text-decoration: none;
          transition: all 0.2s;
        }

        .auth-link:hover {
          color: #ea580c;
          gap: 0.5rem;
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
            padding: 2rem;
            border-radius: 20px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          }

          .auth-footer.mobile-only {
            display: flex;
          }
        }

        @media (max-width: 480px) {
          .auth-form-container {
            padding: 1rem;
          }

          .auth-form-wrapper {
            padding: 1.5rem;
          }

          .password-requirements {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
