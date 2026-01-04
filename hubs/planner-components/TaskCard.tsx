
import React from 'react';
import { Task, TaskPriority, TaskStatus, Category } from '../../types';

interface TaskCardProps {
  task: Task;
  categories: Category[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onEdit?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, categories, onStatusChange, onEdit }) => {
  const category = categories.find(c => c.id === task.categoryId);
  
  const getPriorityStyles = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.HIGH: return 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400';
      case TaskPriority.PERSONAL: return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case TaskPriority.DESIGN: return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
      case TaskPriority.LOW: return 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300';
    }
  };

  const handleNextStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const statuses = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];
    const currentIndex = statuses.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    onStatusChange(task.id, statuses[nextIndex]);
  };

  const isDone = task.status === TaskStatus.DONE;
  
  const subtasksCount = task.subtaskItems?.length || 0;
  const completedSubtasks = task.subtaskItems?.filter(s => s.completed).length || 0;
  const progressPercent = subtasksCount > 0 ? (completedSubtasks / subtasksCount) * 100 : 0;

  return (
    <div 
      onClick={() => onEdit?.(task)}
      className={`group bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 border-l-4 transition-all cursor-pointer flex flex-col gap-3 shadow-sm hover:shadow-md ${
        isDone ? 'opacity-50 grayscale scale-[0.98]' : ''
      }`}
      style={{ borderLeftColor: category?.color || '#f4258c' }}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-wrap gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getPriorityStyles(task.priority)}`}>
            {task.priority}
          </span>
          {category && (
            <span className="px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider" style={{ backgroundColor: category.color }}>
              {category.name}
            </span>
          )}
        </div>
        
        <button 
          onClick={handleNextStatus}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
            task.status === TaskStatus.TODO ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400' :
            task.status === TaskStatus.IN_PROGRESS ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400' :
            'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900 text-green-600 dark:text-green-400'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {task.status === TaskStatus.TODO ? 'radio_button_unchecked' :
             task.status === TaskStatus.IN_PROGRESS ? 'pending' : 'check_circle'}
          </span>
          {task.status}
        </button>
      </div>

      <h4 className={`font-bold text-lg text-text-main dark:text-white leading-tight ${isDone ? 'line-through' : ''}`}>
        {task.title}
      </h4>

      {task.description && !isDone && (
        <p className="text-sm text-text-muted dark:text-gray-400 line-clamp-2">
          {task.description}
        </p>
      )}

      {subtasksCount > 0 && (
        <div className="mt-1">
          <div className="w-full bg-background-light dark:bg-background-dark rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] font-bold text-text-muted dark:text-gray-500 mt-1">
            <span>{completedSubtasks}/{subtasksCount} Subtasks</span>
          </div>
        </div>
      )}

      <div className={`flex items-center justify-between pt-2 mt-1 border-t border-gray-100 dark:border-gray-800`}>
        <div className={`flex items-center gap-1.5 text-xs font-bold ${task.daysLeft ? 'text-primary' : 'text-text-muted dark:text-gray-500'}`}>
          <span className="material-symbols-outlined text-[16px]">
            {task.daysLeft ? 'schedule' : 'calendar_today'}
          </span>
          <span>{task.daysLeft ? `${task.daysLeft} days left` : task.dueDate}</span>
        </div>
        {task.assignees && task.assignees.length > 0 && (
          <div className="flex -space-x-2">
            {task.assignees.map((url, i) => (
              <div 
                key={i} 
                className="size-6 rounded-full bg-cover bg-center border-2 border-white dark:border-gray-700 shadow-sm"
                style={{ backgroundImage: `url('https://picsum.photos/32?random=${i + 20}')` }}
              ></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;

