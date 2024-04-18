import React from 'react';
import AddTask from './AddTask';

function List({ lists, tasks, showAddTaskInput, setShowAddTaskInput, newTaskName, setNewTaskName, handleNewTask, reloadLists, reloadTasks }) {
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
              <AddTask
                listId={list.id}
                newTaskName={newTaskName}
                setNewTaskName={setNewTaskName}
                handleNewTask={handleNewTask}
              />
            ) : (
              <div className="add-task">
                <h1>+ Add Task</h1>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default List;
