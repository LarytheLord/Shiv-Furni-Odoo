import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    ShoppingCart,
    FileText,
    Package,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PortalStatCard = ({ title, value, icon: Icon, color, link, description }) => (
    <Link to={link} className="portal-stat-card">
        <div className="stat-icon" style={{ background: color }}>
            <Icon size={24} color="white" />
        </div>
        <div className="stat-content">
            <h3 className="stat-value">{value}</h3>
            <p className="stat-title">{title}</p>
            {description && <p className="stat-desc">{description}</p>}
        </div>

        <style>{`
      .portal-stat-card {
        background: white;
        border-radius: 16px;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1.25rem;
        text-decoration: none;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        border: 1px solid rgba(0,0,0,0.05);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      
      .portal-stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
      }
      
      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }
      
      .stat-content {
        flex: 1;
      }
      
      .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
        line-height: 1.2;
      }
      
      .stat-title {
        font-size: 0.875rem;
        font-weight: 500;
        color: #64748b;
        margin: 0.25rem 0 0;
      }
      
      .stat-desc {
        font-size: 0.75rem;
        color: #94a3b8;
        margin: 0.25rem 0 0;
      }
    `}</style>
    </Link>
);

export default function PortalDashboard() {
    const { user } = useAuth();
    const isVendor = user?.contactType === 'VENDOR';

    // TODO: Fetch real stats from API
    // Placeholder data for design
    const vendorStats = [
        {
            title: 'Active Orders',
            value: '12',
            icon: Package,
            color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            link: '/portal/vendor/orders',
            desc: '3 pending delivery'
        },
        {
            title: 'Pending Bills',
            value: '₹4.5L',
            icon: FileText,
            color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            link: '/portal/vendor/bills',
            desc: '2 overdue'
        },
        {
            title: 'Completed Orders',
            value: '145',
            icon: CheckCircle,
            color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            link: '/portal/vendor/orders',
            desc: 'This year'
        }
    ];

    const customerStats = [
        {
            title: 'My Orders',
            value: '5',
            icon: ShoppingCart,
            color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            link: '/portal/customer/orders',
            desc: '1 in processing'
        },
        {
            title: 'Invoices Due',
            value: '₹12.4K',
            icon: FileText,
            color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            link: '/portal/customer/invoices',
            desc: 'Due within 7 days'
        },
        {
            title: 'Total Spent',
            value: '₹1.2L',
            icon: TrendingUp,
            color: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            link: '/portal/customer/invoices',
            desc: 'Lifetime'
        }
    ];

    const stats = isVendor ? vendorStats : customerStats;

    return (
        <div className="portal-dashboard">
            <div className="dashboard-header">
                <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
                <p>Here's what's happening with your account today.</p>
            </div>

            <div className="stats-grid">
                {stats.map((stat, idx) => (
                    <PortalStatCard key={idx} {...stat} />
                ))}
            </div>

            <div className="dashboard-sections">
                <div className="section-card">
                    <div className="section-header">
                        <h3>Recent Activity</h3>
                    </div>
                    <div className="empty-activity">
                        <Clock size={48} color="#cbd5e1" />
                        <p>No recent activity to show</p>
                    </div>
                </div>

                <div className="section-card">
                    <div className="section-header">
                        <h3>{isVendor ? 'Pending Actions' : 'Notifications'}</h3>
                    </div>
                    <div className="notification-list">
                        <div className="notification-item">
                            <AlertCircle size={16} color="#f59e0b" />
                            <span>System maintenance scheduled for Sunday 2 AM to 4 AM.</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .portal-dashboard {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .dashboard-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.5rem;
        }

        .dashboard-header p {
          color: #64748b;
          margin: 0;
          font-size: 1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .dashboard-sections {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }

        .section-card {
          background: white;
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          overflow: hidden;
          min-height: 300px;
        }

        .section-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .section-header h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #334155;
        }

        .empty-activity {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: #94a3b8;
          gap: 1rem;
        }

        .notification-list {
          padding: 1rem;
        }

        .notification-item {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
          font-size: 0.875rem;
          color: #475569;
          align-items: flex-start;
        }

        @media (max-width: 1024px) {
          .dashboard-sections {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
