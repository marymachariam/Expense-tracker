"use client";

import { useState, useEffect } from "react";
import { getBudgets, createBudget, getCategories } from "../lib/api";
import styles from "./budgets.module.css";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
    month: "",
    year: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  async function fetchBudgets() {
    const res = await getBudgets();
    if (Array.isArray(res)) {
      setBudgets(res);
    } else {
      setBudgets([]);
      if (res?.error) setError(res.error);
    }
  }

  async function fetchCategories() {
    const res = await getCategories();
    if (Array.isArray(res)) {
      setCategories(res);
    } else {
      setCategories([]);
    }
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await createBudget(formData);
    if (res?.error) {
      setError(res.error);
      return;
    }
    setError("");
    setFormData({ category_id: "", amount: "", month: "", year: "" });
    fetchBudgets();
  }

  const getMonthName = (month) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[month - 1];
  };

  const getCategoryName = (id) => {
    const cat = categories.find((c) => c.category_id === id);
    return cat ? cat.category_name : "Unknown";
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Budgets</h1>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>Add New Budget</h2>
        <div className={styles.formGrid}>
          <select
            name="category_id"
            onChange={handleChange}
            className={styles.input}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </option>
            ))}
          </select>

          <input
            type="number"
            name="amount"
            placeholder="Budget Amount (Ksh)"
            value={formData.amount}
            onChange={handleChange}
            className={styles.input}
          />

          <input
            type="number"
            name="month"
            placeholder="Month e.g 6"
            value={formData.month}
            onChange={handleChange}
            className={styles.input}
          />

          <input
            type="number"
            name="year"
            placeholder="Year e.g 2026"
            value={formData.year}
            onChange={handleChange}
            className={styles.input}
          />

          <button onClick={handleSubmit} className={styles.button}>
            + Add Budget
          </button>
        </div>
      </div>

      {/* Budgets Table */}
      <div className={styles.listCard}>
        <h2 className={styles.listTitle}>All Budgets</h2>
        {budgets.length === 0 ? (
          <p className={styles.empty}>No budgets yet. Add one above!</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Category</th>
                <th className={styles.th}>Amount</th>
                <th className={styles.th}>Month</th>
                <th className={styles.th}>Year</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((b) => (
                <tr key={b.budget_id}>
                  <td className={styles.td} data-label="Category">
                    {getCategoryName(b.category_id)}
                  </td>
                  <td
                    className={`${styles.td} ${styles.amount}`}
                    data-label="Amount"
                  >
                    Ksh {b.amount}
                  </td>
                  <td className={styles.td} data-label="Month">
                    {getMonthName(b.month)}
                  </td>
                  <td className={styles.td} data-label="Year">
                    {b.year}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
