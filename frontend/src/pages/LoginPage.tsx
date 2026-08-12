import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Mail, Shield, AlertCircle, UserPlus, UserCheck, User } from 'lucide-react';
import { Role } from '../types';

export const LoginPage: React.FC = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('SALES');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await authApi.login(email, password);
      if (res.success) {
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await authApi.register({ name, email, password, role });
      if (res.success) {
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (selectedRole: Role) => {
    setIsRegisterMode(false);
    const roleEmailMap: Record<Role, string> = {
      ADMIN: 'admin@erp.com',
      SALES: 'sales@erp.com',
      WAREHOUSE: 'warehouse@erp.com',
      ACCOUNTS: 'accounts@erp.com',
    };
    setEmail(roleEmailMap[selectedRole]);
    setPassword('Password123!');
  };

  return (
    <div className="login-wrapper">
      <div className="login-card card">
        <div className="login-header">
          <div className="brand-logo">
            <Building2 size={32} color="#ffffff" />
          </div>
          <h1>NexusERP</h1>
          <p className="page-subtitle">Wholesale & Distribution Operations Portal</p>
        </div>

        {/* Tab Toggle for Sign In vs Register */}
        <div className="auth-tab-group">
          <button
            type="button"
            className={`auth-tab ${!isRegisterMode ? 'active' : ''}`}
            onClick={() => {
              setIsRegisterMode(false);
              setError('');
            }}
          >
            <UserCheck size={16} /> Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${isRegisterMode ? 'active' : ''}`}
            onClick={() => {
              setIsRegisterMode(true);
              setError('');
            }}
          >
            <UserPlus size={16} /> Create Account
          </button>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success">
            <UserCheck size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {!isRegisterMode ? (
          /* Sign In Form */
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="search-input-wrapper">
                <Mail size={16} />
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="search-input-wrapper">
                <Lock size={16} />
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>
        ) : (
          /* Register New Account Form */
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="search-input-wrapper">
                <User size={16} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="search-input-wrapper">
                <Mail size={16} />
                <input
                  type="email"
                  className="form-control"
                  placeholder="newuser@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="search-input-wrapper">
                <Lock size={16} />
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Assign Role Position</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="SALES">SALES — Client CRM & Sales Orders</option>
                <option value="WAREHOUSE">WAREHOUSE — Products & Stock Log</option>
                <option value="ACCOUNTS">ACCOUNTS — Financial Vouchers</option>
                <option value="ADMIN">ADMIN — Super Administrator</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Register New Account'}
            </button>
          </form>
        )}

        {/* Demo Auto-fill Section */}
        <div className="demo-credentials-section">
          <p className="demo-title"><Shield size={14} /> Quick Demo Account Auto-Fill</p>
          <div className="demo-buttons">
            <button type="button" onClick={() => handleQuickLogin('ADMIN')} className="demo-btn admin">
              ADMIN
            </button>
            <button type="button" onClick={() => handleQuickLogin('SALES')} className="demo-btn sales">
              SALES
            </button>
            <button type="button" onClick={() => handleQuickLogin('WAREHOUSE')} className="demo-btn warehouse">
              WAREHOUSE
            </button>
            <button type="button" onClick={() => handleQuickLogin('ACCOUNTS')} className="demo-btn accounts">
              ACCOUNTS
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top right, #1e1b4b, #070913);
          padding: 20px;
        }

        .login-card {
          width: 100%;
          max-width: 460px;
          padding: 36px 32px;
          border-color: rgba(99, 102, 241, 0.35);
          box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.2);
        }

        .login-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .brand-logo {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        }

        .login-header h1 {
          font-size: 1.85rem;
          color: #ffffff;
        }

        .auth-tab-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          background: #0b0f19;
          padding: 4px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 24px;
        }

        .auth-tab {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 9px;
          font-size: 0.85rem;
          font-weight: 700;
          border: none;
          background: transparent;
          color: #94a3b8;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .auth-tab.active {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
        }

        .demo-credentials-section {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .demo-title {
          font-size: 0.75rem;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .demo-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .demo-btn {
          padding: 9px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 800;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #0b0f19;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .demo-btn.admin { color: #a5b4fc; }
        .demo-btn.sales { color: #6ee7b7; }
        .demo-btn.warehouse { color: #fcd34d; }
        .demo-btn.accounts { color: #7dd3fc; }

        .demo-btn:hover {
          background: #121827;
          border-color: rgba(99, 102, 241, 0.4);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};
