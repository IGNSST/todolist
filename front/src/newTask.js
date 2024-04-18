import React from 'react';

function AddTask({ listId, newTaskName, setNewTaskName, handleNewTask }) {
  return (
    <div>
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
      ))}  </div>
  );
}

export default AddTask;
