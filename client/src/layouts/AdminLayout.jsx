import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Package, PieChart, Truck, FileText,
  CreditCard, BarChart3, Receipt, ShoppingCart, Menu, X, LogOut,
  ChevronRight, Bell, Search, Settings, Briefcase, UserCog
} from 'lucide-react';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/contacts', icon: Users, label: 'Contacts' },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/analytical-accounts', icon: Briefcase, label: 'Cost Centers' },
  { path: '/admin/budgets', icon: PieChart, label: 'Budgets' },
  { path: '/admin/purchases', icon: Truck, label: 'Purchases' },
  { path: '/admin/bills', icon: Receipt, label: 'Bills' },
  { path: '/admin/sales', icon: ShoppingCart, label: 'Sales' },
  { path: '/admin/invoices', icon: FileText, label: 'Invoices' },
  { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { path: '/admin/users', icon: UserCog, label: 'Users' },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'expanded' : 'collapsed'} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            {sidebarOpen && <span className="logo-text">Shiv Furniture</span>}
          </div>
          <button className="sidebar-toggle desktop-only" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <ChevronRight size={18} style={{ transform: sidebarOpen ? 'rotate(180deg)' : 'none' }} />
          </button>
          <button className="mobile-close mobile-only" onClick={() => setMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
                {active && sidebarOpen && <div className="active-indicator" />}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="sidebar-footer">
          {sidebarOpen && (
            <div className="user-card">
              <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</div>
              <div className="user-info">
                <span className="user-name">{user?.name || 'Admin'}</span>
                <span className="user-role">{user?.role?.toLowerCase()}</span>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />}

      {/* Main Content */}
      <div className="main-wrapper">
        {/* Header */}
        <header className="main-header">
          <div className="header-left">
            <button className="mobile-menu-btn mobile-only" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="search-box">
              <Search size={18} />
              <input type="text" placeholder="Search..." />
            </div>
          </div>
          <div className="header-right">
            <button className="header-icon-btn">
              <Bell size={20} />
              <span className="notification-dot" />
            </button>
            <button className="header-icon-btn">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        * { box-sizing: border-box; }

        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
        }

        /* Sidebar */
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: width 0.3s ease;
          overflow: hidden;
        }

        .sidebar.expanded { width: 260px; }
        .sidebar.collapsed { width: 72px; }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
        }

        .logo-icon svg {
          width: 20px;
          height: 20px;
          color: white;
        }

        .logo-text {
          font-size: 1.125rem;
          font-weight: 700;
          color: white;
          white-space: nowrap;
        }

        .sidebar-toggle {
          width: 28px;
          height: 28px;
          background: rgba(255,255,255,0.1);
          border: none;
          border-radius: 6px;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .sidebar-toggle:hover {
          background: rgba(255,255,255,0.15);
          color: white;
        }

        .sidebar-toggle svg {
          transition: transform 0.3s ease;
        }

        /* Navigation */
        .sidebar-nav {
          flex: 1;
          padding: 1rem 0.75rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          border-radius: 10px;
          transition: all 0.2s;
          position: relative;
          white-space: nowrap;
        }

        .nav-item:hover {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.9);
        }

        .nav-item.active {
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(234, 88, 12, 0.1) 100%);
          color: #f97316;
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 24px;
          background: #f97316;
          border-radius: 0 3px 3px 0;
        }

        .nav-item span {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .sidebar.collapsed .nav-item {
          justify-content: center;
          padding: 0.875rem;
        }

        .sidebar.collapsed .nav-item::before {
          display: none;
        }

        /* User & Footer */
        .sidebar-footer {
          padding: 1rem 0.75rem;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .user-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
          margin-bottom: 0.75rem;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.5);
          text-transform: capitalize;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          color: #f87171;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.3);
        }

        .sidebar.collapsed .logout-btn span { display: none; }

        /* Main Wrapper */
        .main-wrapper {
          flex: 1;
          margin-left: 260px;
          transition: margin-left 0.3s ease;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .sidebar.collapsed ~ .main-wrapper {
          margin-left: 72px;
        }

        /* Header */
        .main-header {
          position: sticky;
          top: 0;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 50;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          width: 280px;
        }

        .search-box svg { color: #94a3b8; }

        .search-box input {
          border: none;
          background: none;
          outline: none;
          font-size: 0.875rem;
          color: #0f172a;
          width: 100%;
        }

        .search-box input::placeholder { color: #94a3b8; }

        .header-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .header-icon-btn {
          position: relative;
          width: 40px;
          height: 40px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .header-icon-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: #f97316;
          border-radius: 50%;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          padding: 1.5rem;
        }

        /* Mobile */
        .mobile-only { display: none; }
        .desktop-only { display: flex; }

        .mobile-menu-btn {
          display: none;
          width: 40px;
          height: 40px;
          background: none;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          color: #64748b;
          cursor: pointer;
          align-items: center;
          justify-content: center;
        }

        .mobile-close {
          background: none;
          border: none;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          padding: 0.5rem;
        }

        .mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 90;
        }

        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
            width: 260px !important;
          }

          .sidebar.mobile-open {
            transform: translateX(0);
          }

          .main-wrapper {
            margin-left: 0 !important;
          }

          .mobile-only { display: flex; }
          .desktop-only { display: none; }
          .mobile-menu-btn { display: flex; }
          .mobile-overlay { display: block; }

          .search-box { width: 200px; }
        }

        @media (max-width: 640px) {
          .search-box { display: none; }
          .main-content { padding: 1rem; }
        }
      `}</style>
    </div>
  );
}
