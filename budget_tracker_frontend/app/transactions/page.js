"use client";

import { useState, useEffect } from "react";
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  getCategories,
} from "../lib/api";
import styles from "./transactions.module.css";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    category_id: "",
    type: "expense",
    description: "",
    date: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  async function fetchTransactions() {
    const res = await getTransactions();
    if (Array.isArray(res)) {
      setTransactions(res);
    } else {
      setTransactions([]);
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
    const res = await createTransaction(formData);
    if (res?.error) {
      setError(res.error);
      return;
    }
    setError("");
    fetchTransactions();
  }

  async function handleDelete(id) {
    await deleteTransaction(id);
    fetchTransactions();
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}> Transactions</h1>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>Add New Transaction</h2>
        <div className={styles.formGrid}>
          <input
            type="number"
            name="amount"
            placeholder="Amount (Ksh)"
            value={formData.amount}
            onChange={handleChange}
            className={styles.input}
          />
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
          <select name="type" onChange={handleChange} className={styles.input}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className={styles.input}
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={styles.input}
          />
          <button onClick={handleSubmit} className={styles.button}>
            + Add Transaction
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className={styles.tableCard}>
        <h2 className={styles.tableTitle}>All Transactions</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Description</th>
              <th className={styles.th}>Amount</th>
              <th className={styles.th}>Type</th>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.transaction_id}>
                <td className={styles.td} data-label="Description">
                  {t.description}
                </td>
                <td
                  className={`${styles.td} ${t.type === "income" ? styles.income : styles.expense}`}
                  data-label="Amount"
                >
                  Ksh {t.amount}
                </td>
                <td className={styles.td} data-label="Type">
                  <span
                    className={`${styles.badge} ${t.type === "income" ? styles.incomeBadge : styles.expenseBadge}`}
                  >
                    {t.type}
                  </span>
                </td>
                <td className={styles.td} data-label="Date">
                  {t.date}
                </td>
                <td className={styles.td} data-label="Action">
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(t.transaction_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <p className={styles.empty}>No transactions yet. Add one above!</p>
        )}
      </div>
    </div>
  );
}
