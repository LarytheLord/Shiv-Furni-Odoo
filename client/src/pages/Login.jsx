import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, User, AlertCircle, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email or login ID');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const user = await login(email, password);
      
      console.log('Login successful:', user); // Debug log

      // Role and redirection handling
      if (user.role === 'ADMIN' || user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'PORTAL_USER' || user.role === 'portal_user') {
        // Redirect based on contact type
        if (user.contactType === 'CUSTOMER') {
          navigate('/portal/customer');
        } else if (user.contactType === 'VENDOR') {
          navigate('/portal/vendor');
        } else {
          // Fallback if contact type is unknown or mixed, default to customer for now or show error
          console.warn('Unknown contact type for portal user:', user.contactType);
          navigate('/portal/customer'); 
        }
      } else if (user.role === 'customer' || user.role === 'CUSTOMER') {
        navigate('/portal/customer');
      } else if (user.role === 'vendor' || user.role === 'VENDOR') {
        navigate('/portal/vendor');
      } else {
        console.warn('Unknown user role:', user.role);
        navigate('/admin'); // Fallback
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Login ID or Password');
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

          <div className="brand-features">
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <p>Real-time budget tracking & analytics</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🏭</div>
              <p>Complete manufacturing workflow</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💰</div>
              <p>Invoicing & payment management</p>
            </div>
          </div>
        </div>

        <div className="brand-footer">
          <p>Trusted by furniture manufacturers across India</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h2>Welcome back</h2>
            <p>Sign in to continue to your account</p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Login ID / Email</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input
                  id="email"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your login ID or email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="spinner" size={18} />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="auth-footer">
            <p>Don't have an account?</p>
            <Link to="/signup" className="auth-link">
              Sign Up <ArrowRight size={16} />
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

        .brand-features {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(8px);
        }

        .feature-icon {
          font-size: 1.5rem;
        }

        .feature-item p {
          margin: 0;
          font-size: 0.9375rem;
          color: rgba(255, 255, 255, 0.85);
        }

        .brand-footer {
          position: relative;
          z-index: 1;
        }

        .brand-footer p {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
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

        .auth-header {
          margin-bottom: 2rem;
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

        .form-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #64748b;
          cursor: pointer;
        }

        .remember-me input {
          width: 16px;
          height: 16px;
          accent-color: #f97316;
          cursor: pointer;
        }

        .forgot-link {
          font-size: 0.875rem;
          font-weight: 500;
          color: #f97316;
          text-decoration: none;
          transition: color 0.2s;
        }

        .forgot-link:hover {
          color: #ea580c;
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
          margin-top: 0.5rem;
        }

        .auth-submit:hover {
          background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
          box-shadow: 0 4px 16px rgba(249, 115, 22, 0.35);
          transform: translateY(-1px);
        }

        .auth-submit:active {
          transform: translateY(0);
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

        .auth-divider {
          display: flex;
          align-items: center;
          margin: 1.5rem 0;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }

        .auth-divider span {
          padding: 0 1rem;
          font-size: 0.8125rem;
          color: #94a3b8;
        }

        .auth-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
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
