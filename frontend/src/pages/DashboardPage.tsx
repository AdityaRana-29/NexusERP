import React, { useEffect, useState } from 'react';
import { StatsCard } from '../components/StatsCard';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Users, 
  Package, 
  AlertTriangle, 
  FileCheck2, 
  ArrowRight, 
  Plus, 
  Sparkles,
  TrendingUp,
  Boxes,
  Layers
} from 'lucide-react';
import { customerApi } from '../services/customerApi';
import { productApi } from '../services/productApi';
import { challanApi } from '../services/challanApi';
import { Customer, Product, Challan } from '../types';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [recentChallans, setRecentChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [custRes, prodRes, lowStockRes, challanRes] = await Promise.all([
          customerApi.getAll({ limit: 1 }),
          productApi.getAll({ limit: 1 }),
          productApi.getAll({ lowStockOnly: true, limit: 5 }),
          challanApi.getAll({ limit: 5 }),
        ]);

        if (custRes.success) setTotalCustomers(custRes.data.meta.total);
        if (prodRes.success) setTotalProducts(prodRes.data.meta.total);
        if (lowStockRes.success) setLowStockProducts(lowStockRes.data.products);
        if (challanRes.success) setRecentChallans(challanRes.data.challans);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="card"><p style={{ padding: '24px', color: '#94a3b8' }}>Loading Executive Dashboard...</p></div>;
  }

  return (
    <div>
      {/* High Impact Hero Banner */}
      <div className="hero-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-primary">
              <Sparkles size={12} /> Operational Command Hub
            </span>
          </div>
          <h1 style={{ fontSize: '1.9rem', color: '#ffffff', margin: '4px 0 8px 0' }}>
            Welcome back, {user?.name}! 👋
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.925rem', maxWidth: '600px' }}>
            Your wholesale distribution network is currently operational. Monitor live inventory movements, customer CRM leads & dispatch vouchers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/challans" className="btn btn-primary">
            <Plus size={16} /> New Sales Challan
          </Link>
          <Link to="/customers" className="btn btn-secondary">
            <Users size={16} /> CRM Directory
          </Link>
        </div>
      </div>

      <div className="grid-stats">
        <StatsCard
          title="Total Active Customers"
          value={totalCustomers}
          icon={<Users size={24} />}
          color="primary"
          trend="↑ 14% growth this month"
        />
        <StatsCard
          title="Catalog Product SKUs"
          value={totalProducts}
          icon={<Package size={24} />}
          color="accent"
        />
        <StatsCard
          title="Low Stock Alerts"
          value={lowStockProducts.length}
          icon={<AlertTriangle size={24} />}
          color="danger"
          trend={lowStockProducts.length > 0 ? "Requires restock" : "Inventory healthy"}
        />
        <StatsCard
          title="Recent Sales Challans"
          value={recentChallans.length}
          icon={<FileCheck2 size={24} />}
          color="success"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '28px' }}>
        {/* Low Stock Alert Section with Progress Bars */}
        <div className="card">
          <div className="page-header" style={{ marginBottom: '20px' }}>
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem' }}>
                <AlertTriangle size={20} color="#f43f5e" /> Low Stock Inventory Alerts
              </h3>
              <p style={{ fontSize: '0.775rem', color: '#94a3b8' }}>Products below minimum alert threshold</p>
            </div>
            <Link to="/products" className="btn btn-secondary btn-sm">
              Manage Catalog <ArrowRight size={14} />
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <p style={{ color: '#34d399', fontWeight: 600, fontSize: '0.9rem' }}>
                🎉 Excellent! All product inventory stock levels are healthy.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product & SKU</th>
                    <th>Current Stock</th>
                    <th>Min Alert</th>
                    <th>Stock Health Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((product) => {
                    const percentage = Math.min(100, Math.round((product.currentStock / (product.minimumStockAlert * 2)) * 100));
                    return (
                      <tr key={product.id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{product.productName}</div>
                          <code style={{ fontSize: '0.725rem', color: '#818cf8' }}>{product.SKU}</code>
                        </td>
                        <td>
                          <span className="badge badge-danger">{product.currentStock} units</span>
                        </td>
                        <td style={{ color: '#94a3b8' }}>{product.minimumStockAlert}</td>
                        <td>
                          <div className="stock-bar-wrapper">
                            <div className="stock-bar-track">
                              <div className="stock-bar-fill danger" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: '#f43f5e' }}>Critical Stock</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Sales Challans Feed */}
        <div className="card">
          <div className="page-header" style={{ marginBottom: '20px' }}>
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem' }}>
                <FileCheck2 size={20} color="#6366f1" /> Recent Sales Dispatch Challans
              </h3>
              <p style={{ fontSize: '0.775rem', color: '#94a3b8' }}>Latest wholesale orders & vouchers</p>
            </div>
            <Link to="/challans" className="btn btn-secondary btn-sm">
              All Challans <ArrowRight size={14} />
            </Link>
          </div>

          {recentChallans.length === 0 ? (
            <p style={{ color: '#94a3b8', padding: '16px' }}>No sales challans recorded yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Challan #</th>
                    <th>Customer</th>
                    <th>Qty</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentChallans.map((challan) => (
                    <tr key={challan.id}>
                      <td>
                        <strong style={{ color: '#818cf8' }}>{challan.challanNumber}</strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{challan.customer?.customerName}</div>
                        <div style={{ fontSize: '0.725rem', color: '#94a3b8' }}>{challan.customer?.businessName}</div>
                      </td>
                      <td>{challan.totalQuantity} units</td>
                      <td style={{ fontWeight: 700, color: '#f8fafc' }}>₹{challan.totalAmount.toFixed(2)}</td>
                      <td>
                        <StatusBadge status={challan.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
