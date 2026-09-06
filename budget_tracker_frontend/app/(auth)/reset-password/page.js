"use client";

import { useState, Suspense } from "react";
import { resetPassword } from "../../lib/api";
import Link from "next/link";
import styles from "./reset-password.module.css";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!token) {
      setIsError(true);
      setMessage("Missing or invalid reset link.");
      return;
    }

    const response = await resetPassword({ token, new_password: newPassword });

    if (response.error) {
      setIsError(true);
      setMessage(response.error);
      return;
    }

    setIsError(false);
    setMessage("Password reset successfully! Redirecting to login...");
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}></div>
        <h1 className={styles.title}>Reset Password</h1>
        <p className={styles.subtitle}>Enter your new password below</p>

        <div className={styles.formGroup}>
          <label className={styles.label}>New Password</label>
          <input
            type="password"
            name="new_password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={styles.input}
          />
        </div>

        <button onClick={handleSubmit} className={styles.button}>
          Reset Password
        </button>

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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}