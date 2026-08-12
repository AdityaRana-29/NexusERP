import React, { useEffect, useState } from 'react';
import { Bell, Search, ShieldCheck, Sparkles, Activity, Command } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="header-bar">
      <div className="header-search">
        <Search size={18} color="#64748b" />
        <input type="text" placeholder="Search orders, customers, SKUs..." />
        <div className="search-shortcut">
          <Command size={10} /> K
        </div>
      </div>

      <div className="header-actions">
        <div className="system-status-pill">
          <span className="live-pulse-dot"></span>
          <Activity size={13} color="#10b981" />
          <span>DB Synced ({time})</span>
        </div>

        <div className="role-indicator">
          <Sparkles size={14} color="#818cf8" />
          <span>Active Role: <strong>{user?.role}</strong></span>
        </div>

        <button className="icon-btn" title="Notifications">
          <Bell size={18} />
          <span className="notification-dot"></span>
        </button>
      </div>

      <style>{`
        .header-bar {
          height: 70px;
          background: rgba(18, 24, 39, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          position: sticky;
          top: 0;
          z-index: 90;
        }

        .header-search {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #0b0f19;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 9px 16px;
          width: 360px;
          transition: all 0.2s ease;
        }

        .header-search:focus-within {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
          background: #0e1322;
        }

        .header-search input {
          background: transparent;
          border: none;
          outline: none;
          color: #f8fafc;
          font-size: 0.875rem;
          width: 100%;
        }

        .search-shortcut {
          display: flex;
          align-items: center;
          gap: 2px;
          background: rgba(255, 255, 255, 0.08);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.7rem;
          color: #94a3b8;
          font-weight: 700;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .system-status-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #6ee7b7;
          font-size: 0.775rem;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 20px;
        }

        .live-pulse-dot {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 8px #10b981;
        }

        .role-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.25);
          color: #c7d2fe;
          font-size: 0.8rem;
          padding: 6px 14px;
          border-radius: 20px;
        }

        .role-indicator strong {
          color: #818cf8;
        }

        .icon-btn {
          position: relative;
          background: #0b0f19;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .icon-btn:hover {
          color: #ffffff;
          border-color: #6366f1;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .notification-dot {
          position: absolute;
          top: 9px;
          right: 9px;
          width: 8px;
          height: 8px;
          background: #f43f5e;
          border-radius: 50%;
          box-shadow: 0 0 6px #f43f5e;
        }
      `}</style>
    </header>
  );
};
