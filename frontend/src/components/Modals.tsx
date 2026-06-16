import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkspaceModal({ isOpen, onClose }: ModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', slug: '' });

  const mutation = useMutation({
    mutationFn: async () => api.post('/workspaces', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setForm({ name: '', slug: '' });
      onClose();
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">New Workspace</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Workspace Name</label>
            <input 
              type="text" 
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
              placeholder="e.g. Engineering Team" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">URL Slug</label>
            <input 
              type="text" 
              value={form.slug}
              onChange={e => setForm({...form, slug: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-slate-50 text-slate-500 outline-none" 
            />
          </div>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition-colors disabled:opacity-50">Create</button>
        </div>
      </div>
    </div>
  );
}

interface ProjectModalProps extends ModalProps {
  workspaceSlug: string;
}

export function ProjectModal({ isOpen, onClose, workspaceSlug }: ProjectModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const mutation = useMutation({
    mutationFn: async () => api.post(`/workspaces/${workspaceSlug}/projects`, { 
      name, 
      description,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceSlug] });
      setName('');
      setDescription('');
      onClose();
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">New Project</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
              placeholder="e.g. Q3 Roadmap" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none" 
              rows={3}
            />
          </div>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition-colors disabled:opacity-50">Create</button>
        </div>
      </div>
    </div>
  );
}

interface TaskModalProps extends ModalProps {
  workspaceSlug: string | undefined;
  projectSlug: string | undefined;
  parentId?: number | null;
}

export function TaskModal({ isOpen, onClose, workspaceSlug, projectSlug, parentId }: TaskModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });

  const mutation = useMutation({
    mutationFn: async () => {
      return api.post('/tasks', { ...form, workspaceSlug, projectSlug, parentId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      setForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
      onClose();
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">{parentId ? 'New Subtask' : 'New Task'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Task Title</label>
            <input 
              type="text" 
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea 
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none" 
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select 
                value={form.priority}
                onChange={e => setForm({...form, priority: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
              <input 
                type="date" 
                value={form.dueDate}
                onChange={e => setForm({...form, dueDate: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
              />
            </div>
          </div>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition-colors disabled:opacity-50">Create Task</button>
        </div>
      </div>
    </div>
  );
}

interface TaskDetailModalProps extends ModalProps {
  task: any | null;
}

export function TaskDetailModal({ isOpen, onClose, task }: TaskDetailModalProps) {
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState('');
  
  const { data: comments = [] } = useQuery({
    queryKey: ['comments', task?.id],
    queryFn: async () => {
      const { data } = await api.get(`/tasks/${task.id}/comments`);
      return data.data || data;
    },
    enabled: !!task?.id && isOpen
  });

  const addComment = useMutation({
    mutationFn: async () => api.post(`/tasks/${task.id}/comments`, { content: commentContent }),
    onSuccess: () => {
      setCommentContent('');
      queryClient.invalidateQueries({ queryKey: ['comments', task.id] });
    }
  });

  const updateStatus = useMutation({
    mutationFn: async (status: string) => api.put(`/tasks/${task.id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      onClose(); // Close modal on status change to see it update on board
    }
  });

  if (!isOpen || !task) return null;

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-700';
      case 'HIGH': return 'bg-orange-100 text-orange-700';
      case 'MEDIUM': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded">
              {task.parentId ? 'Subtask' : 'Task'}
            </span>
            <h2 className="text-xl font-bold text-slate-800">{task.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        
        <div className="p-6 space-y-6">
          {task.description ? (
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-2">Description</h3>
              <p className="text-slate-600 bg-slate-50 p-4 rounded-xl text-sm border border-slate-100">{task.description}</p>
            </div>
          ) : (
            <p className="text-sm italic text-slate-400">No description provided.</p>
          )}

          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">Status</h3>
              <select 
                value={task.status} 
                onChange={(e) => updateStatus.mutate(e.target.value)}
                disabled={updateStatus.isPending}
                className="text-sm font-semibold text-slate-800 bg-white px-3 py-1 rounded border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 outline-none w-full"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">Priority</h3>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-md ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">Due Date</h3>
              <span className="text-sm font-semibold text-slate-800">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date set'}
              </span>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">Created</h3>
              <span className="text-sm font-semibold text-slate-800">
                {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>
            </div>
          </div>
          
          {/* Comments Section */}
          <div className="mt-6 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Discussion</h3>
            
            <div className="space-y-4 mb-4 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {comments.length === 0 ? (
                <p className="text-xs italic text-slate-400">No comments yet. Start the conversation!</p>
              ) : (
                comments.map((comment: any) => (
                  <div key={comment.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-slate-700">{comment.author?.name || 'Unknown'}</span>
                      <span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-600">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input 
                type="text" 
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-slate-50 border border-slate-200 text-sm px-4 py-2 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                onKeyDown={(e) => { if (e.key === 'Enter' && commentContent.trim()) addComment.mutate(); }}
              />
              <button 
                onClick={() => addComment.mutate()}
                disabled={!commentContent.trim() || addComment.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold shadow-md hover:shadow-indigo-500/25 transition-all disabled:opacity-50 text-sm"
              >
                Send
              </button>
            </div>
          </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg shadow-md transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}
