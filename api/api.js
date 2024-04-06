const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(cors());

const port = 3001;

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "to_do_list",
});

con.connect((err) => {
  if (err) throw err;
});



// Retrieve all lists
app.get("/lists", (req, res) => {
  const sql = "SELECT * FROM lists ORDER BY possition";
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.status(200).json(result);
  });
});

// Create a new list
app.post("/lists", (req, res) => {
  const { name, possition } = req.body;
  const sql = "INSERT INTO lists (name, possition) VALUES (?, ?)";
  con.query(sql, [name, possition], (err, result) => {
    if (err) throw err;
    res.status(200).json({
      status: "success",
      data: { id: result.insertId },
    });
  });
});

// Retrieve a specific list
app.get("/lists/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM lists WHERE id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.status(200).json(result[0]);
  });
});

// Update a specific list
app.put("/lists/:id", (req, res) => {
  const id = req.params.id;
  const { name, possition } = req.body;
  const updateSql = "UPDATE lists SET name = ?, possition = ? WHERE id = ?";
  con.query(updateSql, [name, possition, id], (err) => {
    if (err) throw err;
    res.status(200).json({ status: "success" });
  });
});

// Delete a specific list
app.delete("/lists/:id", (req, res) => {
  const id = req.params.id;
  const deleteSql = "DELETE FROM lists WHERE id = ?";
  con.query(deleteSql, [id], (err) => {
    if (err) throw err;
    res.status(200).json({ status: "success" });
  });
});

// Retrieve all tasks
app.get("/tasks", (req, res) => {
  const sql = "SELECT * FROM tasks";
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.status(200).json(result);
  });
});

// Create a new task/card in a specific list
app.post("/tasks", (req, res) => {
  const { list_id, title, description, due_date } = req.body; // Extracting data from request body
  const sql =
    "INSERT INTO tasks (Lists_id, title, description, due_date) VALUES (?, ?, ?, ?)";
  con.query(sql, [list_id, title, description, due_date], (err, result) => {
    if (err) {
      console.error("Error creating task:", err);
      return res.status(500).json({ status: "error", message: "Failed to create task" });
    }
    res.status(200).json({
      status: "success",
      data: { id: result.insertId },
    });
  });
});


// Retrieve tasks for a specific list
app.get("/lists/:id/tasks", (req, res) => {
  const listId = req.params.id;
  const sql = "SELECT * FROM tasks WHERE Lists_id = ?";
  con.query(sql, [listId], (err, result) => {
    if (err) throw err;
    res.status(200).json(result);
  });
});
  
// Create a new task/card in a specific list
app.post("/lists/:List_id/tasks", (req, res) => {
    const listId = req.params.list_id;
    const { title, description, due_date } = req.body;
    const sql =
      "INSERT INTO tasks (Lists_id, title, description, due_date) VALUES (?, ?, ?, ?)";
    con.query(sql, [listId, title, description, due_date], (err, result) => {
      if (err) throw err;
      res.status(200).json({
        status: "success",
        data: { id: result.insertId },
      });
    });
  });
  
  // Retrieve a specific task/card in a specific list
app.get("/lists/:List_id/tasks/:task_id", (req, res) => {
    const listId = req.params.list_id;
    const taskId = req.params.task_id;
    const sql = "SELECT * FROM tasks WHERE Lists_id = ? AND id = ?";
    con.query(sql, [listId, taskId], (err, result) => {
      if (err) throw err;
      res.status(200).json(result[0]);
    });
  });
  
  // Update a specific task/card in a specific list
app.put("/lists/:List_id/tasks/:task_id", (req, res) => {
    const listId = req.params.list_id;
    const taskId = req.params.task_id;
    const { title, description, due_date } = req.body;
    const updateSql =
      "UPDATE tasks SET title = ?, description = ?, due_date = ? WHERE Lists_id = ? AND id = ?";
    con.query(
      updateSql,
      [title, description, due_date, listId, taskId],
      (err) => {
        if (err) throw err;
        res.status(200).json({ status: "success" });
      }
    );
  });
  
  // Delete a specific task/card in a specific list
app.delete("/lists/:List_id/tasks/:task_id", (req, res) => {
    const listId = req.params.list_id;
    const taskId = req.params.task_id;
    const deleteSql = "DELETE FROM tasks WHERE Lists_id = ? AND id = ?";
    con.query(deleteSql, [listId, taskId], (err) => {
      if (err) throw err;
      res.status(200).json({ status: "success" });
    });
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });