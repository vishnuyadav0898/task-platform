import { useState } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { LogOut, Folder, Plus, LayoutDashboard, ChevronRight, Bell, Trash2 } from 'lucide-react';
import { WorkspaceModal, ProjectModal } from '../components/Modals';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { workspaceSlug, projectSlug } = useParams();

  const [isWorkspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isNotificationOpen, setNotificationOpen] = useState(false);

  const { data: workspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const { data } = await api.get('/workspaces');
      const normalizedData = data.data || data;
      if (normalizedData.length > 0 && !workspaceSlug && location.pathname === '/') {
        navigate(`/${normalizedData[0].slug}`);
      }
      return normalizedData;
    }
  });

  const { data: projects } = useQuery({
    queryKey: ['projects', workspaceSlug],
    queryFn: async () => {
      if (!workspaceSlug) return [];
      const { data } = await api.get(`/workspaces/${workspaceSlug}/projects`);
      return data.data || data;
    },
    enabled: !!workspaceSlug
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications');
      return data;
    },
    refetchInterval: 60000 // Poll every minute
  });

  const deleteWorkspace = useMutation({
    mutationFn: async (id: number) => api.delete(`/workspaces/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      navigate('/');
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to delete workspace');
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    }
  });

  const deleteProject = useMutation({
    mutationFn: async ({ wSlug, pSlug }: { wSlug: string, pSlug: string }) => api.delete(`/workspaces/${wSlug}/projects/${pSlug}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceSlug] });
      navigate(`/${workspaceSlug}`);
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to delete project');
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceSlug] });
    }
  });

  const inviteMember = useMutation({
    mutationFn: async (email: string) => api.post(`/workspaces/${workspaceSlug}/members`, { email, role: 'MEMBER' }),
    onSuccess: () => {
      setInviteModalOpen(false);
      setInviteEmail('');
      alert('Invite sent successfully!');
    },
    onError: (err: any) => alert(err.response?.data?.error || 'Failed to invite')
  });

  const acceptInvite = useMutation({
    mutationFn: async (wSlug: string) => api.post(`/workspaces/${wSlug}/members/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      alert('Invite accepted!');
    },
    onError: (err: any) => alert(err.response?.data?.error || 'Failed to accept invite')
  });

  const markNotificationsRead = useMutation({
    mutationFn: async () => api.put('/notifications/readAll'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const clearNotifications = useMutation({
    mutationFn: async () => api.delete('/notifications/clearAll'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const currentProjectName = projects?.find((p: any) => p.slug === projectSlug)?.name;
  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden selection:bg-indigo-200">
      
      {/* Sleek Sidebar */}
      <aside className="w-72 bg-[#0F172A] text-slate-300 flex flex-col border-r border-slate-800 relative z-20 shadow-2xl">
        <div className="p-6 text-2xl font-black text-white flex justify-between items-center tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          CollabFlow
          <button onClick={handleLogout} className="text-slate-400 hover:text-pink-400 transition-colors duration-300" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
              <LayoutDashboard size={12} /> Workspaces
            </h3>
            <button 
              onClick={() => setWorkspaceModalOpen(true)}
              className="p-1 rounded-md bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" title="Create Workspace">
              <Plus size={14} />
            </button>
          </div>
          
          <ul className="space-y-2 mb-8">
            {workspaces?.map((ws: any) => (
              <li key={ws.id} className="group relative">
                <button
                  onClick={() => navigate(`/${ws.slug}`)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl flex items-center justify-between transition-all duration-300 font-medium ${
                    workspaceSlug === ws.slug 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 translate-x-1' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Folder size={18} className={workspaceSlug === ws.slug ? 'text-indigo-200' : 'text-slate-500'} />
                    {ws.name}
                  </div>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); if (confirm('Delete this workspace?')) deleteWorkspace.mutate(ws.id); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-red-500/10 text-red-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>

          {workspaceSlug && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Projects</h3>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setInviteModalOpen(true)}
                    className="px-2 py-1 rounded-md bg-indigo-500/20 text-indigo-400 hover:text-white hover:bg-indigo-500 transition-colors text-[10px] font-bold" title="Invite Member">
                    INVITE
                  </button>
                  <button 
                    onClick={() => setProjectModalOpen(true)}
                    className="p-1 rounded-md bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" title="Add Project">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <ul className="space-y-1 border-l border-slate-800 ml-2 pl-2">
                {projects?.map((proj: any) => (
                  <li key={proj.id} className="group relative">
                    <button 
                      onClick={() => navigate(`/${workspaceSlug}/project/${proj.slug}`)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center justify-between ${
                        projectSlug === proj.slug 
                          ? 'bg-slate-800 text-white font-semibold' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 block"></span>
                        {proj.name}
                      </div>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); if (confirm('Delete project?')) deleteProject.mutate({ wSlug: workspaceSlug, pSlug: proj.slug }); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-red-500/10 text-red-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={12} />
                    </button>
                  </li>
                ))}
                {projects?.length === 0 && (
                  <li className="text-xs text-slate-500 px-3 py-2 italic">No projects yet.</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </aside>

      {/* Main App Area */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-300/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-300/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

        {/* Global Header */}
        <header className="h-16 bg-white/60 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-8 relative z-50 shrink-0">
          <div className="flex items-center text-sm font-medium text-slate-500 gap-2">
            <span className="hover:text-indigo-600 cursor-pointer transition-colors" onClick={() => navigate(`/${workspaceSlug}`)}>Workspace</span>
            {currentProjectName && (
              <>
                <ChevronRight size={14} />
                <span className="text-slate-800 font-semibold">{currentProjectName}</span>
              </>
            )}
          </div>
          
          <div className="relative">
            <button 
              onClick={() => { setNotificationOpen(!isNotificationOpen); if (!isNotificationOpen) markNotificationsRead.mutate(); }}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h4 className="font-bold text-slate-800">Notifications</h4>
                  {notifications?.length > 0 && (
                    <button 
                      onClick={() => clearNotifications.mutate()}
                      disabled={clearNotifications.isPending}
                      className="text-[10px] text-slate-500 hover:text-red-500 font-bold tracking-wider uppercase disabled:opacity-50 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications?.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">No notifications.</div>
                  ) : (
                    notifications?.map((n: any) => (
                      <div key={n.id} className={`p-4 border-b border-slate-50 text-sm ${n.isRead ? 'opacity-70' : 'bg-indigo-50/30'}`}>
                        <p className="text-slate-700">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{new Date(n.createdAt).toLocaleString()}</span>
                        {n.type === 'INVITE' && n.metadata?.workspaceSlug && (
                          <div className="mt-3">
                            <button 
                              onClick={() => {
                                acceptInvite.mutate(n.metadata.workspaceSlug);
                                setNotificationOpen(false);
                              }}
                              disabled={acceptInvite.isPending}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                            >
                              Accept Invite
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>
        
        {/* Render child routes */}
        <div className="flex-1 overflow-auto relative z-20 flex flex-col">
          <Outlet />
        </div>
      </main>

      <WorkspaceModal isOpen={isWorkspaceModalOpen} onClose={() => setWorkspaceModalOpen(false)} />
      {workspaceSlug && (
        <ProjectModal isOpen={isProjectModalOpen} onClose={() => setProjectModalOpen(false)} workspaceSlug={workspaceSlug} />
      )}

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Invite Member</h2>
            <p className="text-sm text-slate-500 mb-4">Invite a colleague to this workspace. They must have an account.</p>
            <input 
              type="email" 
              placeholder="Email address"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setInviteModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
              <button 
                onClick={() => inviteMember.mutate(inviteEmail)} 
                disabled={inviteMember.isPending || !inviteEmail}
                className="px-4 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg disabled:opacity-50"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
