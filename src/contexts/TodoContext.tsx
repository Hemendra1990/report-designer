'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define Todo item interface
export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  dashboardId?: string;
}

// Define context interface
interface TodoContextType {
  todos: TodoItem[];
  activeTodoCount: number;
  completedTodoCount: number;
  addTodo: (text: string, dashboardId?: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  clearCompleted: (dashboardId?: string) => void;
  getTodosByDashboard: (dashboardId?: string) => TodoItem[];
}

// Create context with default values
const TodoContext = createContext<TodoContextType>({
  todos: [],
  activeTodoCount: 0,
  completedTodoCount: 0,
  addTodo: () => {},
  toggleTodo: () => {},
  deleteTodo: () => {},
  clearCompleted: () => {},
  getTodosByDashboard: () => [],
});

// Provider component props
interface TodoProviderProps {
  children: ReactNode;
}

// Provider component
export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  
  // Calculate counts
  const activeTodoCount = todos.filter(todo => !todo.completed).length;
  const completedTodoCount = todos.length - activeTodoCount;
  
  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    
    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos);
        // Convert string dates back to Date objects
        const formattedTodos = parsedTodos.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt)
        }));
        setTodos(formattedTodos);
      } catch (error) {
        console.error('Failed to parse todos from localStorage', error);
      }
    }
  }, []);
  
  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);
  
  // Add a new todo
  const addTodo = (text: string, dashboardId?: string) => {
    if (text.trim() === '') return;
    
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false,
      createdAt: new Date(),
      dashboardId
    };
    
    setTodos([...todos, newTodo]);
  };
  
  // Toggle a todo's completed status
  const toggleTodo = (id: string) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };
  
  // Delete a todo
  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  // Clear all completed todos
  const clearCompleted = (dashboardId?: string) => {
    if (dashboardId) {
      setTodos(todos.filter(todo => 
        todo.completed === false || todo.dashboardId !== dashboardId
      ));
    } else {
      setTodos(todos.filter(todo => !todo.completed));
    }
  };
  
  // Get todos filtered by dashboard ID
  const getTodosByDashboard = (dashboardId?: string) => {
    if (!dashboardId) return todos;
    return todos.filter(todo => todo.dashboardId === dashboardId);
  };
  
  return (
    <TodoContext.Provider
      value={{
        todos,
        activeTodoCount,
        completedTodoCount,
        addTodo,
        toggleTodo,
        deleteTodo,
        clearCompleted,
        getTodosByDashboard
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

// Custom hook to use the todo context
export const useTodos = () => useContext(TodoContext);

export default TodoContext; 