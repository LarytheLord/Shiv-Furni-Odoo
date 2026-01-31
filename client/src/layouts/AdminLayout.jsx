import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Package, PieChart, Truck, FileText,
  CreditCard, BarChart3, Receipt, ShoppingCart, Menu, X, LogOut,
  ChevronRight, Bell, Search, Settings, Briefcase, UserCog,
  Home, ChevronLeft
} from 'lucide-react';

const navGroups = [
  {
    title: 'General',
    items: [
      { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    ]
  },
  {
    title: 'Account',
    items: [
      { path: '/admin/contacts', icon: Users, label: 'Contact' },
      { path: '/admin/products', icon: Package, label: 'Product' },
      { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
      { path: '/admin/analytical-models', icon: Briefcase, label: 'Auto Analytic Model' },
      { path: '/admin/budgets', icon: PieChart, label: 'Budget' },
    ]
  },
  {
    title: 'Purchase',
    items: [
      { path: '/admin/purchase-orders', icon: Truck, label: 'Purchase Order' },
      { path: '/admin/bills', icon: Receipt, label: 'Purchase Bill' },
      { path: '/admin/payments', icon: CreditCard, label: 'Payment' },
    ]
  },
  {
    title: 'Sale',
    items: [
      { path: '/admin/sales-orders', icon: ShoppingCart, label: 'Sale Order' },
      { path: '/admin/invoices', icon: FileText, label: 'Sale Invoice' },
      { path: '/admin/receipts', icon: Receipt, label: 'Receipt' },
    ]
  }
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

  const getPageTitle = () => {
    // Flatten groups to find active item
    const allItems = navGroups.flatMap(g => g.items);
    const activeItem = allItems.find(item => isActive(item.path));
    return activeItem ? activeItem.label : 'Dashboard';
  };

  return (
    <div className="admin-layout">
      {/* Sidebar - Dark Professional Theme */}
      <aside className={`sidebar ${sidebarOpen ? 'expanded' : 'collapsed'} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-icon">SF</div>
            {sidebarOpen && <span className="logo-text">Shiv Furniture</span>}
          </div>
          <button className="sidebar-toggle desktop-only" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="nav-group">
              {sidebarOpen && group.title !== 'General' && (
                <div className="group-title">{group.title}</div>
              )}
              {group.items.map((item) => {
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
                    <Icon size={18} className="nav-icon" />
                    {sidebarOpen && <span className="nav-label">{item.label}</span>}
                  </Link>
                );
              })}
              {groupIndex < navGroups.length - 1 && <div className="group-divider"></div>}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>

          {sidebarOpen && (
            <div className="user-profile">
              <div className="user-avatar-sm">{user?.name?.[0] || 'A'}</div>
              <div className="user-details">
                <span className="user-name">{user?.name || 'Admin'}</span>
                <span className="user-role">{user?.role?.toLowerCase()}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        {/* Top Header - White & Clean */}
        <header className="main-header">
          <div className="header-left">
            <button className="mobile-menu-btn mobile-only" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="breadcrumb">
              <Link to="/admin" className="home-icon"><Home size={16} /></Link>
              <ChevronRight size={14} className="crumb-sep" />
              <span className="crumb-current">{getPageTitle()}</span>
            </div>
          </div>

          <div className="header-search">
            <Search size={16} />
            <input type="text" placeholder="Search..." />
          </div>

          <div className="header-actions">
            <button className="icon-btn">
              <Bell size={18} />
              <span className="badge-dot"></span>
            </button>
            <button className="icon-btn">
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="content-area">
          <Outlet />
        </main>
      </div>

      <style>{`
        .admin-layout {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: #f1f5f9;
        }

        /* Sidebar Styling */
        .sidebar {
          background: #1e293b;
          color: #e2e8f0;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: width 0.3s ease;
          overflow: hidden;
          z-index: 50;
        }
        
        .sidebar.expanded { width: 220px; }
        .sidebar.collapsed { width: 64px; }

        .sidebar-header {
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1rem;
          background: rgba(0,0,0,0.2);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          overflow: hidden;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: var(--accent-600);
          color: white;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        .logo-text {
          font-weight: 600;
          font-size: 1rem;
          white-space: nowrap;
        }

        .sidebar-toggle {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 4px;
        }

        .sidebar-toggle:hover { background: rgba(255,255,255,0.1); color: white; }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 0;
        }

        .nav-group {
          margin-bottom: 0.5rem;
        }

        .group-title {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          padding: 0.5rem 1rem;
          font-weight: 600;
        }

        .group-divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin: 0.5rem 1rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 1rem;
          color: #94a3b8;
          text-decoration: none;
          transition: all 0.2s;
          border-left: 3px solid transparent;
          white-space: nowrap;
        }

        .nav-item:hover {
          color: white;
          background: rgba(255,255,255,0.05);
        }

        .nav-item.active {
          color: white;
          background: rgba(255,255,255,0.05);
          border-left-color: var(--accent-500);
        }

        .nav-label { font-size: 0.9rem; }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          background: rgba(0,0,0,0.2);
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .logout-btn:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
        
        .sidebar.collapsed .logout-btn { justify-content: center; padding: 0.5rem 0; }
        .sidebar.collapsed .logout-btn span { display: none; }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          overflow: hidden;
        }

        .user-avatar-sm {
          width: 28px;
          height: 28px;
          background: #475569;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .user-name { font-size: 0.85rem; font-weight: 500; white-space: nowrap; }
        .user-role { font-size: 0.7rem; color: #64748b; text-transform: uppercase; }

        /* Main Wrapper */
        .main-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Header */
        .main-header {
          height: 56px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          flex-shrink: 0;
        }

        .header-left { display: flex; align-items: center; gap: 1rem; }
        
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.9rem;
        }

        .home-icon { color: #64748b; display: flex; align-items: center; }
        .home-icon:hover { color: var(--accent-600); }
        .crumb-current { font-weight: 600; color: #0f172a; }

        .header-search {
          flex: 1;
          max-width: 400px;
          position: relative;
          background: #f1f5f9;
          border-radius: 4px;
          padding: 0.4rem 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
        }

        .header-search input {
          border: none;
          background: transparent;
          font-size: 0.9rem;
          width: 100%;
          outline: none;
        }

        .header-actions { display: flex; align-items: center; gap: 0.5rem; }

        .icon-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          border-radius: 50%;
          position: relative;
        }

        .icon-btn:hover { background: #f1f5f9; color: #0f172a; }

        .badge-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          border: 1px solid white;
        }

        /* Content Area */
        .content-area {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 1.5rem;
        }

        /* Mobile */
        .mobile-only { display: none; }
        .desktop-only { display: flex; }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
          }
          
          .sidebar.mobile-open { transform: translateX(0); width: 240px; }
          .desktop-only { display: none; }
          .mobile-only { display: flex; }
          .header-search { display: none; }
          
          .mobile-menu-btn {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 4px;
          }
        }
      `}</style>
    </div>
  );
}
