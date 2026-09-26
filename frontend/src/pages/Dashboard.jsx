import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { Users, CalendarDays, TrendingUp, AlertTriangle, Loader2, Download, Plus, Phone, Mail, Clock, CheckCircle2, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api';

const StatCard = ({ title, value, icon: Icon, trend, accent }) => (
  <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent || 'bg-purple-50 dark:bg-zinc-800 text-purple-600 dark:text-orange-400'}`}>
        <Icon size={22} />
      </div>
      {trend && (
        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${trend.colorClass}`}>
          {trend.icon && <trend.icon size={12} />} {trend.value}
        </span>
      )}
    </div>
    <h3 className="text-slate-500 dark:text-zinc-400 text-sm font-medium mb-0.5">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
  </div>
);

const CHART_COLORS = ['#8b5cf6', '#f97316', '#10b981', '#3b82f6', '#ec4899', '#f43f5e', '#14b8a6', '#6366f1', '#eab308'];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
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
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

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
      toast.success('Leads exported successfully!');
    } catch (error) {
      console.error('Failed to export leads', error);
      toast.error('Failed to export leads. Please try again.');
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!stats) return null;

  const { kpis, charts, todaysFollowUps, recentActivities } = stats;

  const getActivityIcon = (type) => {
    switch (type) {
      case 'CALL': return <Phone size={14} />;
      case 'EMAIL': return <Mail size={14} />;
      case 'WHATSAPP': return <MessageCircle size={14} />;
      case 'STATUS_CHANGE': return <ArrowRight size={14} />;
      case 'FOLLOW_UP_COMPLETED': return <CheckCircle2 size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1">Here's what's happening with your leads today.</p>
        </div>
        <div className="flex items-center gap-3">
          {user.role === 'ADMIN' && (
            <button
              onClick={handleExport}
              className="px-5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-2"
            >
              <Download size={16} />
              Export Report
            </button>
          )}
          <button
            onClick={() => navigate('/leads')}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 dark:text-white text-white rounded-xl font-bold transition-colors shadow-sm shadow-purple-600/20 dark:shadow-purple-500/20 flex items-center gap-2"
          >
            <Plus size={16} />
            Add New Lead
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Leads"
          value={kpis.totalLeads}
          icon={Users}
        />
        <StatCard
          title="Converted"
          value={kpis.convertedLeads}
          icon={TrendingUp}
          accent="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          trend={{ value: `${((kpis.convertedLeads / (kpis.totalLeads || 1)) * 100).toFixed(0)}%`, icon: TrendingUp, colorClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20" }}
        />
        <StatCard
          title="New This Week"
          value={kpis.newLeadsThisWeek}
          icon={Sparkles}
          accent="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Pending Follow-ups"
          value={kpis.pendingFollowUps}
          icon={CalendarDays}
          accent="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="Overdue"
          value={kpis.overdueFollowUps}
          icon={AlertTriangle}
          accent="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
          trend={kpis.overdueFollowUps > 0 ? { value: "Action Needed", colorClass: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20" } : null}
        />
      </div>

      {/* Middle Row: Today's Tasks + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Follow-ups */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays size={18} className="text-purple-600 dark:text-orange-400" />
              Today's Follow-ups
            </h3>
            <button onClick={() => navigate('/followups')} className="text-sm font-bold text-purple-600 dark:text-orange-400 hover:underline">View All</button>
          </div>
          <div className="flex-1 divide-y divide-slate-100 dark:divide-zinc-800 max-h-[320px] overflow-y-auto">
            {todaysFollowUps && todaysFollowUps.length > 0 ? todaysFollowUps.map(fu => (
              <div key={fu.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors" onClick={() => navigate(`/leads/${fu.lead?.id}`)}>
                <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-zinc-800 text-purple-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                  {fu.type === 'CALL' ? <Phone size={16} /> : fu.type === 'EMAIL' ? <Mail size={16} /> : fu.type === 'WHATSAPP' ? <MessageCircle size={16} /> : <CalendarDays size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{fu.lead?.name}</p>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 truncate">{fu.lead?.lead_code} • {fu.type} • {new Date(fu.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">Pending</span>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-zinc-600">
                <CheckCircle2 size={32} className="mb-2 text-emerald-400" />
                <p className="font-semibold">All clear for today!</p>
                <p className="text-xs mt-1">No follow-ups scheduled.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-purple-600 dark:text-orange-400" />
              Recent Activity
            </h3>
          </div>
          <div className="flex-1 divide-y divide-slate-100 dark:divide-zinc-800 max-h-[320px] overflow-y-auto">
            {recentActivities && recentActivities.length > 0 ? recentActivities.map(act => (
              <div key={act.id} className="px-5 py-3 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center shrink-0 mt-0.5">
                  {getActivityIcon(act.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                    <span className="font-bold">{act.user?.name || 'System'}</span>{' '}
                    <span className="text-slate-500 dark:text-zinc-400">{act.description}</span>{' '}
                    <span className="font-semibold text-purple-600 dark:text-orange-400 cursor-pointer hover:underline" onClick={() => navigate(`/leads/${act.lead_id}`)}>{act.lead?.name}</span>
                  </p>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{formatTime(act.created_at)}</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-zinc-600">
                <Clock size={32} className="mb-2" />
                <p className="font-semibold">No activity yet</p>
                <p className="text-xs mt-1">Start working on leads to see activity here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Leads by Status */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col h-[380px]">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Leads by Pipeline Status</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.statusData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)', fontSize: '13px' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {charts.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Leads by Source */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col h-[380px]">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Lead Sources</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {charts.sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)', fontSize: '13px' }}
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
