import { getUser } from "./auth";

const BASE_URL = "http://127.0.0.1:8000";

// Auth
export async function registerUser(data) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function loginUser(data) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// Transactions
export async function getTransactions() {
  const { user_id } = getUser();
  const res = await fetch(`${BASE_URL}/transactions?user_id=${user_id}`);
  return res.json();
}

export async function createTransaction(data) {
  const res = await fetch(`${BASE_URL}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteTransaction(id) {
  const res = await fetch(`${BASE_URL}/transactions/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

// Categories
export async function getCategories() {
  const { user_id } = getUser();
  const res = await fetch(`${BASE_URL}/categories?user_id=${user_id}`);
  return res.json();
}

export async function createCategory(data) {
  const res = await fetch(`${BASE_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteCategory(id) {
  const res = await fetch(`${BASE_URL}/categories/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

// Budgets
export async function getBudgets() {
  const { user_id } = getUser();
  const res = await fetch(`${BASE_URL}/budgets?user_id=${user_id}`);
  return res.json();
}

export async function createBudget(data) {
  const res = await fetch(`${BASE_URL}/budgets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteBudget(id) {
  const res = await fetch(`${BASE_URL}/budgets/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

// Dashboard
export async function getDashboard() {
  const { user_id } = getUser();
  const res = await fetch(`${BASE_URL}/dashboard?user_id=${user_id}`);
  return res.json();
}

export async function getCategorySummary() {
  const { user_id } = getUser();
  const res = await fetch(`${BASE_URL}/dashboard/category-summary?user_id=${user_id}`);
  return res.json();
}

export async function getMonthlySpending() {
  const { user_id } = getUser();
  const res = await fetch(`${BASE_URL}/dashboard/monthly-spending?user_id=${user_id}`);
  return res.json();
}

export async function getBudgetVsSpending() {
  const { user_id } = getUser();
  const res = await fetch(`${BASE_URL}/dashboard/budget-vs-spending?user_id=${user_id}`);
  return res.json();
}

export async function getAlerts() {
  const { user_id } = getUser();
  const res = await fetch(`${BASE_URL}/dashboard/alerts?user_id=${user_id}`);
  return res.json();
}