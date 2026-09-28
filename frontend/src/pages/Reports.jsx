import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Users, Target, ArrowDown, ArrowUp,
  Calendar, Download, Filter, Loader2, Building2, Award, Zap,
  PieChart as PieChartIcon, Activity, ChevronDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Area, AreaChart,
  Treemap
} from 'recharts';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const ACCENT_COLORS = ['#8b5cf6', '#f97316', '#10b981', '#3b82f6', '#ec4899', '#f43f5e', '#14b8a6', '#6366f1', '#eab308'];
const FUNNEL_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#5b21b6', '#10b981'];

const STATUS_LABELS = {
  NEW: 'New', CONTACTED: 'Contacted', INTERESTED: 'Interested',
  FOLLOW_UP: 'Follow Up', MEETING_SCHEDULED: 'Meeting', NEGOTIATION: 'Negotiation',
  CONVERTED: 'Converted', NOT_INTERESTED: 'Not Interested', LOST: 'Lost'
};

const SOURCE_LABELS = {
  WEBSITE: 'Website', INSTAGRAM: 'Instagram', LINKEDIN: 'LinkedIn',
  WHATSAPP: 'WhatsApp', COLLEGE_OUTREACH: 'College Outreach',
  STUDENT_COMMUNITY: 'Student Community', REFERRAL: 'Referral',
  GOOGLE: 'Google', ADVERTISEMENT: 'Ads', EVENT: 'Event', OTHER: 'Other'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl shadow-xl border border-slate-200 dark:border-zinc-700 text-sm">
      <p className="font-bold text-slate-700 dark:text-zinc-200 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-2" style={{ color: entry.color }}>
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }}></span>
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const toast = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async (from, to) => {
    try {
      setLoading(true);
      let query = '/dashboard/reports?';
      if (from) query += `from=${from}&`;
      if (to) query += `to=${to}&`;
      const res = await api.get(query);
      setData(res.data.data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = () => {
    fetchReports(dateRange.from, dateRange.to);
  };

  const handleClearFilter = () => {
    setDateRange({ from: '', to: '' });
    fetchReports();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="text-purple-600 dark:text-orange-400" /> Reports & Analytics
            </h1>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-24 mb-3"></div>
              <div className="h-8 bg-slate-200 dark:bg-zinc-800 rounded w-16"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 h-80 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-40 mb-4"></div>
              <div className="h-full bg-slate-100 dark:bg-zinc-800/50 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, funnelData, bdePerformance, sourceEffectiveness, weeklyTrends, monthlyTrends, collegeData } = data;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'performance', label: 'Team Performance', icon: Award },
    { id: 'sources', label: 'Lead Sources', icon: Target },
    { id: 'colleges', label: 'College Analytics', icon: Building2 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-purple-600 dark:text-orange-400" />
            Reports & Analytics
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1 text-sm">Data-driven insights to grow your pipeline.</p>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-zinc-800 border-0 text-slate-700 dark:text-zinc-300 outline-none"
            />
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-zinc-800 border-0 text-slate-700 dark:text-zinc-300 outline-none"
            />
            <button onClick={handleDateFilter} className="px-3 py-2 text-sm font-bold text-white bg-purple-600 dark:bg-orange-500 rounded-lg hover:opacity-90 transition-opacity">
              <Filter size={14} />
            </button>
          </div>
          {(dateRange.from || dateRange.to) && (
            <button onClick={handleClearFilter} className="text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Users size={22} />
            </div>
          </div>
          <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium mb-0.5">Total Leads</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.totalLeads}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={22} />
            </div>
          </div>
          <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium mb-0.5">Converted</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summary.totalConverted}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
              <ArrowDown size={22} />
            </div>
          </div>
          <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium mb-0.5">Lost / Not Interested</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.totalLost}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Zap size={22} />
            </div>
          </div>
          <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium mb-0.5">Conversion Rate</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{summary.avgConversionRate}%</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex p-1 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm w-fit overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-purple-600 dark:bg-orange-500 text-white shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Funnel */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Target size={18} className="text-purple-500 dark:text-orange-400" /> Conversion Funnel
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">Lead progression through pipeline stages</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={funnelData.map(d => ({ ...d, status: STATUS_LABELS[d.status] || d.status }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-10" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="status" tick={{ fontSize: 11, fill: '#94a3b8' }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {funnelData.map((_, i) => (
                    <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Trends */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" /> Monthly Trends
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">Lead intake & conversions over the last 6 months</p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradConverted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-10" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="leads" name="New Leads" stroke="#8b5cf6" fill="url(#gradLeads)" strokeWidth={2} />
                <Area type="monotone" dataKey="converted" name="Converted" stroke="#10b981" fill="url(#gradConverted)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Trends */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Calendar size={18} className="text-blue-500" /> Weekly Lead Trends
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">Lead volume over the last 12 weeks</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-10" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="leads" name="New Leads" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="converted" name="Converted" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ===== TEAM PERFORMANCE TAB ===== */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award size={18} className="text-yellow-500" /> BDE Leaderboard
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Team member performance ranked by conversions</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">#</th>
                    <th className="px-6 py-4 font-semibold">Team Member</th>
                    <th className="px-6 py-4 font-semibold text-center">Leads</th>
                    <th className="px-6 py-4 font-semibold text-center">Converted</th>
                    <th className="px-6 py-4 font-semibold text-center">Conv. Rate</th>
                    <th className="px-6 py-4 font-semibold text-center">Follow-Ups</th>
                    <th className="px-6 py-4 font-semibold">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                  {bdePerformance.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-slate-500 dark:text-zinc-400">
                        No team member data available.
                      </td>
                    </tr>
                  ) : (
                    bdePerformance.map((bde, i) => (
                      <tr key={bde.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (
                            <span className="text-slate-400 dark:text-zinc-500 font-mono">{i + 1}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                              {bde.name.charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">{bde.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-zinc-300">{bde.totalLeads}</td>
                        <td className="px-6 py-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{bde.convertedLeads}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            bde.conversionRate >= 50 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            bde.conversionRate >= 20 ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {bde.conversionRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600 dark:text-zinc-300 font-medium">{bde.followUpsDone}</td>
                        <td className="px-6 py-4">
                          <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                              style={{ width: `${Math.min(bde.conversionRate, 100)}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== LEAD SOURCES TAB ===== */}
      {activeTab === 'sources' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Source Pie Chart */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <PieChartIcon size={18} className="text-pink-500" /> Lead Source Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">Where are your leads coming from?</p>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceEffectiveness.map(s => ({ ...s, name: SOURCE_LABELS[s.source] || s.source }))}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={110}
                  paddingAngle={3}
                  dataKey="total"
                >
                  {sourceEffectiveness.map((_, i) => (
                    <Cell key={i} fill={ACCENT_COLORS[i % ACCENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value) => <span className="text-xs text-slate-600 dark:text-zinc-400">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Source Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target size={18} className="text-blue-500" /> Source Conversion Rates
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Source</th>
                    <th className="px-6 py-3 font-semibold text-center">Total</th>
                    <th className="px-6 py-3 font-semibold text-center">Converted</th>
                    <th className="px-6 py-3 font-semibold text-center">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                  {sourceEffectiveness.sort((a, b) => b.total - a.total).map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: ACCENT_COLORS[i % ACCENT_COLORS.length] }}></span>
                        {SOURCE_LABELS[s.source] || s.source}
                      </td>
                      <td className="px-6 py-3 text-center font-medium text-slate-600 dark:text-zinc-300">{s.total}</td>
                      <td className="px-6 py-3 text-center font-bold text-emerald-600 dark:text-emerald-400">{s.converted}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          s.conversionRate >= 50 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          s.conversionRate >= 20 ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>{s.conversionRate}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== COLLEGE ANALYTICS TAB ===== */}
      {activeTab === 'colleges' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 size={18} className="text-indigo-500" /> College-wise Performance
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Top 15 colleges by lead volume</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">#</th>
                    <th className="px-6 py-4 font-semibold">College</th>
                    <th className="px-6 py-4 font-semibold">City</th>
                    <th className="px-6 py-4 font-semibold text-center">Leads</th>
                    <th className="px-6 py-4 font-semibold text-center">Converted</th>
                    <th className="px-6 py-4 font-semibold text-center">Conv. Rate</th>
                    <th className="px-6 py-4 font-semibold">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                  {collegeData.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-slate-500 dark:text-zinc-400">
                        <Building2 size={32} className="mx-auto mb-2 opacity-40" />
                        No college data available. Link leads to colleges to see analytics.
                      </td>
                    </tr>
                  ) : (
                    collegeData.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4 text-slate-400 dark:text-zinc-500 font-mono text-sm">{i + 1}</td>
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{c.collegeName}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-zinc-400 text-sm">{c.city || '—'}</td>
                        <td className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-zinc-300">{c.totalLeads}</td>
                        <td className="px-6 py-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{c.converted}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            c.conversionRate >= 50 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            c.conversionRate >= 20 ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {c.conversionRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                              style={{ width: `${Math.min(c.conversionRate, 100)}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
