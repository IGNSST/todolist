import React, { useState, useEffect } from 'react';
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



  // Fetch sarašus
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

  // Fetch užduotis
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

  // Fetch lenteles
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
      if (Array.isArray(data) && data.length > 0) {
        const tableExists = data.find(table => table.id);
        setCurrentTable(tableExists.id);
      } else {
        setCurrentTable(0);
      }
    })
    .catch((error) => {
      console.error("Error fetching tasks:", error);
    });
  };

  // funkcija prideti saraša
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
      setLists(prevLists => [...prevLists, data]); // Atnaujinti sąrašų būseną su naujai pridėtu sąrašu
      setShowAddListInput(false); // Paslėpti įvestį po sąrašo pridėjimo
      setNewListName(''); // Išvalyti įvesties lauką
      reloadLists();
    })
    .catch(error => console.error("Error adding list:", error));
  };
  

// Funkcija, skirta tvarkyti naujos užduoties kūrimą
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
        // Atnaujinti užduočių būseną su naujai sukurtu užduotimi
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

// Funkcija, skirta tvarkyti užduoties redagavimą
  const handleEditTask = (taskId, updatedTitle) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, title: updatedTitle } : task
    );
    setTasks(updatedTasks);
  
    // Siųsti PUT užklausą, kad būtų atnaujintos užduoties detalės serverio pusėje
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
        // Įkelti sąrašus ir užduotis tik tada, kai API užklausa yra sėkminga
        reloadLists();
        reloadTasks();
        setNewTaskName('');
      })
      .catch(error => {
        console.error('Error updating task:', error);
      });
  };
  
  const handleDeleteTask = (taskId) => {
    // Pašalinti užduotį iš užduočių būsenos
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
  
    // Siųsti DELETE užklausą, kad būtų ištrinta užduotis iš serverio pusės
    fetch(`http://localhost:3001/tasks/${taskId}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete task');
        }
      })
      .catch(error => {
        console.error('Error deleting task:', error);
      });
  };

// Funkcija, skirta tvarkyti sąrašo redagavimą
const handleEditList = (listId, updatedName) => {
// Atnaujinti sąrašų būseną su redaguotu sąrašu
  const updatedLists = lists.map(list =>
    list.id === listId ? { ...list, name: updatedName } : list
  );
  setLists(updatedLists);

// Siųsti PUT užklausą, kad būtų atnaujintas sąrašo pavadinimas serverio pusėje
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

// Funkcija, skirta tvarkyti sąrašo ir jo susijusių užduočių trynim
const handleDeleteList = (listId) => {
  
// Rasti užduotis su nurodytu sąrašo ID
const tasksToDelete = tasks.filter(task => task.Lists_id === listId);

  tasksToDelete.forEach(task => {
    // Siųsti DELETE užklausą, kad būtų ištrintos užduotis iš serverio pusės
    fetch(`http://localhost:3001/tasks/${task.id}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete task');
        }

      })
      .catch(error => {
        console.error('Error deleting task:', error);

      });
  });


  // Pašalinti sąrašą iš UI
  const updatedLists = lists.filter(list => list.id !== listId);
  setLists(updatedLists);

  // Siųsti DELETE užklausą, kad būtų ištrintas sąrašas iš serverio pusės
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

//funkcija kuri leidzia paiimt elementa ir perdeti i kita saraša
const handleDragStart = (event, task) => {
  setDraggedTask(task);
};

const handleDragOver = (event, listId) => {
  event.preventDefault();
};

// funkcija kuri issiuncia update
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

// funkcija prideti lentele
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

// funkcija pakeisti lenteles duomenis
const handleEditTable = (tableId, updatedName) => {
    // Atnaujinkite sąrašų būseną su redaguotu sąrašu
  const updatedTables = tables.map(tables =>
    tables.id === tableId ? { ...tables, name: updatedName } : tables
  );
  setTables(updatedTables);

  // Siųskite PUT užklausą, kad būtų atnaujintas sąrašo pavadinimas serverio pusėje
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
    })
    .catch(error => {
      console.error('Error updating list:', error);
    });
};

// Funkcija istrinti lentele
const handleDeleteTable = (tableId) => {
  
// surasti susijusius objectus kad išstrinti
const listsToDelete = lists.filter(lists => lists.Tables_id === tableId);
const tasksToDelete = tasks.filter(task => listsToDelete.some(list => list.id === task.Lists_id));


tasksToDelete.forEach(task => {
  // issiusti DELETE užklausą, kad būtų ištrintas užduotis iš serverio pusės
  fetch(`http://localhost:3001/tasks/${task.id}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
    })
    .catch(error => {
      console.error('Error deleting task:', error);
    });
});

listsToDelete.forEach(lists => {
  // issiusti DELETE užklausą, kad būtų ištrintas sarašas iš serverio pusės
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
    });
});

  // nujimti lenteles nuo UI
  const updatedtables = tables.filter(tables => tables.id !== tableId);
  setTables(updatedtables);


  // nusiusti delete query lentelem
  fetch(`http://localhost:3001/tables/${tableId}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete list');
      }
      

      reloadTables()
      reloadLists()
      reloadTasks()
    })
    .catch(error => {
      console.error('Error deleting list:', error);

    });
};



  return (
    <div className="app">
      <header>
        <div className="header-content">
          {currentTable !== 0 && (
            <h2 className='tableTitle'>
              Dabartine Lentele:  {tables.find(table => table.id === currentTable)?.name}
            </h2>
          )}
        </div>
      </header>
      <div id="page-container">
      <div className="sidebar">
        <h1>Tables</h1>
      {tables.map(tables => (
      <div key={tables.id} className='tables'>
        <h5 onClick={() => handleTableClick(tables.id)}>{tables.name}</h5>
        <button onClick={() => handleEditTable(tables.id, prompt('Enter new task title'))}>📄</button>
        <button onClick={() => handleDeleteTable(tables.id)}>🗑️</button>
      </div>
    ))}

    <div className='tables' onClick={() => setShowAddTableInput(true)}>
  {showAddTableInput ? (
    <div>
      <input
        type="text"
        value={newTableName}
        onChange={(e) => setNewTableName(e.target.value)}
        placeholder="Enter list name"
      />
        <button onClick={() => handleAddTable(currentTable)}>Add Table</button>
    </div>
  ) : (
    <div>
      <h4>+ Add Table</h4>
    </div>
  )}
    </div>
      </div>
        <main>
{/* task generacija */}
{lists
  .filter(list => list.Tables_id === currentTable)
  .map(list => (
    <div key={list.id} className="list" onDragOver={(event) => handleDragOver(event, list.id)} onDrop={(event) => handleDrop(event, list.id)}>
      <h2>{list.name}</h2>
      <button onClick={() => handleEditList(list.id, prompt('Enter new task title'))}>📄</button>
          <button onClick={() => handleDeleteList(list.id)}>🗑️</button>
      <ul>
        {tasks
          .filter(task => task.Lists_id === list.id)
          .map(task => (
            <li key={task.id} draggable onDragStart={(event) => handleDragStart(event, task)}>
              {task.title}
              <button onClick={() => handleEditTask(task.id, prompt('Enter new task title'))}>📄</button>
              <button onClick={() => handleDeleteTask(task.id)}>🗑️</button>
            </li>
          ))}
      </ul>
      <div className='generate table' onClick={() => setShowAddTaskInput(prevState => ({ ...prevState, [list.id]: true }))}>
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
          <div>
            <h4>+ Add Task</h4>
          </div>
        )}
      </div>
    </div>
  ))}

        {/* listu generacija */}
        {currentTable !== 0 && (
          <div className='list tables' onClick={() => setShowAddListInput(true)}>
            {showAddListInput ? (
              <div>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Enter list name"
                />
                <button onClick={() => handleAddList(currentTable)}>Add List</button>
              </div>
            ) : (
              <div>
                <h4>+ Add List</h4>
              </div>
            )}
          </div>
        )}

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
