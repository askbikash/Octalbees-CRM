import React, { useState } from 'react';
import { Calendar, Phone, Mail, Clock, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';

const statuses = [
  'NEW',
  'CONTACTED',
  'INTERESTED',
  'FOLLOW_UP',
  'NEGOTIATION',
  'CONVERTED',
  'LOST'
];

const statusConfig = {
  NEW: { label: 'New', color: 'border-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  CONTACTED: { label: 'Contacted', color: 'border-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  INTERESTED: { label: 'Interested', color: 'border-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  FOLLOW_UP: { label: 'Follow Up', color: 'border-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
  NEGOTIATION: { label: 'Negotiation', color: 'border-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
  CONVERTED: { label: 'Converted', color: 'border-green-500', bg: 'bg-green-50 dark:bg-green-500/10' },
  LOST: { label: 'Lost', color: 'border-red-500', bg: 'bg-red-50 dark:bg-red-500/10' }
};

const LeadKanbanBoard = ({ leads, onStatusChange, onLeadClick }) => {
  const [draggedLead, setDraggedLead] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const handleDragStart = (e, lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      e.target.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('opacity-50');
    setDraggedLead(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverColumn(null);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (draggedLead && draggedLead.status !== newStatus) {
      onStatusChange(draggedLead.id, newStatus);
    }
  };

  const leadsByStatus = statuses.reduce((acc, status) => {
    acc[status] = leads.filter(lead => lead.status === status);
    return acc;
  }, {});

  return (
    <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 h-[calc(100vh-250px)]">
      {statuses.map(status => (
        <div 
          key={status} 
          className={`flex-shrink-0 w-80 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700/50 flex flex-col transition-colors ${dragOverColumn === status ? 'bg-slate-100 dark:bg-zinc-800 border-indigo-400 dark:border-indigo-500' : ''}`}
          onDragOver={(e) => handleDragOver(e, status)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, status)}
        >
          {/* Column Header */}
          <div className="p-4 border-b border-slate-200 dark:border-zinc-700/50 flex justify-between items-center bg-white dark:bg-zinc-900 rounded-t-xl sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full border-2 ${statusConfig[status].color}`}></div>
              <h3 className="font-semibold text-slate-800 dark:text-zinc-100">
                {statusConfig[status].label}
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
              {leadsByStatus[status].length}
            </span>
          </div>

          {/* Column Cards */}
          <div className="p-3 flex-1 overflow-y-auto space-y-3">
            {leadsByStatus[status].map(lead => (
              <div
                key={lead.id}
                draggable
                onDragStart={(e) => handleDragStart(e, lead)}
                onDragEnd={handleDragEnd}
                onClick={() => onLeadClick(lead)}
                className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-slate-200 dark:border-zinc-700/80 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all cursor-grab active:cursor-grabbing group relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-slate-800 dark:text-zinc-100 line-clamp-1">{lead.name}</h4>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
                
                {lead.college && (
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3 line-clamp-1">
                    {lead.college.name}
                  </p>
                )}

                <div className="space-y-2 mt-4">
                  {lead.email && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lead.phone}</span>
                    </div>
                  )}
                  {lead.next_follow_up_at && (
                    <div className="flex items-center gap-2 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 p-1.5 rounded-md mt-2 w-fit">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{format(new Date(lead.next_follow_up_at), 'MMM d, h:mm a')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {leadsByStatus[status].length === 0 && (
              <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-200 dark:border-zinc-700/50 rounded-lg">
                <p className="text-xs text-slate-400 dark:text-zinc-500">Drop leads here</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeadKanbanBoard;
