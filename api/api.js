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



app.post("/register", (req, res) => {
  const { username, password, email } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql = "INSERT INTO Users (Username, Password, Email) VALUES (?, ?, ?)";
  con.query(sql, [username, hashedPassword, email], (err, result) => {
      if (err) {
          console.error("Error registering user:", err);
          return res.status(500).json({ status: "error", message: "Failed to register user" });
      }
      res.status(200).json({ status: "success", data: { id: result.insertId } });
  });
});

// Login user
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT ID, Password FROM Users WHERE Username = ?";
  con.query(sql, [username], (err, result) => {
      if (err) {
          console.error("Error logging in:", err);
          return res.status(500).json({ status: "error", message: "Failed to login" });
      }
      if (result.length === 0 || !bcrypt.compareSync(password, result[0].Password)) {
          return res.status(401).json({ status: "error", message: "Invalid username or password" });
      }
      res.status(200).json({ status: "success", data: { id: result[0].ID } });
  });
});

app.get("/tables", (req, res) => {
  const sql = "SELECT * FROM tables";
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.status(200).json(result);
  });
});

// Create a new table
app.post("/tables", (req, res) => {
  const { name, User_id} = req.body;
  const sql = "INSERT INTO Tables (name, User_id) VALUES (?, ?)";
  con.query(sql, [name, User_id], (err, result) => {
    if (err) throw err;
    res.status(200).json({
      status: "success",
      data: { id: result.insertId },
    });
  });
});

// Update a specific table
app.put("/tables/:id", (req, res) => {
  const id = req.params.id;
  const { name } = req.body;
  const updateSql = "UPDATE Tables SET name = ? WHERE id = ?";
  con.query(updateSql, [name, id], (err) => {
    if (err) throw err;
    res.status(200).json({ status: "success" });
  });
});

// Delete a specific table
app.delete("/tables/:id", (req, res) => {
  const id = req.params.id;
  const deleteSql = "DELETE FROM Tables WHERE id = ?";
  con.query(deleteSql, [id], (err) => {
    if (err) throw err;
    res.status(200).json({ status: "success" });
  });
});

// Retrieve all lists
app.get("/lists", (req, res) => {
  const sql = "SELECT * FROM lists";
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.status(200).json(result);
  });
});

// Create a new list
app.post("/lists", (req, res) => {
  const { name, Tables_id} = req.body;
  const sql = "INSERT INTO lists (name, Tables_id) VALUES (?, ?)";
  con.query(sql, [name, Tables_id], (err, result) => {
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
  const { name } = req.body;
  const updateSql = "UPDATE lists SET name = ? WHERE id = ?";
  con.query(updateSql, [name, id], (err) => {
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

  
  app.put("/tasks/:task_id", (req, res) => {
    const taskId = req.params.task_id;
    const { title, description, due_date } = req.body;
    const updateSql =
      "UPDATE tasks SET title = ?, description = ?, due_date = ? WHERE id = ?";
    con.query(
      updateSql,
      [title, description, due_date, taskId],
      (err) => {
        if (err) throw err;
        res.status(200).json({ status: "success" });
      }
    );
  });

  app.put("/list/:task_id", (req, res) => {
    const taskId = req.params.task_id;
    const { List_id } = req.body;
    const updateSql =
      "UPDATE tasks SET Lists_id = ? WHERE id = ?";
    con.query(
      updateSql,
      [List_id, taskId],
      (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: "Internal server error" });
          return;
        }
        res.status(200).json({ status: "success" });
      }
    );
  });
  
  
  // Delete a specific task/card in a specific list
app.delete("/tasks/:task_id", (req, res) => {
    const taskId = req.params.task_id;
    const deleteSql = "DELETE FROM tasks WHERE id = ?";
    con.query(deleteSql, [taskId], (err) => {
      if (err) throw err;
      res.status(200).json({ status: "success" });
    });
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });