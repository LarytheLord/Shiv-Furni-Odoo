import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Truck,
  CreditCard,
  PieChart,
  LogOut,
  Package,
  Briefcase,
  FileText,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight
} from 'lucide-react';

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Contacts', path: '/admin/contacts', icon: Users },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Cost Centers', path: '/admin/analytical-accounts', icon: Briefcase },
    { name: 'Budgets', path: '/admin/budgets', icon: PieChart },
    { name: 'Purchases', path: '/admin/purchases', icon: Truck },
    { name: 'Vendor Bills', path: '/admin/bills', icon: FileText },
    { name: 'Sales', path: '/admin/sales', icon: ShoppingCart },
    { name: 'Invoices', path: '/admin/invoices', icon: FileText },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Analytics', path: '/admin/analytics', icon: PieChart },
  ];

  const currentPage = navItems.find(item => item.path === location.pathname)?.name || 'Dashboard';

  return (
    <div className="admin-layout">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'expanded' : 'collapsed'} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            {sidebarOpen && <span className="logo-text">Shiv Furniture</span>}
          </div>
          <button
            className="sidebar-toggle desktop-only"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <ChevronRight className={`toggle-icon ${sidebarOpen ? 'rotated' : ''}`} size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
                title={!sidebarOpen ? item.name : undefined}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            {sidebarOpen && (
              <div className="user-details">
                <p className="user-name">{user?.name || 'Admin'}</p>
                <p className="user-role">{user?.role || 'Administrator'}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="logout-btn"
            title="Logout"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-area">
        {/* Header */}
        <header className="main-header">
          <div className="header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="breadcrumb">
              <span className="breadcrumb-item">Admin</span>
              <ChevronRight size={16} />
              <span className="breadcrumb-current">{currentPage}</span>
            </div>
          </div>

          <div className="header-right">
            <div className="search-container">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search..."
                className="search-input"
              />
            </div>
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-dot" />
            </button>
            <div className="header-user">
              <div className="header-avatar">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: var(--slate-100);
        }

        /* Sidebar Styles */
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          background: linear-gradient(180deg, var(--slate-900) 0%, #0c1222 100%);
          display: flex;
          flex-direction: column;
          z-index: 50;
          transition: width 0.3s ease;
        }

        .sidebar.expanded {
          width: 260px;
        }

        .sidebar.collapsed {
          width: 72px;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon-sm {
          width: 36px;
          height: 36px;
          padding: 0.5rem;
          background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
          border-radius: 10px;
          color: white;
          flex-shrink: 0;
        }

        .logo-icon-sm svg {
          width: 100%;
          height: 100%;
        }

        .logo-text {
          font-size: 1.125rem;
          font-weight: 700;
          color: white;
          white-space: nowrap;
        }

        .sidebar-toggle {
          background: rgba(255, 255, 255, 0.05);
          border: none;
          padding: 0.5rem;
          border-radius: 8px;
          color: var(--slate-400);
          cursor: pointer;
          transition: all 0.2s;
        }

        .sidebar-toggle:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .toggle-icon {
          transition: transform 0.3s ease;
        }

        .toggle-icon.rotated {
          transform: rotate(180deg);
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: var(--slate-400);
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .sidebar.collapsed .sidebar-link {
          justify-content: center;
          padding: 0.75rem;
        }

        .sidebar-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }

        .sidebar-link.active {
          color: white;
          background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .user-details {
          overflow: hidden;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--slate-400);
          margin: 0;
          text-transform: capitalize;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: none;
          border-radius: 8px;
          color: #f87171;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .sidebar.collapsed .logout-btn {
          justify-content: center;
          padding: 0.75rem;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        /* Main Area */
        .main-area {
          flex: 1;
          margin-left: 260px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          transition: margin-left 0.3s ease;
        }

        .sidebar.collapsed ~ .main-area {
          margin-left: 72px;
        }

        /* Header */
        .main-header {
          position: sticky;
          top: 0;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          height: 64px;
          background: white;
          border-bottom: 1px solid var(--slate-200);
          box-shadow: var(--shadow-sm);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          padding: 0.5rem;
          color: var(--slate-600);
          cursor: pointer;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .breadcrumb-item {
          color: var(--slate-400);
        }

        .breadcrumb svg {
          color: var(--slate-300);
        }

        .breadcrumb-current {
          color: var(--slate-900);
          font-weight: 600;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .search-container {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--slate-400);
        }

        .search-input {
          width: 240px;
          padding: 0.5rem 0.875rem 0.5rem 2.5rem;
          font-size: 0.875rem;
          background: var(--slate-100);
          border: 1px solid transparent;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          background: white;
          border-color: var(--primary-300);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .notification-btn {
          position: relative;
          background: none;
          border: none;
          padding: 0.5rem;
          color: var(--slate-600);
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .notification-btn:hover {
          background: var(--slate-100);
          color: var(--slate-900);
        }

        .notification-dot {
          position: absolute;
          top: 0.375rem;
          right: 0.375rem;
          width: 8px;
          height: 8px;
          background: var(--danger-500);
          border: 2px solid white;
          border-radius: 50%;
        }

        .header-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          padding: 1.5rem;
        }

        /* Mobile Styles */
        .mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 45;
        }

        .desktop-only {
          display: flex;
        }

        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
          }

          .sidebar.mobile-open {
            transform: translateX(0);
            width: 260px;
          }

          .mobile-overlay {
            display: block;
          }

          .main-area {
            margin-left: 0 !important;
          }

          .mobile-menu-btn {
            display: flex;
          }

          .search-container {
            display: none;
          }

          .desktop-only {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
