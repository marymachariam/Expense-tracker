import { getUser, getToken } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Helper: normalizes FastAPI's {detail: "..."} error shape into {error: "..."}
async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    let message = "Something went wrong";

    if (Array.isArray(data.detail)) {
      message = data.detail
        .map((err) => {
          const field = Array.isArray(err.loc)
            ? err.loc[err.loc.length - 1]
            : "field";
          return `${field}: ${err.msg}`;
        })
        .join(", ");
    } else if (typeof data.detail === "string") {
      message = data.detail;
    }

    return { error: message };
  }
  return data;
}

// Helper: builds headers with the auth token attached
function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Auth
export async function registerUser(data) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function loginUser(data) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function verifyOtp(data) {
  const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function resendOtp(email) {
  const res = await fetch(`${BASE_URL}/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
}

export async function forgotPassword(email) {
  const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
}

export async function resetPassword(data) {
  const res = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// Transactions
export async function getTransactions() {
  const res = await fetch(`${BASE_URL}/transactions/`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function createTransaction(data) {
  const res = await fetch(`${BASE_URL}/transactions/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteTransaction(id) {
  const res = await fetch(`${BASE_URL}/transactions/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// Categories
export async function getCategories() {
  const res = await fetch(`${BASE_URL}/categories/`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function createCategory(data) {
  const res = await fetch(`${BASE_URL}/categories/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteCategory(id) {
  const res = await fetch(`${BASE_URL}/categories/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// Budgets
export async function getBudgets() {
  const res = await fetch(`${BASE_URL}/budgets/`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function createBudget(data) {
  const res = await fetch(`${BASE_URL}/budgets/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteBudget(id) {
  const res = await fetch(`${BASE_URL}/budgets/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// Dashboard
export async function getDashboard() {
  const res = await fetch(`${BASE_URL}/dashboard/`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getCategorySummary() {
  const res = await fetch(`${BASE_URL}/dashboard/category-summary`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getMonthlySpending() {
  const res = await fetch(`${BASE_URL}/dashboard/monthly-spending`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getBudgetVsSpending() {
  const res = await fetch(`${BASE_URL}/dashboard/budget-vs-spending`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getAlerts() {
  const res = await fetch(`${BASE_URL}/dashboard/alerts`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// Users / Profile
export async function getProfile() {
  const res = await fetch(`${BASE_URL}/users/me`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function updatePreferences(data) {
  const res = await fetch(`${BASE_URL}/users/me/preferences`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function changePassword(data) {
  const res = await fetch(`${BASE_URL}/users/me/change-password`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}
