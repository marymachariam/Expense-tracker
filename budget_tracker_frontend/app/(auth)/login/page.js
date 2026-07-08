"use client";

import { useState } from "react";
import { loginUser } from "../../lib/api";
import Link from "next/link";
import styles from "./login.module.css";
import { useRouter } from "next/navigation";
import { saveToken } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

 async function handleSubmit(e) {
    e.preventDefault();
    const response = await loginUser(formData);
    if (response.error) {
      setIsError(true);
      setMessage(response.error);
    } else {
      saveToken(response.token, response.user_id, response.username);
      router.push("/dashboard");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}></div>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Login to your Budget Tracker</p>

        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            placeholder="you@email.com"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Password</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <button onClick={handleSubmit} className={styles.button}>
          Login
        </button>

        {message && (
          <p className={`${styles.message} ${isError ? styles.error : ""}`}>
            {message}
          </p>
        )}

        <div className={styles.link}>
          Dont have an account? <Link href="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
}