const express = require("express");
const router = express.Router();

// 1. View all expenses
router.get("/", (req, res) => {
    req.db.all(
        "SELECT * FROM expenses ORDER BY expense_date DESC",
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// 2. Add expense
router.post("/", (req, res) => {
    const { title, amount, category, expense_date } = req.body;

    if (!title || !category || !expense_date ||
        !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({ error: "Enter valid expense details" });
    }

    req.db.run(
        `INSERT INTO expenses (title, amount, category, expense_date)
         VALUES (?, ?, ?, ?)`,
        [title, Number(amount), category, expense_date],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            res.json({
                message: "Expense added successfully",
                id: this.lastID
            });
        }
    );
});

// 3. Edit expense
router.put("/:id", (req, res) => {
    const { title, amount, category, expense_date } = req.body;

    if (!title || !category || !expense_date ||
        !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({ error: "Enter valid expense details" });
    }

    req.db.run(
        `UPDATE expenses
         SET title=?, amount=?, category=?, expense_date=?
         WHERE id=?`,
        [title, Number(amount), category, expense_date, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({ error: "Expense not found" });
            }

            res.json({ message: "Expense updated successfully" });
        }
    );
});

// 4. Delete expense
router.delete("/:id", (req, res) => {
    req.db.run(
        "DELETE FROM expenses WHERE id=?",
        [req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({ error: "Expense not found" });
            }

            res.json({ message: "Expense deleted successfully" });
        }
    );
});

module.exports = router;