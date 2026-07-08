"use client";

import { useState, useEffect } from "react";
import { getTransactions, createTransaction, deleteTransaction, getCategories } from "../lib/api";
import styles from "./transactions.module.css";
import { getUser } from "../lib/auth";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    user_id: null,
    amount: "",
    category_id: "",
    type: "expense",
    description: "",
    date: "",
  });

  useEffect(() => {
    const { user_id } = getUser();
    setFormData((prev) => ({ ...prev, user_id }));
    fetchTransactions();
    fetchCategories();
  }, []);
  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  async function fetchTransactions() {
    const res = await getTransactions();
    setTransactions(res.transactions);
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
    await createTransaction(formData);
    fetchTransactions();
  }

  async function handleDelete(id) {
    await deleteTransaction(id);
    fetchTransactions();
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}> Transactions</h1>

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
          <select name="category_id" onChange={handleChange} className={styles.input}>
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat[0]} value={cat[0]}>{cat[2]}</option>
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
              <tr key={t[0]}>
                <td className={styles.td}>{t[5]}</td>
                <td className={`${styles.td} ${t[4] === "income" ? styles.income : styles.expense}`}>
                  Ksh {t[3]}
                </td>
                <td className={styles.td}>
                  <span className={`${styles.badge} ${t[4] === "income" ? styles.incomeBadge : styles.expenseBadge}`}>
                    {t[4]}
                  </span>
                </td>
                <td className={styles.td}>{t[6]}</td>
                <td className={styles.td}>
                  <button className={styles.deleteButton} onClick={() => handleDelete(t[0])}>
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