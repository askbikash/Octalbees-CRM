import React, { useState, useEffect } from 'react';
import { Mail, Search, CheckCircle2, Eye, MousePointerClick, Calendar, User, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

const EmailLogs = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/emails');
      setLogs(res.data.data);
    } catch (error) {
      toast.error('Failed to load email logs');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.subject.toLowerCase().includes(search.toLowerCase()) || 
    log.to_email.toLowerCase().includes(search.toLowerCase()) ||
    log.lead?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPENED': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
      case 'CLICKED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
      case 'BOUNCED': return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20';
      default: return 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border-slate-200 dark:border-zinc-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPENED': return <Eye size={14} className="mr-1" />;
      case 'CLICKED': return <MousePointerClick size={14} className="mr-1" />;
      case 'SENT': return <CheckCircle2 size={14} className="mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="text-purple-600 dark:text-orange-500" />
            Sent Emails
          </h1>
          <p className="text-slate-500 dark:text-zinc-400">Track delivery, opens, and clicks for all your outreach.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Search by subject, email, or lead name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-orange-500 transition-shadow"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-900/50 text-slate-500 dark:text-zinc-400 text-sm border-b border-slate-200 dark:border-zinc-800">
                <th className="p-4 font-semibold">Subject & Recipient</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Tracking</th>
                <th className="p-4 font-semibold">Sent By</th>
                <th className="p-4 font-semibold">Date Sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 dark:text-zinc-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-purple-500 dark:border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading emails...
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-500 dark:text-zinc-500">
                    <Mail size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium text-slate-700 dark:text-zinc-300">No emails found</p>
                    <p className="text-sm mt-1">Try adjusting your search or send some emails first.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group">
                    <td className="p-4">
                      <p className="font-semibold text-slate-900 dark:text-white mb-1">{log.subject}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-zinc-400">
                        <span>{log.to_email}</span>
                        {log.lead && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700"></span>
                            <Link to={`/leads/${log.lead_id}`} className="hover:text-purple-600 dark:hover:text-orange-400 flex items-center gap-1">
                              {log.lead.name}
                              <ArrowUpRight size={12} />
                            </Link>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(log.status)}`}>
                        {getStatusIcon(log.status)}
                        {log.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center" title="Opens">
                          <span className="text-xs text-slate-400 dark:text-zinc-500 mb-0.5"><Eye size={12}/></span>
                          <span className="font-semibold text-slate-700 dark:text-zinc-300">{log.open_count}</span>
                        </div>
                        <div className="flex flex-col items-center" title="Clicks">
                          <span className="text-xs text-slate-400 dark:text-zinc-500 mb-0.5"><MousePointerClick size={12}/></span>
                          <span className="font-semibold text-slate-700 dark:text-zinc-300">{log.click_count}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-300">
                        <User size={14} className="text-slate-400" />
                        {log.sender?.name || 'System'}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {format(new Date(log.sent_at), 'MMM d, yyyy h:mm a')}
                      </div>
                      {log.opened_at && (
                        <p className="text-xs text-blue-500 mt-1">
                          Opened: {format(new Date(log.opened_at), 'MMM d, h:mm a')}
                        </p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmailLogs;
