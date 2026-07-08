"use client";

import { useState, useEffect } from "react";
import { getBudgets, createBudget, getCategories } from "../lib/api";
import styles from "./budgets.module.css";
import { getUser } from "../lib/auth";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    user_id: null,
    category_id: "",
    amount: "",
    month: "",
    year: "",
  });

  useEffect(() => {
    const { user_id } = getUser();
    setFormData((prev) => ({ ...prev, user_id }));
    fetchBudgets();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  async function fetchBudgets() {
    const res = await getBudgets();
    setBudgets(res.budgets);
  }

  async function fetchCategories() {
    const res = await getCategories();
    setCategories(res.categories);
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await createBudget(formData);
    setFormData({ user_id: 1, category_id: "", amount: "", month: "", year: "" });
    fetchBudgets();
  }

  const getMonthName = (month) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[month - 1];
  };

  const getCategoryName = (id) => {
    const cat = categories.find((c) => c[0] === id);
    return cat ? cat[2] : "Unknown";
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Budgets</h1>

      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>Add New Budget</h2>
        <div className={styles.formGrid}>
          <select name="category_id" onChange={handleChange} className={styles.input}>
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat[0]} value={cat[0]}>{cat[2]}</option>
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
                <tr key={b[0]}>
                  <td className={styles.td}>{getCategoryName(b[2])}</td>
                  <td className={`${styles.td} ${styles.amount}`}>Ksh {b[3]}</td>
                  <td className={styles.td}>{getMonthName(b[4])}</td>
                  <td className={styles.td}>{b[5]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}