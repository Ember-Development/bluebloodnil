import { useState } from 'react';
import { type AthleteTodo } from './types';
import { VerificationModal } from './components/VerificationModal';
import './profile.css';

interface TodosListProps {
  todos: AthleteTodo[];
  campaigns?: Array<{ id: string; title: string }>;
  onTodoUpdate?: () => void;
}

export const TodosList = ({ todos, campaigns = [], onTodoUpdate }: TodosListProps) => {
  const [verifyingTodo, setVerifyingTodo] = useState<AthleteTodo | null>(null);

  const handleVerifyClick = (todo: AthleteTodo) => {
    setVerifyingTodo(todo);
  };

  const handleVerificationSuccess = () => {
    setVerifyingTodo(null);
    if (onTodoUpdate) {
      onTodoUpdate();
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = (dueDate: string, status: AthleteTodo['status']) => {
    if (status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  const getPriorityClass = (priority: AthleteTodo['priority']) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  const getStatusClass = (status: AthleteTodo['status'], dueDate: string) => {
    if (status === 'completed') return 'todo-status completed';
    if (isOverdue(dueDate, status)) return 'todo-status overdue';
    if (status === 'in_progress') return 'todo-status in-progress';
    return 'todo-status pending';
  };

  const getStatusLabel = (status: AthleteTodo['status'], dueDate: string) => {
    if (isOverdue(dueDate, status)) {
      return 'Overdue';
    }
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const getCampaignTitle = (campaignId?: string) => {
    if (!campaignId) return null;
    const campaign = campaigns.find((c) => c.id === campaignId);
    return campaign?.title || null;
  };

  const pendingTodos = todos.filter((t) => t.status === 'pending' || t.status === 'in_progress');
  const completedTodos = todos.filter((t) => t.status === 'completed');
  const overdueTodos = todos.filter((t) => isOverdue(t.dueDate, t.status));

  return (
    <div className="todos-section">
      <div className="todos-header">
        <h3 className="section-title">My Tasks</h3>
        <div className="todos-stats">
          {overdueTodos.length > 0 && (
            <span className="todo-stat overdue-stat">
              {overdueTodos.length} Overdue
            </span>
          )}
          <span className="todo-stat pending-stat">
            {pendingTodos.length} Active
          </span>
          <span className="todo-stat completed-stat">
            {completedTodos.length} Completed
          </span>
        </div>
      </div>

      <div className="todos-list">
        {todos.length === 0 ? (
          <div className="todos-empty">No tasks assigned.</div>
        ) : (
          todos.map((todo) => {
            const overdue = isOverdue(todo.dueDate, todo.status);
            const campaignTitle = getCampaignTitle(todo.campaignId);

            return (
              <div
                key={todo.id}
                className={`todo-item ${overdue ? 'todo-overdue' : ''} ${todo.status === 'completed' ? 'todo-completed' : ''}`}
              >
                <div className="todo-header">
                  <div className="todo-title-row">
                    <input
                      type="checkbox"
                      checked={todo.status === 'completed'}
                      readOnly
                      className="todo-checkbox"
                    />
                    <h4 className="todo-title">{todo.title}</h4>
                    <span className={`priority-badge ${getPriorityClass(todo.priority)}`}>
                      {todo.priority}
                    </span>
                  </div>
                  <span className={getStatusClass(todo.status, todo.dueDate)}>
                    {getStatusLabel(todo.status, todo.dueDate)}
                  </span>
                </div>

                <p className="todo-description">{todo.description}</p>

                {todo.verificationType && todo.status !== 'completed' && (
                  <div className="todo-verification-section">
                    <button
                      className="todo-verify-button"
                      onClick={() => handleVerifyClick(todo)}
                    >
                      <span className="verify-icon">✓</span>
                      Verify Completion
                    </button>
                  </div>
                )}

                {todo.verifiedAt && (
                  <div className="todo-verified-info">
                    <span className="todo-verified-badge">✓ Verified</span>
                    {todo.verificationUrl && (
                      <a
                        href={todo.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="todo-verification-link"
                      >
                        View Verification
                      </a>
                    )}
                  </div>
                )}

                <div className="todo-meta">
                  <div className="todo-meta-left">
                    {campaignTitle && (
                      <span className="todo-campaign">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        {campaignTitle}
                      </span>
                    )}
                    <span className="todo-assigned">
                      Assigned by {todo.assignedBy}
                    </span>
                  </div>
                  <div className="todo-meta-right">
                    <span className={`todo-due ${overdue ? 'due-overdue' : ''}`}>
                      Due: {formatDate(todo.dueDate)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {verifyingTodo && (
        <VerificationModal
          isOpen={!!verifyingTodo}
          onClose={() => setVerifyingTodo(null)}
          todo={{
            id: verifyingTodo.id,
            title: verifyingTodo.title,
            verificationType: verifyingTodo.verificationType || null,
          }}
          onSuccess={handleVerificationSuccess}
        />
      )}
    </div>
  );
};

