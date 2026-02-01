import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const validations = {
        length: password.length > 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        match: password === confirmPassword && confirmPassword.length > 0
    };

    const isValid = validations.length && validations.upper && validations.lower && validations.special && validations.match;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid) return;

        setSubmitting(true);
        setError('');

        try {
            await api.post('/auth/reset-password', {
                token,
                password
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setSubmitting(false);
        }
    };

    if (!token) {
        return (
            <div className="reset-page">
                <div className="card error">
                    <AlertCircle size={48} />
                    <h2>Invalid Link</h2>
                    <p>This password reset link is invalid or missing a token.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="reset-page">
            <div className="card">
                <div className="header">
                    <div className="icon-bg">
                        <Lock size={24} color="white" />
                    </div>
                    <h1>Set New Password</h1>
                    <p>Please create a secure password for your account.</p>
                </div>

                {success ? (
                    <div className="success-state">
                        <CheckCircle size={48} className="text-emerald-500" />
                        <h2>Success!</h2>
                        <p>Your password has been set. Redirecting to login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="form-error">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="********"
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="********"
                            />
                        </div>

                        <div className="requirements">
                            <ValidationItem valid={validations.length} text="8+ Characters" />
                            <ValidationItem valid={validations.upper} text="Uppercase" />
                            <ValidationItem valid={validations.lower} text="Lowercase" />
                            <ValidationItem valid={validations.special} text="Special Character" />
                            <ValidationItem valid={validations.match} text="Passwords Match" />
                        </div>

                        <button type="submit" className="btn-submit" disabled={submitting || !isValid}>
                            {submitting ? <Loader2 className="spin" size={20} /> : 'Set Password'}
                        </button>
                    </form>
                )}
            </div>

            <style>{`
        .reset-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; padding: 1rem; }
        .card { background: white; width: 100%; max-width: 400px; padding: 2rem; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 2rem; }
        .icon-bg { width: 48px; height: 48px; background: linear-gradient(135deg, #f97316, #ea580c); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
        h1 { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0 0 0.5rem; }
        p { color: #64748b; margin: 0; font-size: 0.875rem; }
        
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; font-size: 0.875rem; font-weight: 500; color: #334155; margin-bottom: 0.5rem; }
        input { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.9375rem; transition: all 0.2s; }
        input:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1); }
        
        .requirements { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin: 1.5rem 0; background: #f8fafc; padding: 1rem; border-radius: 8px; }
        .validation-item { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; color: #94a3b8; }
        .validation-item.valid { color: #10b981; }
        
        .btn-submit { width: 100%; padding: 0.875rem; background: #f97316; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .btn-submit:hover:not(:disabled) { background: #ea580c; }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        
        .form-error { background: #fef2f2; color: #dc2626; padding: 0.75rem; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; margin-bottom: 1.5rem; }
        .success-state { text-align: center; padding: 2rem 0; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}

const ValidationItem = ({ valid, text }) => (
    <div className={`validation-item ${valid ? 'valid' : ''}`}>
        {valid ? <CheckCircle size={12} /> : <div className="w-3 h-3 rounded-full border border-current opacity-50" />}
        <span>{text}</span>
    </div>
);
