"use client";

import { useState, useEffect } from "react";
import { getCategories, createCategory } from "../lib/api";
import styles from "./categories.module.css";
import { getUser } from "../lib/auth";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    user_id: null,
    category_name: "",
  });

  useEffect(() => {
    const { user_id } = getUser();
    setFormData((prev) => ({ ...prev, user_id }));
    fetchCategories();
  }, []);


  async function fetchCategories() {
    const res = await getCategories();
    setCategories(res.categories);
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await createCategory(formData);
    setFormData({ user_id: 1, category_name: "" });
    fetchCategories();
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}> Categories</h1>

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
              <div key={cat[0]} className={styles.categoryItem}>
                 {cat[2]}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}