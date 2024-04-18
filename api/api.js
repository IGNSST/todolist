// Prijungti reikalingas bibliotekas
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");

// Sukurti aplikacijos objektą
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(cors());

// Nustatyti serverio prievadą
const port = 3001;

// Sukurti duomenų bazės ryšį
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "to_do_list",
});

con.connect((err) => {
  if (err) throw err;
});

// Sukurti naują vartotoją
app.post("/register", (req, res) => {
  const { username, password, email } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql = "INSERT INTO Users (Username, Password, Email) VALUES (?, ?, ?)";
  con.query(sql, [username, hashedPassword, email], (err, result) => {
      if (err) {
          console.error("Klaida registruojant vartotoją:", err);
          return res.status(500).json({ status: "error", message: "Nepavyko užsiregistruoti vartotojo" });
      }
      res.status(200).json({ status: "success", data: { id: result.insertId } });
  });
});

// Prisijungti prie vartotojo
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT ID, Password FROM Users WHERE Username = ?";
  con.query(sql, [username], (err, result) => {
      if (err) {
          console.error("Klaida prisijungiant:", err);
          return res.status(500).json({ status: "error", message: "Nepavyko prisijungti" });
      }
      if (result.length === 0 || !bcrypt.compareSync(password, result[0].Password)) {
          return res.status(401).json({ status: "error", message: "Neteisingas vartotojo vardas arba slaptažodis" });
      }
      res.status(200).json({ status: "success", data: { id: result[0].ID } });
  });
});

// Gauti visas lentelės
app.get("/tables", (req, res) => {
  const sql = "SELECT * FROM tables";
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.status(200).json(result);
  });
});

// Sukurti naują lentelę
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

// Atnaujinti konkretų lentelę
app.put("/tables/:id", (req, res) => {
  const id = req.params.id;
  const { name } = req.body;
  const updateSql = "UPDATE Tables SET name = ? WHERE id = ?";
  con.query(updateSql, [name, id], (err) => {
    if (err) throw err;
    res.status(200).json({ status: "success" });
  });
});

// Ištrinti konkretų lentelę
app.delete("/tables/:id", (req, res) => {
  const id = req.params.id;
  const deleteSql = "DELETE FROM Tables WHERE id = ?";
  con.query(deleteSql, [id], (err) => {
    if (err) throw err;
    res.status(200).json({ status: "success" });
  });
});

// Gauti visas sąrašus
app.get("/lists", (req, res) => {
  const sql = "SELECT * FROM lists";
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.status(200).json(result);
  });
});

// Sukurti naują sąrašą
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

// Gauti konkretų sąrašą
app.get("/lists/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM lists WHERE id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.status(200).json(result[0]);
  });
});

// Atnaujinti konkretų sąrašą
app.put("/lists/:id", (req, res) => {
  const id = req.params.id;
  const { name } = req.body;
  const updateSql = "UPDATE lists SET name = ? WHERE id = ?";
  con.query(updateSql, [name, id], (err) => {
    if (err) throw err;
    res.status(200).json({ status: "success" });
  });
});

// Ištrinti konkretų sąrašą
app.delete("/lists/:id", (req, res) => {
  const id = req.params.id;
  const deleteSql = "DELETE FROM lists WHERE id = ?";
  con.query(deleteSql, [id], (err) => {
    if (err) throw err;
    res.status(200).json({ status: "success" });
  });
});

// Gauti visas užduotis
app.get("/tasks", (req, res) => {
  const sql = "SELECT * FROM tasks";
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.status(200).json(result);
  });
});

// Sukurti naują užduotį/kortelę konkretiame sąraše
app.post("/tasks", (req, res) => {
  const { list_id, title, description, due_date } = req.body; // Ištraukti duomenis iš užklausos kūno
  const sql =
    "INSERT INTO tasks (Lists_id, title, description, due_date) VALUES (?, ?, ?, ?)";
  con.query(sql, [list_id, title, description, due_date], (err, result) => {
    if (err) {
      console.error("Klaida kuriant užduotį:", err);
      return res.status(500).json({ status: "error", message: "Nepavyko sukurti užduoties" });
    }
    res.status(200).json({
      status: "success",
      data: { id: result.insertId },
    });
  });
});

// Atnaujinti konkretų užduotį/kortelę
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

// Atnaujinti sąrašo užduotį/kortelę
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
        res.status(500).json({ error: "Vidinė serverio klaida" });
        return;
      }
      res.status(200).json({ status: "success" });
    }
  );
});

// Ištrinti konkretų užduotį/kortelę
app.delete("/tasks/:task_id", (req, res) => {
    const taskId = req.params.task_id;
    const deleteSql = "DELETE FROM tasks WHERE id = ?";
    con.query(deleteSql, [taskId], (err) => {
      if (err) throw err;
      res.status(200).json({ status: "success" });
    });
  });

// Paleisti serverį ir laukti užklausų
app.listen(port, () => {
  console.log(`Pavyzdinė programa klausosi prievado ${port}`);
});
