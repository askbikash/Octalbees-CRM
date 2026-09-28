import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Globe, Loader2, Plus, Edit, Trash2, Mail, Phone, User, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { DetailSkeleton } from '../components/ui/Skeleton';

const CollegeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  
  const [college, setCollege] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    fetchCollege();
    fetchContacts();
  }, [id]);

  const fetchCollege = async () => {
    try {
      const res = await api.get(`/colleges/${id}`);
      setCollege(res.data.data);
    } catch (error) {
      console.error('Failed to fetch college', error);
      toast.error('Failed to load college details.');
      navigate('/colleges');
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await api.get(`/colleges/${id}/contacts`);
      setContacts(res.data.data);
    } catch (error) {
      console.error('Failed to fetch contacts', error);
    } finally {
      setLoading(false);
    }
  };

  const openContactModal = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      reset(contact);
    } else {
      setEditingContact(null);
      reset({ name: '', designation: '', email: '', phone: '', is_primary: false });
    }
    setIsModalOpen(true);
  };

  const onSubmitContact = async (data) => {
    try {
      if (editingContact) {
        await api.put(`/colleges/contacts/${editingContact.id}`, data);
        toast.success('Contact updated successfully');
      } else {
        await api.post(`/colleges/${id}/contacts`, data);
        toast.success('Contact added successfully');
      }
      setIsModalOpen(false);
      fetchContacts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save contact');
    }
  };

  const deleteContact = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await api.delete(`/colleges/contacts/${contactId}`);
        toast.success('Contact deleted');
        fetchContacts();
      } catch (error) {
        toast.error('Failed to delete contact');
      }
    }
  };

  if (loading) {
    return <div className="p-6"><DetailSkeleton /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/colleges')}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-all hover:shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{college?.name}</h1>
            <span className="px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-600/10 text-purple-700 dark:text-orange-400 text-xs font-bold border border-purple-100 dark:border-orange-500/20">
              {college?.type || 'COLLEGE'}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-zinc-400">
            {college?.city && (
              <span className="flex items-center gap-1.5"><MapPin size={14} /> {college.city}, {college.state}</span>
            )}
            {college?.website && (
              <a href={college.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline">
                <Globe size={14} /> {college.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* College Info Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-purple-600 dark:text-orange-400" /> General Info
            </h3>
            
            <div className="space-y-4">
              {college?.email && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">Email</p>
                  <p className="text-sm text-slate-900 dark:text-white">{college.email}</p>
                </div>
              )}
              {college?.phone && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">Phone</p>
                  <p className="text-sm text-slate-900 dark:text-white">{college.phone}</p>
                </div>
              )}
              {college?.address && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">Address</p>
                  <p className="text-sm text-slate-900 dark:text-white">{college.address}</p>
                </div>
              )}
              {college?.notes && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">Notes</p>
                  <p className="text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl">{college.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contacts Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
            <div className="p-6 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-950/30">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <User size={16} className="text-purple-600 dark:text-orange-400" /> Key Contacts
              </h3>
              <button 
                onClick={() => openContactModal()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm shadow-purple-500/25 dark:shadow-orange-500/25"
              >
                <Plus size={16} /> Add Contact
              </button>
            </div>
            
            <div className="flex-1 p-6">
              {contacts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-zinc-500 py-12">
                  <User size={48} className="mb-4 opacity-20" />
                  <p className="text-sm font-medium">No contacts added yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {contacts.map(contact => (
                    <div key={contact.id} className="relative p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30 hover:border-purple-300 dark:hover:border-orange-500/30 transition-all group">
                      
                      {contact.is_primary && (
                        <div className="absolute -top-2 -right-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-500/20">
                          <CheckCircle2 size={12} /> Primary
                        </div>
                      )}

                      <h4 className="font-bold text-slate-900 dark:text-white pr-6">{contact.name}</h4>
                      {contact.designation && <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{contact.designation}</p>}
                      
                      <div className="mt-4 space-y-2">
                        {contact.email && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-300">
                            <Mail size={14} className="text-slate-400" /> {contact.email}
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-300">
                            <Phone size={14} className="text-slate-400" /> {contact.phone}
                          </div>
                        )}
                      </div>

                      <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openContactModal(contact)} className="p-1.5 bg-white dark:bg-zinc-800 rounded-lg text-slate-500 hover:text-purple-600 dark:hover:text-orange-400 border border-slate-200 dark:border-zinc-700 shadow-sm">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => deleteContact(contact.id)} className="p-1.5 bg-white dark:bg-zinc-800 rounded-lg text-slate-500 hover:text-red-600 border border-slate-200 dark:border-zinc-700 shadow-sm">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-950/30">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingContact ? 'Edit Contact' : 'Add Contact'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 p-2 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmitContact)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Name <span className="text-red-500">*</span></label>
                <input 
                  {...register('name', { required: 'Name is required' })} 
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                  placeholder="e.g. Dr. Jane Smith"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Designation</label>
                <input 
                  {...register('designation')} 
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                  placeholder="e.g. Head of Department, Training Placement Officer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Email</label>
                  <input 
                    type="email"
                    {...register('email')} 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Phone</label>
                  <input 
                    {...register('phone')} 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 focus:border-purple-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-orange-500/20 text-slate-900 dark:text-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input 
                  type="checkbox" 
                  id="is_primary" 
                  {...register('is_primary')} 
                  className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="is_primary" className="text-sm font-medium text-slate-700 dark:text-zinc-300 cursor-pointer">
                  Set as Primary Contact
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-zinc-300 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 dark:bg-orange-500 dark:hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingContact ? 'Update' : 'Add Contact')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CollegeDetails;
