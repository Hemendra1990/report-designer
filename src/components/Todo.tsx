import React, { useState } from 'react';
import { CheckCircle, Circle, Plus, Trash2 } from 'lucide-react';
import { useTodos, TodoItem } from '@/contexts/TodoContext';

// Define props interface
interface TodoProps {
  dashboardId?: string;
}

const Todo: React.FC<TodoProps> = ({ dashboardId }) => {
  // Get todo state and handlers from context
  const { 
    getTodosByDashboard, 
    addTodo, 
    toggleTodo, 
    deleteTodo, 
    clearCompleted 
  } = useTodos();
  
  // Local state for filter and input
  const [newTodoText, setNewTodoText] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  
  // Get todos for this dashboard
  const dashboardTodos = getTodosByDashboard(dashboardId);
  
  // Get counts for the footer
  const activeTodoCount = dashboardTodos.filter(todo => !todo.completed).length;
  const completedTodoCount = dashboardTodos.length - activeTodoCount;
  
  // Handle adding a new todo
  const handleAddTodo = () => {
    if (newTodoText.trim() === '') return;
    addTodo(newTodoText, dashboardId);
    setNewTodoText('');
  };
  
  // Handle key down event for adding a todo with Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };
  
  // Filter todos based on the selected filter
  const filteredTodos = dashboardTodos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true; // 'all'
  });
  
  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Todo List</h2>
      
      {/* Add new todo input */}
      <div className="flex mb-6">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done?"
          className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="New todo text"
        />
        <button
          onClick={handleAddTodo}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Add todo"
        >
          <Plus size={18} />
        </button>
      </div>
      
      {/* Filter tabs */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-sm rounded-md ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-pressed={filter === 'all'}
        >
          All ({dashboardTodos.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-3 py-1 text-sm rounded-md ${
            filter === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-pressed={filter === 'active'}
        >
          Active ({activeTodoCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1 text-sm rounded-md ${
            filter === 'completed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-pressed={filter === 'completed'}
        >
          Completed ({completedTodoCount})
        </button>
      </div>
      
      {/* Todo list */}
      <ul className="space-y-2 mb-4">
        {filteredTodos.length === 0 ? (
          <li className="text-gray-500 text-center py-4">
            {filter === 'all'
              ? 'No todos yet. Add one above!'
              : filter === 'active'
              ? 'No active todos!'
              : 'No completed todos!'}
          </li>
        ) : (
          filteredTodos.map(todo => (
            <li 
              key={todo.id}
              className={`flex items-center justify-between p-3 rounded-md ${
                todo.completed ? 'bg-gray-50' : 'bg-white'
              } border transition-colors duration-200`}
            >
              <div className="flex items-center space-x-3 flex-grow">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full ${
                    todo.completed ? 'text-green-500' : 'text-gray-400 hover:text-gray-500'
                  }`}
                  aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
                  tabIndex={0}
                >
                  {todo.completed ? (
                    <CheckCircle size={20} />
                  ) : (
                    <Circle size={20} />
                  )}
                </button>
                <span 
                  className={`text-gray-800 ${
                    todo.completed ? 'line-through text-gray-500' : ''
                  }`}
                >
                  {todo.text}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="ml-2 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-1"
                aria-label="Delete todo"
                tabIndex={0}
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))
        )}
      </ul>
      
      {/* Clear completed button - only show if there are completed todos */}
      {completedTodoCount > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => clearCompleted(dashboardId)}
            className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded px-2 py-1"
            aria-label="Clear completed todos"
            tabIndex={0}
          >
            Clear completed
          </button>
        </div>
      )}
    </div>
  );
};

export default Todo; 