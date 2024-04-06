import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showAddListInput, setShowAddListInput] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showAddTaskInput, setShowAddTaskInput] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');

  useEffect(() => {
    reloadLists();
    reloadTasks();
  }, []);

  // Fetch lists
  let reloadLists = () => {
    fetch('http://localhost:3001/lists/', {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      }, 
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      setLists(data);
    })
    .catch((error) => {
      console.error("Error fetching lists:", error);
    });
  };

  // Fetch tasks
  let reloadTasks = () => {
    fetch('http://localhost:3001/tasks/', {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      }, 
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      setTasks(data);
    })
    .catch((error) => {
      console.error("Error fetching tasks:", error);
    });
  };

  const handleAddList = () => {
    if (!newListName.trim()) return;
    fetch('http://localhost:3001/lists/', {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newListName, possition: 3})
    })
    .then(response => response.json())
    .then(data => {
      setLists(prevLists => [...prevLists, data]); // Update lists state with the newly added list
      setShowAddListInput(false); // Hide the input after adding the list
      setNewListName(''); // Clear the input field
      reloadLists();
    })
    .catch(error => console.error("Error adding list:", error));
  };

  // Function to handle creating a new task
  const handleNewTask = (listId) => {
    if (newTaskName) {
      fetch('http://localhost:3001/tasks/', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          list_id: listId,
          title: newTaskName,
          description: '',
          due_date:''
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to create task');
        }
        return response.json();
      })
      .then(newTask => {
        // Update tasks state with the newly created task
        setTasks([...tasks, newTask]);
        reloadLists();
        reloadTasks();
        setNewTaskName('');
        setShowAddTaskInput(prevState => ({ ...prevState, [listId]: false }))
      })
      .catch(error => {
        console.error('Error creating task:', error);
      });
    }
  };


  return (
    <div className="app">
      <header>
        <div className="header-content">
          <img src="logo.png" alt="Logo" className="logo" />
          <h1>Header</h1>
        </div>
      </header>
      <div id="page-container">
        <main>
        {lists.map(list => (
  <div key={list.id} className="list">
    <h2>{list.name}</h2>
    <ul>
      {tasks.filter(task => task.Lists_id === list.id).map(task => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
    <div className='generate' onClick={() => setShowAddTaskInput(prevState => ({ ...prevState, [list.id]: true }))}>
      {showAddTaskInput[list.id] ? (
        <div>
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="Enter task name"
          />
          <button onClick={() => handleNewTask(list.id)}>Add Task</button>
        </div>
      ) : (
        <div className="add-task">
          <h1>+ Add Task</h1>
        </div>
      )}
    </div>
  </div>
))}
          <div className='list generate' onClick={() => setShowAddListInput(true)}>
            {showAddListInput ? (
              <div>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Enter list name"
                />
                <button onClick={handleAddList}>Add List</button>
              </div>
            ) : (
              <div className="add-list">
                <h1>+ Add List</h1>
              </div>
            )}
          </div>
        </main>
        <footer>
          <div className="footer-content">
            <p>Example Text</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;

