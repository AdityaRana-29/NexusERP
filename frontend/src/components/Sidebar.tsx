import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Boxes, 
  FileCheck2, 
  LogOut, 
  ShieldCheck, 
  Building2,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Building2 size={26} color="#ffffff" />
        </div>
        <div className="brand-text">
          <div className="brand-title">
            NexusERP <Sparkles size={14} color="#a855f7" className="sparkle-icon" />
          </div>
          <span>Operations Portal</span>
        </div>
      </div>

      <div className="user-profile-card">
        <div className="avatar-wrapper">
          <div className="user-avatar">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <span className="online-indicator" title="User Session Active"></span>
        </div>
        <div className="user-info">
          <p className="user-name">{user?.name}</p>
          <span className={`role-chip role-${user?.role.toLowerCase()}`}>
            <ShieldCheck size={11} /> {user?.role}
          </span>
        </div>
      </div>

      <div className="nav-section-label">Main Navigation</div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-icon-wrapper">
            <LayoutDashboard size={18} />
          </div>
          <span>Dashboard</span>
          <ChevronRight size={14} className="nav-arrow" />
        </NavLink>

        <NavLink to="/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-icon-wrapper">
            <Users size={18} />
          </div>
          <span>Customers CRM</span>
          <ChevronRight size={14} className="nav-arrow" />
        </NavLink>

        <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-icon-wrapper">
            <Package size={18} />
          </div>
          <span>Product Catalog</span>
          <ChevronRight size={14} className="nav-arrow" />
        </NavLink>

        <NavLink to="/inventory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-icon-wrapper">
            <Boxes size={18} />
          </div>
          <span>Stock Movements</span>
          <ChevronRight size={14} className="nav-arrow" />
        </NavLink>

        <NavLink to="/challans" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-icon-wrapper">
            <FileCheck2 size={18} />
          </div>
          <span>Sales Challans</span>
          <ChevronRight size={14} className="nav-arrow" />
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>

      <style>{`
        .sidebar {
          width: 275px;
          background: #0d121f;
          border-right: 1px solid rgba(255, 255, 255, 0.07);
          display: flex;
          flex-direction: column;
          padding: 24px 18px;
          min-height: 100vh;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 24px;
        }

        .brand-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 18px rgba(99, 102, 241, 0.4);
        }

        .brand-title {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 800;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .brand-text span {
          font-size: 0.725rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
        }

        .user-profile-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(18, 24, 39, 0.8);
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 24px;
        }

        .avatar-wrapper {
          position: relative;
        }

        .user-avatar {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #4f46e5, #4338ca);
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }

        .online-indicator {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 10px;
          height: 10px;
          background: #10b981;
          border: 2px solid #0d121f;
          border-radius: 50%;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 700;
          color: #f8fafc;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 140px;
        }

        .role-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .role-admin { background: rgba(99, 102, 241, 0.2); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.4); }
        .role-sales { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); }
        .role-warehouse { background: rgba(245, 158, 11, 0.2); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.4); }
        .role-accounts { background: rgba(14, 165, 233, 0.2); color: #7dd3fc; border: 1px solid rgba(14, 165, 233, 0.4); }

        .nav-section-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 12px;
          padding-left: 6px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          border-radius: 10px;
          color: #94a3b8;
          font-size: 0.88rem;
          font-weight: 600;
          transition: all 0.2s ease;
          position: relative;
        }

        .nav-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        .nav-arrow {
          margin-left: auto;
          opacity: 0;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.04);
          color: #f8fafc;
        }

        .nav-item:hover .nav-icon-wrapper {
          transform: scale(1.1);
        }

        .nav-item:hover .nav-arrow {
          opacity: 0.6;
          transform: translateX(2px);
        }

        .nav-item.active {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.15) 100%);
          color: #ffffff;
          border: 1px solid rgba(99, 102, 241, 0.35);
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.2);
        }

        .nav-item.active .nav-icon-wrapper {
          color: #818cf8;
        }

        .nav-item.active .nav-arrow {
          opacity: 1;
          color: #818cf8;
        }

        .sidebar-footer {
          padding-top: 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          background: rgba(244, 63, 94, 0.08);
          border: 1px solid rgba(244, 63, 94, 0.2);
          color: #fca5a5;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: rgba(244, 63, 94, 0.2);
          border-color: #f43f5e;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(244, 63, 94, 0.3);
        }
      `}</style>
    </aside>
  );
};
