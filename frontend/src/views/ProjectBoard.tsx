import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Plus, ListTodo, Clock, CheckCircle2, Trash2, Activity, CornerDownRight } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { TaskModal, TaskDetailModal } from '../components/Modals';

const COLUMNS = [
  { id: 'BACKLOG', title: 'Backlog' },
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'REVIEW', title: 'Review' },
  { id: 'DONE', title: 'Done' }
];

export default function ProjectBoard() {
  const { workspaceSlug, projectSlug } = useParams();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [activeParentId, setActiveParentId] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isActivityOpen, setActivityOpen] = useState(false);
  const [columnsData, setColumnsData] = useState<Record<string, any[]>>({});

  const { data: tasks } = useQuery({
    queryKey: ['tasks', projectSlug],
    queryFn: async () => {
      const { data } = await api.get(`/tasks/workspace/${workspaceSlug}/project/${projectSlug}`);
      return data.rows;
    },
    enabled: !!projectSlug
  });

  const { data: activities } = useQuery({
    queryKey: ['activities', projectSlug],
    queryFn: async () => {
      const { data } = await api.get(`/activities/workspace/${workspaceSlug}/project/${projectSlug}`);
      return data;
    },
    enabled: !!projectSlug && isActivityOpen
  });

  useEffect(() => {
    if (tasks) {
      const initial: Record<string, any[]> = {};
      COLUMNS.forEach(col => { initial[col.id] = []; });
      
      // Separate parent tasks and subtasks
      const parents = tasks.filter((t: any) => !t.parentId);
      const subtasks = tasks.filter((t: any) => t.parentId);
      
      // Attach subtasks to parents for display logic
      parents.forEach((parent: any) => {
        parent.subtasksList = subtasks.filter((s: any) => s.parentId === parent.id);
        if (initial[parent.status]) {
          initial[parent.status].push(parent);
        } else {
          initial['BACKLOG'].push(parent);
        }
      });
      setColumnsData(initial);
    }
  }, [tasks]);

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number, status: string }) => {
      await api.put(`/tasks/${taskId}`, { status });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectSlug] });
      queryClient.invalidateQueries({ queryKey: ['activities', projectSlug] });
    }
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: number) => {
      await api.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectSlug] });
      queryClient.invalidateQueries({ queryKey: ['activities', projectSlug] });
    }
  });

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    const sourceTasks = Array.from(columnsData[sourceCol]);
    const destTasks = sourceCol === destCol ? sourceTasks : Array.from(columnsData[destCol]);

    const [movedTask] = sourceTasks.splice(source.index, 1);
    
    // Optimistic update
    movedTask.status = destCol;
    destTasks.splice(destination.index, 0, movedTask);

    setColumnsData(prev => ({
      ...prev,
      [sourceCol]: sourceTasks,
      [destCol]: destTasks,
    }));

    if (sourceCol !== destCol) {
      updateTaskStatus.mutate({ taskId: parseInt(draggableId), status: destCol });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-700';
      case 'HIGH': return 'bg-orange-100 text-orange-700';
      case 'MEDIUM': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const handleAddSubtask = (parentId: number) => {
    setActiveParentId(parentId);
    setTaskModalOpen(true);
  };

  const handleAddTask = () => {
    setActiveParentId(null);
    setTaskModalOpen(true);
  };

  if (!projectSlug) return null;

  return (
    <div className="flex flex-col h-full relative">
      <div className="px-8 pt-8 pb-4 shrink-0 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Project Board</h1>
          <p className="text-slate-500 font-medium">Drag and drop tasks. Create subtasks for granularity.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setActivityOpen(!isActivityOpen)}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 ${isActivityOpen ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            <Activity size={18} /> Activity Log
          </button>
          <button 
            onClick={handleAddTask}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-indigo-500/25 transition-all duration-300 flex items-center gap-2">
            <Plus size={18} /> Add Task
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Kanban Board Area */}
        <div className="flex-1 overflow-x-auto custom-scrollbar px-8 pb-8">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 h-full items-start pb-4">
              {COLUMNS.map((col) => (
                <div key={col.id} className="flex flex-col bg-slate-100/50 backdrop-blur-sm rounded-2xl w-80 shrink-0 border border-slate-200/60 max-h-full">
                  <div className="px-4 py-3 flex justify-between items-center border-b border-slate-200/50">
                    <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs flex items-center gap-2">
                      {col.id === 'DONE' && <CheckCircle2 size={14} className="text-emerald-500"/>}
                      {col.id === 'IN_PROGRESS' && <Clock size={14} className="text-amber-500"/>}
                      {(col.id === 'BACKLOG' || col.id === 'TODO' || col.id === 'REVIEW') && <ListTodo size={14} className="text-slate-400"/>}
                      {col.title}
                    </h3>
                    <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      {columnsData[col.id]?.length || 0}
                    </span>
                  </div>
                  
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 min-h-[150px] transition-colors duration-300 ${snapshot.isDraggingOver ? 'bg-indigo-50/50' : ''}`}
                      >
                        {columnsData[col.id]?.map((task, index) => (
                          <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={provided.draggableProps.style}
                                className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm select-none group ${
                                  snapshot.isDragging ? 'shadow-xl ring-2 ring-indigo-500 rotate-2' : 'hover:border-indigo-300 hover:shadow-md'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className="font-bold text-slate-800 leading-tight">{task.title}</h4>
                                  <button 
                                    onClick={() => { if(confirm('Delete this task?')) deleteTask.mutate(task.id); }}
                                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Task">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                
                                {task.description && (
                                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
                                )}

                                {/* Subtasks Section */}
                                {task.subtasksList?.length > 0 && (
                                  <div className="mt-3 mb-3 bg-slate-50 rounded-lg p-2 border border-slate-100">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1"><CornerDownRight size={10}/> Subtasks ({task.subtasksList.length})</p>
                                    <ul className="space-y-1">
                                      {task.subtasksList.map((st: any) => (
                                        <li 
                                          key={st.id} 
                                          onClick={() => {
                                            setSelectedTask(st);
                                            setSearchParams({ task: task.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), subtask: st.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') });
                                          }}
                                          className="text-xs text-slate-600 flex justify-between items-center bg-white px-2 py-1 rounded border border-slate-100 shadow-sm cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all">
                                          <span className="truncate pr-2">{st.title}</span>
                                          <span className="text-[9px] font-bold text-indigo-500 shrink-0">{st.status}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                                  <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => handleAddSubtask(task.id)}
                                      className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                                      + Subtask
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>

        {/* Sliding Activity Sidebar */}
        {isActivityOpen && (
          <div className="w-80 border-l border-slate-200 bg-white shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] animate-in slide-in-from-right-8 duration-300 flex flex-col z-10 relative">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Activity size={16} className="text-indigo-500"/> Project Activity</h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              {activities?.length === 0 ? (
                <p className="text-sm text-slate-500 text-center mt-10">No recent activity.</p>
              ) : (
                activities?.map((act: any) => (
                  <div key={act.id} className="text-sm border-b border-slate-50 pb-3 last:border-0">
                    <p className="text-slate-700">
                      <span className="font-semibold text-indigo-600">{act.user?.name || 'User'}</span>{' '}
                      {act.action === 'MOVED_TASK' ? (
                        <span>moved <b>{act.metadata?.title}</b> from {act.metadata?.from} to {act.metadata?.to}</span>
                      ) : act.action === 'UPDATED_TASK' ? (
                        <span>updated task <b>{act.metadata?.title}</b></span>
                      ) : act.action === 'CREATED_PROJECT' ? (
                        <span>created the project <b>{act.metadata?.name}</b></span>
                      ) : act.action === 'CREATED_TASK' ? (
                        <span>created a new task <b>{act.metadata?.title}</b></span>
                      ) : act.action === 'CREATED_SUBTASK' ? (
                        <span>added a subtask <b>{act.metadata?.title}</b></span>
                      ) : (
                        <span>performed {act.action}</span>
                      )}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1">
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => { setTaskModalOpen(false); setActiveParentId(null); }} 
        workspaceSlug={workspaceSlug}
        projectSlug={projectSlug} 
        parentId={activeParentId}
      />

      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={() => {
          setSelectedTask(null);
          setSearchParams({});
        }}
        task={selectedTask}
      />
    </div>
  );
}
