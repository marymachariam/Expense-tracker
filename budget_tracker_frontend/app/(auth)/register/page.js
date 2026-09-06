"use client";

import { useState } from "react";
import { registerUser } from "../../lib/api";
import Link from "next/link";
import styles from "./register.module.css";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
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
    const response = await registerUser(formData);

    if (response.error) {
      setIsError(true);
      setMessage(response.error);
      return;
    }

    setIsError(false);
    router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}></div>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Start tracking your budget today</p>

        <div className={styles.formGroup}>
          <label className={styles.label}>Username</label>
          <input
            type="text"
            name="username"
            placeholder="Your name"
            value={formData.username}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

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
          Create Account
        </button>

        {message && (
          <p className={`${styles.message} ${isError ? styles.error : ""}`}>
            {message}
          </p>
        )}

        <div className={styles.link}>
          Already have an account? <Link href="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
}