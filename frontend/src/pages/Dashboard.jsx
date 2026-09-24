import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, CalendarDays, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api';

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm">
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-zinc-800 flex items-center justify-center text-purple-600 dark:text-orange-400">
        <Icon size={24} />
      </div>
      {trend && (
        <span className={`flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full border ${trend.colorClass}`}>
          <TrendingUp size={14} /> {trend.value}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-slate-500 dark:text-zinc-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const CHART_COLORS = ['#8b5cf6', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#f43f5e', '#14b8a6', '#6366f1'];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="animate-spin mb-4 text-purple-500 dark:text-orange-500" size={32} />
        <p className="font-medium text-lg">Loading Dashboard Data...</p>
      </div>
    );
  }

  if (!stats) return null;

  const { kpis, charts } = stats;

  const handleExport = async () => {
    try {
      const response = await api.get('/leads/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export leads', error);
      alert('Failed to export leads. Please try again.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1">Here is what's happening with your leads today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="px-5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-2"
          >
            Export Report
          </button>
          <button 
            onClick={() => navigate('/leads')}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-zinc-950 text-white rounded-xl font-bold transition-colors shadow-sm shadow-purple-600/20 dark:shadow-orange-500/20"
          >
            Add New Lead
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Leads" 
          value={kpis.totalLeads} 
          icon={Users} 
        />
        <StatCard 
          title="Converted Leads" 
          value={kpis.convertedLeads} 
          icon={TrendingUp} 
          trend={{ value: `${((kpis.convertedLeads / (kpis.totalLeads || 1)) * 100).toFixed(1)}%`, colorClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20" }} 
        />
        <StatCard 
          title="Pending Follow-ups" 
          value={kpis.pendingFollowUps} 
          icon={CalendarDays} 
        />
        <StatCard 
          title="Overdue Follow-ups" 
          value={kpis.overdueFollowUps} 
          icon={AlertTriangle} 
          trend={kpis.overdueFollowUps > 0 ? { value: "Action Required", colorClass: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20" } : null}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Leads by Status */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Leads by Pipeline Status</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.statusData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tw-prose-invert)' }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                  {charts.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Pie Chart: Leads by Source */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Lead Sources</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {charts.sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
