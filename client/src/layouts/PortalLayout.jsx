import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';

export default function PortalLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="portal-layout">
      <nav className="portal-nav">
        <div className="nav-content">
          <div className="nav-brand">
            <div className="brand-icon">S</div>
            <h1>Shiv Furniture</h1>
          </div>
          <div className="nav-user">
            <div className="user-info">
              <div className="user-avatar">
                <User size={16} />
              </div>
              <span>{user?.name}</span>
            </div>
            <button onClick={logout} className="logout-btn">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>
      <main className="portal-main">
        <Outlet />
      </main>

      <style>{`
        .portal-layout {
          min-height: 100vh;
          background: #f8fafc;
        }

        .portal-nav {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .nav-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.125rem;
        }

        .nav-brand h1 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.025em;
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: #f8fafc;
          border-radius: 8px;
        }

        .user-avatar {
          width: 28px;
          height: 28px;
          background: #e2e8f0;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }

        .user-info span {
          font-size: 0.875rem;
          font-weight: 500;
          color: #334155;
        }

        .logout-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 6px rgba(249, 115, 22, 0.25);
        }

        .logout-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35);
        }

        .portal-main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }

        @media (max-width: 768px) {
          .nav-content {
            padding: 0 1rem;
          }

          .user-info {
            display: none;
          }

          .logout-btn span {
            display: none;
          }

          .logout-btn {
            padding: 0.625rem;
          }

          .portal-main {
            padding: 1.5rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}
