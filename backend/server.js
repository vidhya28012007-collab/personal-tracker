const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Database folder
const dbFolder = path.join(__dirname, "../database");

if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder, { recursive: true });
}

// Database connection
const db = new sqlite3.Database(
    path.join(dbFolder, "expenses.db")
);

// Create table
db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        expense_date TEXT NOT NULL
    )
`);

// Make database available to routes
app.use((req, res, next) => {
    req.db = db;
    next();
});

// API routes
app.use("/api/expenses",
    require("./routes/expenseRoutes")
);

// Frontend
app.use(express.static(
    path.join(__dirname, "../frontend")
));

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../frontend/index.html")
    );
});

// Start server
app.listen(PORT, () => {
    console.log(`Expense Tracker running on port ${PORT}`);
});