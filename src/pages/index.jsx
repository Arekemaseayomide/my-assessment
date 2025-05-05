import { useState, useEffect } from 'react';
import { Check, Trash2, Plus, X, Edit2, Save, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TodoList() {
  const [allTodos, setAllTodos] = useState([]);
  const [todos, setTodos] = useState([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos);
        setAllTodos(parsedTodos);
      } catch (e) {
        console.error('Failed to parse saved todos');
      }
    }
    
    fetchTodos();
  }, []);

  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    setTodos(allTodos.slice(indexOfFirstItem, indexOfLastItem));
    setIsPageLoading(false);
  }, [currentPage, allTodos, itemsPerPage]);

  const fetchTodos = async () => {
    setIsLoading(true);
    setIsPageLoading(true);
    setError(null);
    try {
      const savedTodos = localStorage.getItem('todos');
      if (savedTodos) {
        const parsedTodos = JSON.parse(savedTodos);
        if (parsedTodos.length > 0) {
          setAllTodos(parsedTodos);
          setIsLoading(false);
          setIsPageLoading(false);
          return;
        }
      }
      
      const response = await fetch('https://jsonplaceholder.typicode.com/todos');
      if (!response.ok) throw new Error('Failed to fetch todos');
      
      const data = await response.json();
      setAllTodos(data);
      localStorage.setItem('todos', JSON.stringify(data));
    } catch (err) {
      setError(err.message);
      showNotification('Failed to load todos', 'error');
    } finally {
      setIsLoading(false);
      setIsPageLoading(false);
    }
  };

  const addTodo = async (e) => {
    if (e) e.preventDefault();
    if (!newTodoTitle.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
        method: 'POST',
        body: JSON.stringify({
          title: newTodoTitle,
          userId: 1,
          completed: false
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8'
        }
      });
      
      if (!response.ok) throw new Error('Failed to add todo');
      
      const newTodo = await response.json();
      const updatedTodos = [
        {
          ...newTodo,
          id: allTodos.length > 0 ? Math.max(...allTodos.map(t => t.id)) + 1 : 1
        },
        ...allTodos
      ];
      setAllTodos(updatedTodos);
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      
      setNewTodoTitle('');
      showNotification('Todo added successfully!', 'success');
      
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
      showNotification('Failed to add todo', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTodo = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete todo');
      
      setTodos(todos.filter(todo => todo.id !== id));
      showNotification('Todo deleted successfully!', 'success');
    } catch (err) {
      setError(err.message);
      showNotification('Failed to delete todo', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleComplete = async (id, completed) => {
    setIsLoading(true);
    try {
      const todo = todos.find(t => t.id === id);
      const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...todo,
          completed: !completed
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8'
        }
      });
      
      if (!response.ok) throw new Error('Failed to update todo');
      
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !completed } : todo
      ));
      showNotification('Todo status updated!', 'success');
    } catch (err) {
      setError(err.message);
      showNotification('Failed to update todo', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (id, title) => {
    setEditingId(id);
    setEditText(title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    
    setIsLoading(true);
    try {
      const todo = todos.find(t => t.id === id);
      const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...todo,
          title: editText
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8'
        }
      });
      
      if (!response.ok) throw new Error('Failed to update todo');
      
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, title: editText } : todo
      ));
      setEditingId(null);
      setEditText('');
      showNotification('Todo updated successfully!', 'success');
    } catch (err) {
      setError(err.message);
      showNotification('Failed to update todo', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 p-2 sm:p-4 md:p-6">
      <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto w-full bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 text-teal-400">Task Manager</h1>
        
        {notification.show && (
          <div className={`mb-4 p-2 sm:p-3 rounded-md ${
            notification.type === 'success' ? 'bg-green-800 text-green-200' : 'bg-red-900 text-red-200'
          } flex items-center`}>
            {notification.type === 'success' ? 
              <Check size={18} className="mr-2 text-green-300" /> : 
              <AlertCircle size={18} className="mr-2 text-red-300" />
            }
            <span>{notification.message}</span>
          </div>
        )}
        
        <div className="mb-4 sm:mb-6">
          <div className="flex">
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a new task..."
              className="flex-grow text-white bg-gray-700 p-2 border border-gray-600 rounded-l focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400"
              disabled={isLoading}
            />
            <button 
              onClick={addTodo}
              className="bg-teal-600 cursor-pointer text-white p-2 rounded-r hover:bg-teal-700 transition-colors flex items-center justify-center"
              disabled={isLoading || !newTodoTitle.trim()}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
        
        
        {error && (
          <div className="bg-red-900 text-red-200 p-3 rounded-md mb-4 flex items-center">
            <AlertCircle size={18} className="mr-2 text-red-300" />
            <span>{error}</span>
          </div>
        )}
        

        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        )}
        
        <ul className="space-y-2">
          {todos.length === 0 && !isLoading ? (
            <li className="text-center text-gray-400 py-4">No tasks found. Add a new one!</li>
          ) : (
            todos.map(todo => (
              <li 
                key={todo.id} 
                className={`border border-gray-700 p-3 rounded-md shadow-md ${
                  todo.completed ? 'bg-gray-700' : 'bg-gray-750'
                }`}
              >
                <div className="flex items-center justify-between">
                  {editingId === todo.id ? (
                    <div className="flex-grow flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-grow text-white bg-gray-600 p-1 border border-gray-500 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => saveEdit(todo.id)} 
                          className="bg-teal-600 text-white p-1 cursor-pointer rounded hover:bg-teal-700 transition-colors"
                          disabled={!editText.trim()}
                        >
                          <Save size={16} />
                        </button>
                        <button 
                          onClick={cancelEditing} 
                          className="bg-gray-600 text-gray-300 cursor-pointer p-1 rounded hover:bg-gray-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center flex-grow">
                        <button 
                          onClick={() => toggleComplete(todo.id, todo.completed)}
                          className={`w-5 h-5 mr-3 cursor-pointer flex items-center justify-center rounded border ${
                            todo.completed ? 'bg-teal-600 border-teal-700' : 'border-gray-500 bg-gray-600'
                          }`}
                        >
                          {todo.completed && <Check size={12} className="text-white" />}
                        </button>
                        <span className={`flex-grow text-sm sm:text-base ${
                          todo.completed ? 'line-through text-gray-400' : 'text-gray-200'
                        }`}>
                          {todo.title}
                        </span>
                      </div>
                      <div className="flex space-x-2 ml-2">
                        <button 
                          onClick={() => startEditing(todo.id, todo.title)}
                          className="text-teal-400 cursor-pointer hover:text-teal-300 transition-colors"
                          disabled={isLoading}
                          aria-label="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteTodo(todo.id)}
                          className="text-red-400 cursor-pointer hover:text-red-300 transition-colors"
                          disabled={isLoading}
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
      
      <div className="mt-6 text-center text-gray-500 text-xs">
        <p>My assesment</p>
      </div>
    </div>
  );
}