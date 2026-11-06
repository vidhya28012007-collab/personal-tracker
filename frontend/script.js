const API = "/api/expenses";

const form = document.getElementById("expenseForm");
const title = document.getElementById("title");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const date = document.getElementById("date");
const expenseId = document.getElementById("expenseId");

let expenses = [];

// Set today's date
date.value = new Date().toISOString().split("T")[0];

// Load expenses
async function loadExpenses() {
    try {
        const response = await fetch(API);

        if (!response.ok) throw new Error("Unable to load expenses");

        expenses = await response.json();

        displayExpenses();
        calculateTotal();

    } catch (error) {
        alert(error.message);
    }
}

// Add or update expense
form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const expense = {
        title: title.value.trim(),
        amount: Number(amount.value),
        category: category.value,
        expense_date: date.value
    };

    const id = expenseId.value;

    try {
        const response = await fetch(
            id ? `${API}/${id}` : API,
            {
                method: id ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(expense)
            }
        );

        const result = await response.json();

        if (!response.ok) throw new Error(result.error);

        alert(result.message);

        form.reset();
        expenseId.value = "";
        document.getElementById("submitBtn").textContent =
            "Add Expense";

        date.value = new Date().toISOString().split("T")[0];

        loadExpenses();

    } catch (error) {
        alert(error.message);
    }
});

// Display expenses
function displayExpenses() {
    const list = document.getElementById("expenseList");

    const search = document.getElementById("search")
        .value.toLowerCase();

    const filter = document.getElementById("filter").value;

    list.innerHTML = "";

    const filtered = expenses.filter(expense => {
        const matchSearch =
            expense.title.toLowerCase().includes(search);

        const matchCategory =
            filter === "" || expense.category === filter;

        return matchSearch && matchCategory;
    });

    document.getElementById("emptyMessage").style.display =
        filtered.length === 0 ? "block" : "none";

    filtered.forEach(expense => {
        const row = document.createElement("tr");

        const values = [
            expense.title,
            "₹" + Number(expense.amount).toFixed(2),
            expense.category,
            expense.expense_date
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actions = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";
        editButton.addEventListener("click", () => editExpense(expense.id));

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.addEventListener("click", () => deleteExpense(expense.id));

        actions.append(editButton, deleteButton);
        row.appendChild(actions);

        list.appendChild(row);
    });
}

// Calculate total and monthly expense
function calculateTotal() {
    const total = expenses.reduce(
        (sum, expense) => sum + Number(expense.amount), 0
    );

    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();

    const monthly = expenses
        .filter(expense =>
            expense.expense_date.startsWith(`${year}-${month}`)
        )
        .reduce((sum, expense) =>
            sum + Number(expense.amount), 0
        );

    document.getElementById("total").textContent =
        "₹" + total.toFixed(2);

    document.getElementById("monthly").textContent =
        "₹" + monthly.toFixed(2);

    document.getElementById("count").textContent =
        expenses.length;
}

// Edit expense
function editExpense(id) {
    const expense = expenses.find(item => item.id === id);

    if (!expense) return;

    expenseId.value = expense.id;
    title.value = expense.title;
    amount.value = expense.amount;
    category.value = expense.category;
    date.value = expense.expense_date;

    document.getElementById("submitBtn").textContent =
        "Update Expense";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Delete expense
async function deleteExpense(id) {
    if (!confirm("Are you sure you want to delete this expense?")) {
        return;
    }

    try {
        const response = await fetch(`${API}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.error);

        alert(result.message);
        loadExpenses();

    } catch (error) {
        alert(error.message);
    }
}

// Search and filter
document.getElementById("search")
    .addEventListener("input", displayExpenses);

document.getElementById("filter")
    .addEventListener("change", displayExpenses);

// Initial loading
loadExpenses();