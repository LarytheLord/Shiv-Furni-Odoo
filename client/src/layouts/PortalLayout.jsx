import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  User,
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Menu,
  X,
  CreditCard,
  Package
} from 'lucide-react';

export default function PortalLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine navigation based on user role/type
  const getNavItems = () => {
    // Default to customer if not specified
    const type = user?.contactType || 'CUSTOMER';

    if (type === 'VENDOR') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/portal/vendor' },
        { icon: Package, label: 'Purchase Orders', path: '/portal/vendor/orders' },
        { icon: FileText, label: 'My Bills', path: '/portal/vendor/bills' },
      ];
    }

    // Customer Items
    return [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/portal/customer' },
      { icon: ShoppingCart, label: 'My Orders', path: '/portal/customer/orders' },
      { icon: FileText, label: 'Invoices', path: '/portal/customer/invoices' },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="portal-layout">
      {/* Sidebar Navigation */}
      <aside className={`portal-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-logo">S</div>
          <h2>Shiv Furniture</h2>
          <button
            className="mobile-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="user-profile-summary">
          <div className="user-avatar">
            <span>{user?.name?.charAt(0) || 'U'}</span>
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.contactType || 'Portal User'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="portal-content-wrapper">
        {/* Mobile Header */}
        <header className="mobile-header">
          <button
            className="menu-btn"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          <span className="mobile-title">Shiv Furniture</span>
          <div className="mobile-user">
            <User size={20} />
          </div>
        </header>

        <main className="portal-main">
          <Outlet />
        </main>
      </div>

      <style>{`
        :root {
          --portal-bg: #f8fafc;
          --sidebar-bg: #0f172a;
          --sidebar-text: #e2e8f0;
          --sidebar-hover: #1e293b;
          --accent-color: #f97316;
          --accent-hover: #ea580c;
        }

        .portal-layout {
          display: flex;
          min-height: 100vh;
          background: var(--portal-bg);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        /* Sidebar Styles */
        .portal-sidebar {
          width: 280px;
          background: var(--sidebar-bg);
          color: var(--sidebar-text);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 50;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 4px 0 24px rgba(0,0,0,0.1);
        }

        .sidebar-header {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .brand-logo {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
        }

        .sidebar-header h2 {
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .mobile-close-btn {
          display: none;
          background: none;
          border: none;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          margin-left: auto;
        }

        .user-profile-summary {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255,255,255,0.03);
          margin: 1rem;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: var(--sidebar-hover);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .user-details {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .user-name {
          font-size: 0.9375rem;
          font-weight: 500;
          color: white;
        }

        .user-role {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sidebar-nav {
          flex: 1;
          padding: 0 1rem;
          overflow-y: auto;
        }

        .sidebar-nav ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          border-radius: 10px;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          transition: all 0.2s;
          font-size: 0.9375rem;
          font-weight: 500;
          border: 1px solid transparent;
        }

        .nav-item:hover {
          background: var(--sidebar-hover);
          color: white;
        }

        .nav-item.active {
          background: linear-gradient(90deg, rgba(249, 115, 22, 0.1) 0%, transparent 100%);
          color: var(--accent-color);
          border-color: rgba(249, 115, 22, 0.2);
        }

        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        /* Main Content */
        .portal-content-wrapper {
          flex: 1;
          margin-left: 280px;
          display: flex;
          flex-direction: column;
          min-width: 0; /* Prevent overflow */
        }

        .mobile-header {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .menu-btn {
          background: none;
          border: none;
          color: #334155;
          cursor: pointer;
          padding: 0.5rem;
        }

        .mobile-title {
          font-weight: 600;
          color: #0f172a;
        }

        .portal-main {
          padding: 2.5rem;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .portal-sidebar {
            transform: translateX(-100%);
          }

          .portal-sidebar.open {
            transform: translateX(0);
          }

          .mobile-close-btn {
            display: block;
          }

          .portal-content-wrapper {
            margin-left: 0;
          }

          .mobile-header {
            display: flex;
          }

          .portal-main {
            padding: 1.5rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}
