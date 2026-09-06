"use client";

import { useState } from "react";
import { forgotPassword } from "../../lib/api";
import Link from "next/link";
import styles from "./forgot-password.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const response = await forgotPassword(email);

    if (response.error) {
      setIsError(true);
      setMessage(response.error);
      return;
    }

    setIsError(false);
    setSubmitted(true);
    setMessage(response.message || "If an account with that email exists, a reset link has been sent.");
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}></div>
        <h1 className={styles.title}>Forgot Password</h1>
        <p className={styles.subtitle}>
          Enter your email and well send you a reset link
        </p>

        {!submitted && (
          <>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
              />
            </div>

            <button onClick={handleSubmit} className={styles.button}>
              Send Reset Link
            </button>
          </>
        )}

        {message && (
          <p className={`${styles.message} ${isError ? styles.error : ""}`}>
            {message}
          </p>
        )}

        <div className={styles.link}>
          <Link href="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
}