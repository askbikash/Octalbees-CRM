import React, { useState } from 'react';
import { Calendar, Phone, Mail, Clock, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const statuses = [
  'NEW', 'CONTACTED', 'INTERESTED', 'FOLLOW_UP', 'NEGOTIATION', 'CONVERTED', 'LOST'
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

const SortableLeadCard = ({ lead, onLeadClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { type: 'Lead', lead }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onLeadClick(lead)}
      className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-slate-200 dark:border-zinc-700/80 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all cursor-grab active:cursor-grabbing group relative z-10"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-slate-800 dark:text-zinc-100 line-clamp-1">{lead.name}</h4>
        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      
      {lead.organization && (
        <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3 line-clamp-1">
          {lead.organization.name}
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
  );
};

const LeadKanbanBoard = ({ leads, onStatusChange, onLeadClick }) => {
  const [activeLead, setActiveLead] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const lead = leads.find(l => l.id === active.id);
    setActiveLead(lead);
  };

  const handleDragEnd = (event) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Dropped on a column directly
    if (statuses.includes(overId)) {
      onStatusChange(activeId, overId);
      return;
    }

    // Dropped on another lead card
    const overLead = leads.find(l => l.id === overId);
    if (overLead) {
      onStatusChange(activeId, overLead.status);
    }
  };

  const leadsByStatus = statuses.reduce((acc, status) => {
    acc[status] = leads.filter(lead => lead.status === status);
    return acc;
  }, {});

  // The sortable context requires an array of IDs
  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 h-[calc(100vh-250px)]">
        {statuses.map(status => {
          const columnLeads = leadsByStatus[status];
          const leadIds = columnLeads.map(l => l.id);

          return (
            <div 
              key={status} 
              id={status}
              className="flex-shrink-0 w-80 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700/50 flex flex-col"
            >
              <div className="p-4 border-b border-slate-200 dark:border-zinc-700/50 flex justify-between items-center bg-white dark:bg-zinc-900 rounded-t-xl sticky top-0 z-20">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full border-2 ${statusConfig[status].color}`}></div>
                  <h3 className="font-semibold text-slate-800 dark:text-zinc-100">
                    {statusConfig[status].label}
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                  {columnLeads.length}
                </span>
              </div>

              {/* Using a drop target that spans the whole column area */}
              <SortableContext id={status} items={leadIds} strategy={verticalListSortingStrategy}>
                <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[150px]">
                  {columnLeads.map(lead => (
                    <SortableLeadCard key={lead.id} lead={lead} onLeadClick={onLeadClick} />
                  ))}
                  
                  {columnLeads.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-200 dark:border-zinc-700/50 rounded-lg">
                      <p className="text-xs text-slate-400 dark:text-zinc-500">Drop leads here</p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>
      <DragOverlay>
        {activeLead ? (
          <div className="opacity-80 rotate-2 scale-105 shadow-2xl">
            <SortableLeadCard lead={activeLead} onLeadClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default LeadKanbanBoard;
