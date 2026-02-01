import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect based on auth state
          if (user) {
            if (user.role === 'PORTAL_USER') {
              const contactType = user.contactType || 'customer';
              navigate(`/portal/${contactType}`, { replace: true });
            } else {
              navigate('/admin', { replace: true });
            }
          } else {
            navigate('/login', { replace: true });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user, navigate]);

  const handleGoNow = () => {
    if (user) {
      if (user.role === 'PORTAL_USER') {
        const contactType = user.contactType || 'customer';
        navigate(`/portal/${contactType}`, { replace: true });
      } else {
        navigate('/admin', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  };

  const destination = user ? 'Dashboard' : 'Login';

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <p className="not-found-redirect">
          Redirecting to {destination} in <span className="countdown">{countdown}</span> seconds...
        </p>
        <button onClick={handleGoNow} className="not-found-button">
          Go to {destination} Now
        </button>
      </div>

      <style>{`
        .not-found-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          padding: 20px;
        }

        .not-found-content {
          text-align: center;
          max-width: 500px;
        }

        .not-found-code {
          font-size: 8rem;
          font-weight: 800;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          line-height: 1;
          text-shadow: 0 0 60px rgba(139, 92, 246, 0.3);
        }

        .not-found-title {
          font-size: 1.75rem;
          color: #f1f5f9;
          margin: 1rem 0;
          font-weight: 600;
        }

        .not-found-message {
          color: #94a3b8;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        .not-found-redirect {
          color: #64748b;
          font-size: 0.95rem;
          margin-bottom: 1.5rem;
        }

        .countdown {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
          font-weight: 700;
          width: 28px;
          height: 28px;
          line-height: 28px;
          border-radius: 50%;
          text-align: center;
        }

        .not-found-button {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border: none;
          padding: 12px 32px;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        .not-found-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        }
      `}</style>
    </div>
  );
};

export default NotFound;
