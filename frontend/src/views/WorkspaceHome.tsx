import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { LayoutDashboard, FolderKanban } from 'lucide-react';

export default function WorkspaceHome() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const parsedWorkspaceId = workspaceId ? parseInt(workspaceId) : null;

  const { data: workspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const { data } = await api.get('/workspaces');
      return data;
    }
  });

  const { data: projects } = useQuery({
    queryKey: ['projects', parsedWorkspaceId],
    queryFn: async () => {
      if (!parsedWorkspaceId) return [];
      const { data } = await api.get(`/workspaces/${parsedWorkspaceId}/projects`);
      return data;
    },
    enabled: !!parsedWorkspaceId
  });

  const workspace = workspaces?.find((w: any) => w.id === parsedWorkspaceId);

  if (!workspace) return null;

  return (
    <div className="p-10 max-w-6xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">{workspace.name} Overview</h1>
        <p className="text-slate-500 mt-2 font-medium">Select a project to view its Kanban board.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200 border-dashed">
            <LayoutDashboard size={48} className="mx-auto text-indigo-300 mb-4" />
            <h2 className="text-2xl font-bold text-slate-700">No Projects Found</h2>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">Use the sidebar to create your first project.</p>
          </div>
        ) : (
          projects?.map((proj: any) => (
            <div 
              key={proj.id}
              onClick={() => navigate(`/${parsedWorkspaceId}/project/${proj.id}`)}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col"
            >
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors duration-300">
                <FolderKanban className="text-indigo-600 group-hover:text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{proj.name}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{proj.description || 'No description provided.'}</p>
              
              <div className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1 mt-auto">
                Go to Board &rarr;
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
