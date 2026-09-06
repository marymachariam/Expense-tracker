"use client";

import { useState, useEffect } from "react";
import { getCategories, createCategory } from "../lib/api";
import styles from "./categories.module.css";
import { getUser } from "../lib/auth";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    category_name: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const res = await getCategories();
    if (Array.isArray(res)) {
      setCategories(res);
    } else {
      setCategories([]);
      if (res?.error) setError(res.error);
    }
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await createCategory(formData);
    if (res?.error) {
      setError(res.error);
      return;
    }
    setError("");
    setFormData({ category_name: "" });
    fetchCategories();
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}> Categories</h1>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>Add New Category</h2>
        <div className={styles.formRow}>
          <input
            type="text"
            name="category_name"
            placeholder="Category name e.g Food, Rent, Transport"
            value={formData.category_name}
            onChange={handleChange}
            className={styles.input}
          />
          <button onClick={handleSubmit} className={styles.button}>
            + Add Category
          </button>
        </div>
      </div>

      <div className={styles.listCard}>
        <h2 className={styles.listTitle}>All Categories</h2>
        {categories.length === 0 ? (
          <p className={styles.empty}>No categories yet. Add one above!</p>
        ) : (
          <div className={styles.grid}>
            {categories.map((cat) => (
              <div key={cat.category_id} className={styles.categoryItem}>
                {cat.category_name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}