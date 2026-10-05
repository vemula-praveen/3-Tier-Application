const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = Number(process.env.PORT || 5001);
const DB_CLIENT = (process.env.DB_CLIENT || 'sqlite').toLowerCase();

app.use(cors());
app.use(express.json());

let dbType = 'sqlite';
let sqliteDb = null;
let mysqlPool = null;

async function initSqlite() {
  const dbPath = path.join(__dirname, 'three_tier_db.sqlite');
  sqliteDb = new sqlite3.Database(dbPath);

  await new Promise((resolve, reject) => {
    sqliteDb.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )`,
      (err) => (err ? reject(err) : resolve())
    );
  });

  await new Promise((resolve, reject) => {
    sqliteDb.get('SELECT COUNT(*) AS count FROM users', (err, row) => {
      if (err) return reject(err);
      if (row.count === 0) {
        sqliteDb.run(
          "INSERT INTO users (name) VALUES ('Praveen'), ('Ravi')",
          (insertErr) => (insertErr ? reject(insertErr) : resolve())
        );
      } else {
        resolve();
      }
    });
  });

  dbType = 'sqlite';
}

async function initMysql() {
  mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'three_tier_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  await mysqlPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL
    )
  `);

  await mysqlPool.query(`
    INSERT INTO users (name)
    SELECT * FROM (
      SELECT 'Praveen' AS name
      UNION ALL SELECT 'Ravi'
    ) AS names
    WHERE NOT EXISTS (
      SELECT 1 FROM users WHERE users.name = names.name
    )
  `);

  dbType = 'mysql';
}

async function initializeDatabase() {
  if (DB_CLIENT === 'mysql') {
    try {
      await initMysql();
      console.log('Connected to MySQL database.');
      return;
    } catch (error) {
      console.warn('MySQL connection failed, falling back to SQLite:', error.message);
    }
  }

  await initSqlite();
  console.log('Using SQLite database.');
}

async function readUsers() {
  if (dbType === 'mysql') {
    const [rows] = await mysqlPool.query('SELECT id, name FROM users ORDER BY id');
    return rows;
  }

  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT id, name FROM users ORDER BY id', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function createUser(name) {
  const cleanName = String(name || '').trim();

  if (!cleanName) {
    throw new Error('Name is required.');
  }

  if (dbType === 'mysql') {
    const [result] = await mysqlPool.execute('INSERT INTO users (name) VALUES (?)', [cleanName]);
    return { id: result.insertId, name: cleanName };
  }

  return new Promise((resolve, reject) => {
    sqliteDb.run('INSERT INTO users (name) VALUES (?)', [cleanName], function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, name: cleanName });
    });
  });
}

app.get('/api/health', (req, res) => {
  res.json({ success: true, dbType, message: 'API is running.' });
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await readUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Unable to fetch users.' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name } = req.body;
    const newUser = await createUser(name);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ message: error.message || 'Unable to create user.' });
  }
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });
