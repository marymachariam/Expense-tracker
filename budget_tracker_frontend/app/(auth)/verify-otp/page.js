"use client";

import { useState, Suspense } from "react";
import { verifyOtp, resendOtp } from "../../lib/api";
import Link from "next/link";
import styles from "./verify-otp.module.css";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otpCode, setOtpCode] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const response = await verifyOtp({ email, otp_code: otpCode });

    if (response.error) {
      setIsError(true);
      setMessage(response.error);
      return;
    }

    setIsError(false);
    setMessage("Email verified! Redirecting to login...");
    setTimeout(() => router.push("/login"), 1500);
  }

  async function handleResend() {
    const response = await resendOtp(email);
    if (response.error) {
      setIsError(true);
      setMessage(response.error);
    } else {
      setIsError(false);
      setMessage("A new code has been sent to your email.");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}></div>
        <h1 className={styles.title}>Verify Your Email</h1>
        <p className={styles.subtitle}>
          Enter the code sent to {email || "your email"}
        </p>

        <div className={styles.formGroup}>
          <label className={styles.label}>Verification Code</label>
          <input
            type="text"
            name="otp_code"
            placeholder="6-digit code"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            className={styles.input}
            maxLength={6}
          />
        </div>

        <button onClick={handleSubmit} className={styles.button}>
          Verify
        </button>

        {message && (
          <p className={`${styles.message} ${isError ? styles.error : ""}`}>
            {message}
          </p>
        )}

        <div className={styles.link}>
          Didnt get a code?{" "}
          <button onClick={handleResend} className={styles.linkButton}>
            Resend
          </button>
        </div>

        <div className={styles.link}>
          <Link href="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpForm />
    </Suspense>
  );
}