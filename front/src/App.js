import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import './App.css';

function App() {
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tables, setTables] = useState([]);
  const [showAddListInput, setShowAddListInput] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showAddTaskInput, setShowAddTaskInput] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);
  const [currentTable, setCurrentTable] = useState(1);
  const [showAddTableInput, setShowAddTableInput] = useState(false);
  const [newTableName, setNewTableName] = useState('');

  useEffect(() => {
    reloadLists();
    reloadTasks();
    reloadTables()
  }, []);

  const handleTableClick = (tableId) => {
    setCurrentTable(tableId);
  };

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

  let reloadTables = () => {
    fetch('http://localhost:3001/tables/', {
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
      setTables(data);
    })
    .catch((error) => {
      console.error("Error fetching tasks:", error);
    });
  };

  const handleAddList = (tables) => {
    if (!newListName.trim()) return;
    fetch('http://localhost:3001/lists/', {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newListName, Tables_id: tables })
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

  const handleEditTask = (taskId, updatedTitle) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, title: updatedTitle } : task
    );
    setTasks(updatedTasks);
  
    // Send a PUT request to update the task's details in the backend
    fetch(`http://localhost:3001/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        title: updatedTitle,
        description: '',
        due_date: '',
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update task');
        }
        return response.json();
      })
      .then(() => {
        // Reload lists and tasks only after the API call is successful
        reloadLists();
        reloadTasks();
        setNewTaskName('');
      })
      .catch(error => {
        console.error('Error updating task:', error);
        // You can add additional error handling or notifications here
      });
  };
  
  const handleDeleteTask = (taskId) => {
    // Remove the task from the tasks state
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
  
    // Send a DELETE request to delete the task from the backend
    fetch(`http://localhost:3001/tasks/${taskId}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete task');
        }
        // Optional: Handle success or display a success message
      })
      .catch(error => {
        console.error('Error deleting task:', error);
        // Optional: Handle error or display an error message
      });
  };

// Function to handle editing a list
const handleEditList = (listId, updatedName) => {
  // Update the lists state with the edited list
  const updatedLists = lists.map(list =>
    list.id === listId ? { ...list, name: updatedName } : list
  );
  setLists(updatedLists);

  // Send a PUT request to update the list's name in the backend
  fetch(`http://localhost:3001/lists/${listId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: updatedName }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update list');
      }
      return response.json();
    })
    .then(() => {
      // Optional: Reload lists or handle success
    })
    .catch(error => {
      console.error('Error updating list:', error);
      // Optional: Handle error or display an error message
    });
};

// Function to handle deleting a list and its associated tasks
const handleDeleteList = (listId) => {
  
// Find the task with the specified listId
const tasksToDelete = tasks.filter(task => task.Lists_id === listId);

  tasksToDelete.forEach(task => {
    // Send a DELETE request to delete the task from the backend
    fetch(`http://localhost:3001/tasks/${task.id}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete task');
        }
        // Optional: Handle success or display a success message
      })
      .catch(error => {
        console.error('Error deleting task:', error);
        // Optional: Handle error or display an error message
      });
  });


  // Remove the list from the UI
  const updatedLists = lists.filter(list => list.id !== listId);
  setLists(updatedLists);

  // Send a DELETE request to delete the list from the backend
  fetch(`http://localhost:3001/lists/${listId}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete list');
      }
      // Optional: Handle success or display a success message
    })
    .catch(error => {
      console.error('Error deleting list:', error);
      // Optional: Handle error or display an error message
    });
};

const handleDragStart = (event, task) => {
  setDraggedTask(task);
};

const handleDragOver = (event, listId) => {
  // Prevent the default behavior of dropping elements
  event.preventDefault();
};

const handleDrop = (event, listId) => {
  // Keep all the current information of the dragged task except for the list ID
  const updatedTask = {
    ...draggedTask,
    List_id: listId // Update the list ID to the appropriate list ID
  };

  // Send a PUT request to update the task's list ID in the backend
  fetch(`http://localhost:3001/list/${draggedTask.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedTask), // Send the updated task object
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      return response.json();
    })
    .then(() => {
      // Reload lists and tasks only after the API call is successful
      reloadLists();
      reloadTasks();
      setDraggedTask(null); // Reset the dragged task state
    })
    .catch(error => {
      console.error('Error updating task:', error);
      // You can add additional error handling or notifications here
    });
};

const handleAddTable = (tableId) => {
  if (!newTableName.trim()) return;
  fetch('http://localhost:3001/tables/', {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: newTableName, User_id: 1 })
  })
  .then(response => response.json())
  .then(data => {
    setShowAddTableInput(false); // Hide the input after adding the list
    setNewTableName(''); // Clear the input field
    reloadTables();
  })
  .catch(error => console.error("Error adding list:", error));
};

const handleEditTable = (tableId, updatedName) => {
  // Update the lists state with the edited list
  const updatedTables = tables.map(tables =>
    tables.id === tableId ? { ...tables, name: updatedName } : tables
  );
  setTables(updatedTables);

  // Send a PUT request to update the list's name in the backend
  fetch(`http://localhost:3001/tables/${tableId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: updatedName }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update list');
      }
      return response.json();
    })
    .then(() => {
      // Optional: Reload lists or handle success
    })
    .catch(error => {
      console.error('Error updating list:', error);
      // Optional: Handle error or display an error message
    });
};

// Function to handle deleting a list and its associated tasks
const handleDeleteTable = (tableId) => {
  
// Find the task with the specified listId
const listsToDelete = lists.filter(lists => lists.Tables_id === tableId);
const tasksToDelete = tasks.filter(task => listsToDelete.some(list => list.id === task.Lists_id));

console.log(tasksToDelete);
console.log(listsToDelete);

tasksToDelete.forEach(task => {
  // Send a DELETE request to delete the task from the backend
  fetch(`http://localhost:3001/tasks/${task.id}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      // Optional: Handle success or display a success message
    })
    .catch(error => {
      console.error('Error deleting task:', error);
      // Optional: Handle error or display an error message
    });
});

listsToDelete.forEach(lists => {
  // Send a DELETE request to delete the task from the backend
  fetch(`http://localhost:3001/lists/${lists.id}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
    })
    .catch(error => {
      console.error('Error deleting task:', error);
      // Optional: Handle error or display an error message
    });
});

  // Remove the list from the UI
  const updatedtables = tables.filter(tables => tables.id !== tableId);
  setTables(updatedtables);

  // Send a DELETE request to delete the list from the backend
  fetch(`http://localhost:3001/tables/${tableId}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete list');
      }
      
      setCurrentTable(0)
      reloadTables()
      reloadLists()
      reloadTasks()
    })
    .catch(error => {
      console.error('Error deleting list:', error);
      // Optional: Handle error or display an error message
    });
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
      <div className="sidebar">
      {tables.map(tables => (
      <div key={tables.id}>
        <h5 onClick={() => handleTableClick(tables.id)}>{tables.name}</h5>
        <button onClick={() => handleEditTable(tables.id, prompt('Enter new task title'))}>Edit</button>
        <button onClick={() => handleDeleteTable(tables.id)}>Delete</button>
      </div>
    ))}

    <div className='generate' onClick={() => setShowAddTableInput(true)}>
  {showAddTableInput ? (
    <div>
      <input
        type="text"
        value={newTableName}
        onChange={(e) => setNewTableName(e.target.value)}
        placeholder="Enter list name"
      />
        <button onClick={() => handleAddTable()}>Add Table</button>
    </div>
  ) : (
    <div className="add-list">
      <h1>+ Add Table</h1>
    </div>
  )}
    </div>
      </div>
        <main>
{/* task gen */}
{lists
  .filter(list => list.Tables_id === currentTable) // Filter lists based on currentTable
  .map(list => (
    <div key={list.id} className="list" onDragOver={(event) => handleDragOver(event, list.id)} onDrop={(event) => handleDrop(event, list.id)}>
      <h2>{list.name}</h2>
      <button onClick={() => handleEditList(list.id, prompt('Enter new task title'))}>Edit</button>
          <button onClick={() => handleDeleteList(list.id)}>Delete</button>
      <ul>
        {tasks
          .filter(task => task.Lists_id === list.id)
          .map(task => (
            <li key={task.id} draggable onDragStart={(event) => handleDragStart(event, task)}>
              {task.title}
              <button onClick={() => handleEditTask(task.id, prompt('Enter new task title'))}>Edit</button>
              <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
            </li>
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

          {/* list gen */}
          <div className='list generate' onClick={() => setShowAddListInput(true)}>
            {showAddListInput ? (
              <div>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Enter list name"
                />
                {tables.map(table => (
                  <button key={table.id} onClick={() => handleAddList(currentTable)}>Add List</button>
                ))}
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
