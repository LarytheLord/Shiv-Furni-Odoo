import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN' || user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'customer' || user.role === 'CUSTOMER') {
        navigate('/portal/customer');
      } else if (user.role === 'vendor' || user.role === 'VENDOR') {
        navigate('/portal/vendor');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Animated Background */}
      <div className="bg-shapes" />

      {/* Login Card */}
      <div className="login-card glass-card">
        {/* Logo & Branding */}
        <div className="login-header">
          <div className="logo-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 className="login-title">Shiv Furniture</h1>
          <p className="login-subtitle">Enterprise Resource Planning</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="input-field with-icon"
                placeholder="admin@shivfurniture.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                className="input-field with-icon"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="spinner-icon" size={18} />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>Budget Accounting System</p>
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
          position: relative;
          overflow: hidden;
        }

        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          padding: 2.5rem;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1rem;
          padding: 0.875rem;
          background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
          border-radius: 16px;
          color: white;
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
        }

        .logo-icon svg {
          width: 100%;
          height: 100%;
        }

        .login-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--slate-900);
          margin: 0 0 0.25rem;
        }

        .login-subtitle {
          font-size: 0.9375rem;
          color: var(--slate-500);
          margin: 0;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--slate-700);
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--slate-400);
          pointer-events: none;
        }

        .input-field.with-icon {
          padding-left: 2.75rem;
        }

        .login-btn {
          width: 100%;
          margin-top: 0.5rem;
          padding: 0.875rem 1.5rem;
          font-size: 0.9375rem;
          gap: 0.5rem;
        }

        .spinner-icon {
          animation: spin 1s linear infinite;
        }

        .login-footer {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--slate-200);
          text-align: center;
        }

        .login-footer p {
          font-size: 0.8125rem;
          color: var(--slate-400);
          margin: 0;
        }
      `}</style>
    </div>
  );
}
