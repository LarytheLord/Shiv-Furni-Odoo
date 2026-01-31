import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  FileText,
  Package,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Plus
} from 'lucide-react';

const StatCard = ({ title, value, change, changeType, icon: Icon, color, isLoading }) => {
  const colors = {
    primary: { bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', light: '#eef2ff' },
    success: { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', light: '#d1fae5' },
    warning: { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', light: '#fef3c7' },
    danger: { bg: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', light: '#ffe4e6' },
  };

  return (
    <div className="stat-card-wrapper">
      {isLoading ? (
        <div className="stat-skeleton">
          <div className="skeleton" style={{ width: '60%', height: '14px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '40%', height: '32px', marginBottom: '12px' }} />
          <div className="skeleton" style={{ width: '50%', height: '12px' }} />
        </div>
      ) : (
        <>
          <div className="stat-header">
            <div
              className="stat-icon"
              style={{ background: colors[color]?.bg }}
            >
              <Icon size={20} />
            </div>
            <button className="stat-menu">
              <MoreHorizontal size={18} />
            </button>
          </div>
          <div className="stat-body">
            <p className="stat-title">{title}</p>
            <h3 className="stat-value">{value}</h3>
          </div>
          <div className="stat-footer">
            <span className={`stat-change ${changeType}`}>
              {changeType === 'positive' ? (
                <ArrowUpRight size={14} />
              ) : (
                <ArrowDownRight size={14} />
              )}
              {change}
            </span>
            <span className="stat-period">vs last month</span>
          </div>
        </>
      )}

      <style>{`
        .stat-card-wrapper {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          transition: all 0.2s ease;
          border: 1px solid var(--slate-100);
        }

        .stat-card-wrapper:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .stat-skeleton {
          padding: 0.5rem 0;
        }

        .stat-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .stat-menu {
          background: none;
          border: none;
          padding: 0.25rem;
          color: var(--slate-400);
          cursor: pointer;
          border-radius: 6px;
          opacity: 0;
          transition: all 0.2s;
        }

        .stat-card-wrapper:hover .stat-menu {
          opacity: 1;
        }

        .stat-menu:hover {
          background: var(--slate-100);
          color: var(--slate-600);
        }

        .stat-body {
          margin-bottom: 1rem;
        }

        .stat-title {
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--slate-500);
          margin: 0 0 0.375rem;
        }

        .stat-value {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--slate-900);
          margin: 0;
          letter-spacing: -0.025em;
        }

        .stat-footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stat-change {
          display: inline-flex;
          align-items: center;
          gap: 0.125rem;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
        }

        .stat-change.positive {
          background: #d1fae5;
          color: #059669;
        }

        .stat-change.negative {
          background: #ffe4e6;
          color: #e11d48;
        }

        .stat-period {
          font-size: 0.75rem;
          color: var(--slate-400);
        }
      `}</style>
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, color }) => (
  <button className="quick-action-btn">
    <div className="quick-action-icon" style={{ background: color }}>
      <Icon size={18} />
    </div>
    <span>{label}</span>

    <style>{`
      .quick-action-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.625rem;
        padding: 1.25rem;
        background: white;
        border: 1px solid var(--slate-100);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .quick-action-btn:hover {
        border-color: var(--primary-200);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        transform: translateY(-2px);
      }

      .quick-action-icon {
        width: 42px;
        height: 42px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }

      .quick-action-btn span {
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--slate-700);
      }
    `}</style>
  </button>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ total_po: 0, total_so: 0, active_budgets: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats({
          total_po: data.stats?.purchaseOrders || 0,
          total_so: data.stats?.salesOrders || 0,
          active_budgets: data.stats?.activeBudgets || 0
        });
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening with your business today.</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          <span>New Order</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Purchase Orders"
          value={stats.total_po}
          change="12.5%"
          changeType="positive"
          icon={ShoppingCart}
          color="primary"
          isLoading={loading}
        />
        <StatCard
          title="Sales Orders"
          value={stats.total_so}
          change="8.2%"
          changeType="positive"
          icon={TrendingUp}
          color="success"
          isLoading={loading}
        />
        <StatCard
          title="Active Budgets"
          value={stats.active_budgets}
          change="2.4%"
          changeType="negative"
          icon={DollarSign}
          color="warning"
          isLoading={loading}
        />
        <StatCard
          title="Pending Bills"
          value="₹2.4L"
          change="5.1%"
          changeType="positive"
          icon={FileText}
          color="danger"
          isLoading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div className="section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          <QuickAction
            icon={Package}
            label="New Product"
            color="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
          />
          <QuickAction
            icon={Users}
            label="Add Contact"
            color="linear-gradient(135deg, #10b981 0%, #059669 100%)"
          />
          <QuickAction
            icon={ShoppingCart}
            label="Create PO"
            color="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
          />
          <QuickAction
            icon={FileText}
            label="New Invoice"
            color="linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
          />
          <QuickAction
            icon={Activity}
            label="View Reports"
            color="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
          />
        </div>
      </div>

      {/* Activity Section */}
      <div className="two-column-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
            <button className="text-link">View all</button>
          </div>
          <div className="activity-list">
            {[
              { action: 'New purchase order created', time: '2 hours ago', icon: ShoppingCart, color: '#6366f1' },
              { action: 'Invoice #INV-2024-001 paid', time: '4 hours ago', icon: DollarSign, color: '#10b981' },
              { action: 'New vendor added: Steel Works', time: '6 hours ago', icon: Users, color: '#f59e0b' },
              { action: 'Budget alert: Marketing exceeded', time: '1 day ago', icon: Activity, color: '#f43f5e' },
            ].map((item, idx) => (
              <div key={idx} className="activity-item">
                <div className="activity-icon" style={{ background: `${item.color}15`, color: item.color }}>
                  <item.icon size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-action">{item.action}</p>
                  <p className="activity-time">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Budget Overview</h3>
            <button className="text-link">Details</button>
          </div>
          <div className="budget-list">
            {[
              { name: 'Production', spent: 320000, total: 500000, color: '#6366f1' },
              { name: 'Raw Materials', spent: 680000, total: 800000, color: '#10b981' },
              { name: 'Marketing', spent: 175000, total: 200000, color: '#f59e0b' },
              { name: 'Administration', spent: 45000, total: 100000, color: '#8b5cf6' },
            ].map((budget, idx) => (
              <div key={idx} className="budget-item">
                <div className="budget-info">
                  <span className="budget-name">{budget.name}</span>
                  <span className="budget-amount">
                    ₹{(budget.spent / 1000).toFixed(0)}K / ₹{(budget.total / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="budget-bar">
                  <div
                    className="budget-progress"
                    style={{
                      width: `${(budget.spent / budget.total) * 100}%`,
                      background: budget.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard {
          max-width: 1400px;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--slate-900);
          margin: 0 0 0.375rem;
        }

        .page-subtitle {
          font-size: 0.9375rem;
          color: var(--slate-500);
          margin: 0;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .section {
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--slate-900);
          margin: 0 0 1rem;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
        }

        .two-column-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          border: 1px solid var(--slate-100);
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .card-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--slate-900);
          margin: 0;
        }

        .text-link {
          background: none;
          border: none;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--primary-600);
          cursor: pointer;
        }

        .text-link:hover {
          text-decoration: underline;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 0.875rem;
        }

        .activity-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .activity-content {
          flex: 1;
          min-width: 0;
        }

        .activity-action {
          font-size: 0.875rem;
          color: var(--slate-700);
          margin: 0 0 0.125rem;
        }

        .activity-time {
          font-size: 0.75rem;
          color: var(--slate-400);
          margin: 0;
        }

        .budget-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .budget-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .budget-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .budget-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--slate-700);
        }

        .budget-amount {
          font-size: 0.75rem;
          color: var(--slate-500);
        }

        .budget-bar {
          height: 6px;
          background: var(--slate-100);
          border-radius: 3px;
          overflow: hidden;
        }

        .budget-progress {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .quick-actions-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 1rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .quick-actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .two-column-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
