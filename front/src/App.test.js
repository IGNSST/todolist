import { act } from 'react-dom/test-utils';
import { reloadLists, reloadTasks, reloadTables, handleDeleteTable, handleEditTable, handleAddTable, handleDeleteList, handleEditList, handleDeleteTask, handleEditTask, handleNewTask, handleAddList } from './App.js';
import jest from 'jest';

describe('Error handling', () => {
  it('throws an error when fetching lists fails', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Failed to fetch lists'));

    await act(async () => {
      await expect(reloadLists()).rejects.toThrow('Failed to fetch lists');
    });
  });

  it('throws an error when fetching tasks fails', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Failed to fetch tasks'));

    await act(async () => {
      await expect(reloadTasks()).rejects.toThrow('Failed to fetch tasks');
    });
  });

  it('throws an error when fetching tables fails', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Failed to fetch tables'));

    await act(async () => {
      await expect(reloadTables()).rejects.toThrow('Failed to fetch tables');
    });
  });
});


describe('Performance testing', () => {
  it('loads lists, tasks, and tables within a reasonable time', async () => {
    const startTime = performance.now();

    await Promise.all([reloadLists(), reloadTasks(), reloadTables()]);

    const endTime = performance.now();
    const elapsedTime = endTime - startTime;

    // Patikriname, ar praėjo ne daugiau kaip 500 ms
    expect(elapsedTime).toBeLessThan(500);
  });
});

describe('Data loading', () => {
  const functions = [
    { name: 'reloadLists', func: reloadLists },
    { name: 'reloadTasks', func: reloadTasks },
    { name: 'reloadTables', func: reloadTables },
  ];

  functions.forEach(({ name, func }) => {
    it(`loads ${name} data and it is not empty`, async () => {
      const data = await func();
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);
    });
  });
});

// Importuojame funkcijas, kurias norime testuoti
const { handleDeleteTable, handleEditTable, handleAddTable } = require('./example');

describe('handleDeleteTable function', () => {
  it('should delete a table from the list', () => {
    // Sukurkime pradinių duomenų kopiją, kad neužtruktų kitų testų
    const initialTables = [{ id: 1, User_id: 1, name: 'Table 1' }, { id: 2, User_id: 1, name: 'Table 2' }];
    const tableIdToDelete = 1;

    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });
    // Iškviečiame funkciją, kurią testuojame
    const updatedTables = handleDeleteTable(initialTables, tableIdToDelete);

    // Tikriname, ar buvo ištrintas teisingas stalas
    expect(updatedTables).toEqual([{ id: 2, User_id: 1, name: 'Table 2' }]);
  });

  it('should return the original list if table to delete does not exist', () => {
    const initialTables = [{ id: 1, User_id: 1, name: 'Table 1' }, { id: 2, User_id: 1, name: 'Table 2' }];
    const tableIdToDelete = 3;

    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });
    const updatedTables = handleDeleteTable(initialTables, tableIdToDelete);

    // Tikriname, ar grąžintas sąrašas yra toks pat kaip pradinis sąrašas
    expect(updatedTables).toEqual(initialTables);
  });
});

describe('handleEditTable function', () => {
  it('should edit the name of a table', () => {
    const initialTables = [{ id: 1, User_id: 1, name: 'Table 1' }, { id: 2, User_id: 1, name: 'Table 2' }];
    const tableIdToEdit = 1;
    const newName = 'Updated Table';

    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });
    const updatedTables = handleEditTable(initialTables, tableIdToEdit, newName);

    // Tikriname, ar pavadinimas buvo pakeistas teisingai
    expect(updatedTables[0].name).toBe(newName);
  });

  it('should return the original list if table to edit does not exist', () => {
    const initialTables = [{ id: 1, User_id: 1, name: 'Table 1' }, { id: 2, User_id: 1, name: 'Table 2' }];
    const tableIdToEdit = 3;
    const newName = 'Updated Table';

    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });
    const updatedTables = handleEditTable(initialTables, tableIdToEdit, newName);

    // Tikriname, ar grąžintas sąrašas yra toks pat kaip pradinis sąrašas
    expect(updatedTables).toEqual(initialTables);
  });
});

describe('handleAddTable function', () => {
  it('should add a new table to the list', () => {
    const initialTables = [{ id: 1, User_id: 1, name: 'Table 1' }, { id: 2, User_id: 1, name: 'Table 2' }];
    const newTable = { id: 3, User_id: 1, name: 'New Table' };

    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });
    const updatedTables = handleAddTable(initialTables, newTable);

    // Tikriname, ar naujas stalas buvo pridėtas į sąrašą
    expect(updatedTables).toContainEqual(newTable);
  });
});

describe('handleDeleteList function', () => {
  it('should delete a list from the list of lists', () => {
    const initialLists = [{ id: 1, Tables_id: 1, name: 'List 1' }, { id: 2, Tables_id: 1, name: 'List 2' }];
    const listIdToDelete = 1;

    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });
    const updatedLists = handleDeleteList(initialLists, listIdToDelete);

    expect(updatedLists).toEqual([{ id: 2, Tables_id: 1, name: 'List 2' }]);
  });

  it('should return the original list if list to delete does not exist', () => {
    const initialLists = [{ id: 1, Tables_id: 1, name: 'List 1' }, { id: 2, Tables_id: 1, name: 'List 2' }];
    const listIdToDelete = 3;

    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });
    const updatedLists = handleDeleteList(initialLists, listIdToDelete);

    expect(updatedLists).toEqual(initialLists);
  });
});

describe('handleEditList function', () => {
  it('should edit the name of a list', () => {
    const initialLists = [{ id: 1, Tables_id: 1, name: 'List 1' }, { id: 2, Tables_id: 1, name: 'List 2' }];
    const listIdToEdit = 1;
    const newName = 'Updated List';

    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });
    const updatedLists = handleEditList(initialLists, listIdToEdit, newName);

    expect(updatedLists[0].name).toBe(newName);
  });

  it('should return the original list if list to edit does not exist', () => {
    const initialLists = [{ id: 1, Tables_id: 1, name: 'List 1' }, { id: 2, Tables_id: 1, name: 'List 2' }];
    const listIdToEdit = 3;
    const newName = 'Updated List';

    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });
    const updatedLists = handleEditList(initialLists, listIdToEdit, newName);

    expect(updatedLists).toEqual(initialLists);
  });
});

describe('handleDeleteTask function', () => {
  it('should delete a task from the list of tasks', () => {
    const initialTasks = [{ id: 1, Lists_id: 1, name: 'Task 1' }, { id: 2, Lists_id: 1, name: 'Task 2' }];
    const taskIdToDelete = 1;

    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });
    const updatedTasks = handleDeleteTask(initialTasks, taskIdToDelete);

    expect(updatedTasks).toEqual([{ id: 2, Lists_id: 1, name: 'Task 2' }]);
  });

  it('should return the original list if task to delete does not exist', () => {
    const initialTasks = [{ id: 1, Lists_id: 1, name: 'Task 1' }, { id: 2, Lists_id: 1, name: 'Task 2' }];
    const taskIdToDelete = 3;

    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });
    const updatedTasks = handleDeleteTask(initialTasks, taskIdToDelete);

    expect(updatedTasks).toEqual(initialTasks);
  });
});

describe('handleEditTask function', () => {
  it('should edit the details of a task', () => {
    const initialTasks = [{ id: 1, Lists_id: 1, name: 'Task 1', description: 'Description 1' }, { id: 2, Lists_id: 1, name: 'Task 2', description: 'Description 2' }];
    const taskIdToEdit = 1;
    const newName = 'Updated Task';
    const newDescription = 'Updated Description';

    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });
    const updatedTasks = handleEditTask(initialTasks, taskIdToEdit, newName, newDescription);

    expect(updatedTasks[0].name).toBe(newName);
    expect(updatedTasks[0].description).toBe(newDescription);
  });

  it('should return the original list if task to edit does not exist', () => {
    const initialTasks = [{ id: 1, Lists_id: 1, name: 'Task 1', description: 'Description 1' }, { id: 2, Lists_id: 1, name: 'Task 2', description: 'Description 2' }];
    const taskIdToEdit = 3;
    const newName = 'Updated Task';
    const newDescription = 'Updated Description';

    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });
    const updatedTasks = handleEditTask(initialTasks, taskIdToEdit, newName, newDescription);

    expect(updatedTasks).toEqual(initialTasks);
  });
});

describe('handleNewTask function', () => {
  it('should create a new task with provided details', () => {
    const initialTasks = [{ id: 1, Lists_id: 1, name: 'Task 1', description: 'Description 1' }, { id: 2, Lists_id: 1, name: 'Task 2', description: 'Description 2' }];
    const newTaskName = 'New Task';
    const newTaskDescription = 'New Description';

    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });
    const updatedTasks = handleNewTask(initialTasks, newTaskName, newTaskDescription);

    expect(updatedTasks).toContainEqual({ name: newTaskName, description: newTaskDescription });
  });
});

describe('handleAddList function', () => {
  it('should add a new list to the list of lists', () => {
    const initialLists = [{ id: 1, Tables_id: 1, name: 'List 1' }, { id: 2, Tables_id: 1, name: 'List 2' }];
    const newListName = 'New List';

    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });
    const updatedLists = handleAddList(initialLists, newListName);

    expect(updatedLists).toContainEqual({ name: newListName });
  });
});

describe('Tests', () => {
  it('should test reloading lists', () => {
    const result = reloadLists();
    expect(result).toBeTruthy();
  });

  it('should test deleting a table', () => {
    const result = handleDeleteTable(1);
    expect(result).toBeNull();
  });

  it('should test editing a list', () => {
    const updatedList = handleEditList([{ id: 1, name: 'List 1' }], 1, 'New List Name');
    expect(updatedList[0].name).toBe('New List Name');
  });

  it('should test adding a new task', () => {
    const tasks = [{ id: 1, name: 'Task 1' }];
    const newTask = { id: 2, name: 'Task 2' };
    handleNewTask(tasks, newTask);
    expect(tasks).toContainEqual(newTask);
  });

  it('should test asynchronous function with mock implementation', async () => {
    const mockAsyncFunction = jest.fn().mockResolvedValue('success');
    const result = await mockAsyncFunction();
    expect(result).toBe('success');
  });
});
