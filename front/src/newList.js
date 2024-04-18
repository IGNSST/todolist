import React, { UseState } from 'react';

const newList = ({ onAddList }) => {
    const [showAddListInput, setShowAddListInput] = UseState(false);
    const [newListName, setNewListName] = UseState('');

    const handleAddList = () => {
      if (!newListName.trim()) return;
      onAddList(newListName);
      setNewListName('');
      setShowAddListInput(false);
    };

    return (
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
    );
  };


export default newList;