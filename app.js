const STORAGE_KEY = "expense-tracker-transactions";

const form = document.getElementById("expense-form");
const nameInput = document.getElementById("name");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const list = document.getElementById("expense-list");
const emptyState = document.getElementById("empty-state");
const countBadge = document.getElementById("count");
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseTotalEl = document.getElementById("expenseTotal");

let transactions = loadTransactions();

function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function formatCurrency(value) {
  return `$${Math.abs(value).toFixed(2)}`;
}

function render() {
  list.innerHTML = "";

  if (transactions.length === 0) {
    list.appendChild(emptyState);
  } else {
    transactions
      .slice()
      .reverse()
      .forEach((t) => {
        const isIncome = t.category === "Income";
        const li = document.createElement("li");
        li.className = "expense-item";
        li.innerHTML = `
          <div class="expense-info">
            <span class="expense-name">${escapeHtml(t.name)}</span>
            <span class="expense-category">${escapeHtml(t.category)}</span>
          </div>
          <div class="expense-right">
            <span class="expense-amount ${isIncome ? "income" : "expense"}">
              ${isIncome ? "+" : "-"}${formatCurrency(t.amount)}
            </span>
            <button class="delete-btn" data-id="${t.id}" aria-label="Delete transaction">&times;</button>
          </div>
        `;
        list.appendChild(li);
      });
  }

  countBadge.textContent = transactions.length;
  updateSummary();
  saveTransactions();
}

function updateSummary() {
  const income = transactions
    .filter((t) => t.category === "Income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.category !== "Income")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  balanceEl.textContent = `${balance < 0 ? "-" : ""}${formatCurrency(balance)}`;
  incomeEl.textContent = formatCurrency(income);
  expenseTotalEl.textContent = formatCurrency(expense);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;

  if (!name || isNaN(amount) || amount <= 0) {
    return;
  }

  transactions.push({
    id: Date.now().toString(),
    name,
    amount,
    category,
  });

  form.reset();
  nameInput.focus();
  render();
});

list.addEventListener("click", (e) => {
  const btn = e.target.closest(".delete-btn");
  if (!btn) return;

  const id = btn.dataset.id;
  transactions = transactions.filter((t) => t.id !== id);
  render();
});

render();
