import Link from "next/link";
import styles from "./home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>

      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.logo}>Marys</div>
        <h1 className={styles.title}>Budget Tracker</h1>
        <p className={styles.subtitle}>
         Welcome to Marys Budget tracker. Take control of your finances. Track income, expenses,
          set budgets and get smart insights all in one place.
        </p>
        <div className={styles.buttons}>
          <Link href="/register" className={styles.primaryButton}>
            Get Started
          </Link>
          <Link href="/login" className={styles.secondaryButton}>
            Login
          </Link>
        </div>
      </div>
      {/* Features Section */}
      <div className={styles.features}>
        <h2 className={styles.featuresTitle}>Everything you need to manage your money</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}></div>
            <h3 className={styles.featureTitle}>Smart budget Dashboard</h3>
            <p className={styles.featureText}>
              Get a clear overview of your income, expenses and balance at a glance.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}></div>
            <h3 className={styles.featureTitle}>Track your transactions in one place</h3>
            <p className={styles.featureText}>
              Log every income and expense with categories and dates easily.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}></div>
            <h3 className={styles.featureTitle}>Set Budgets seamlessly</h3>
            <p className={styles.featureText}>
              Set monthly budgets per category and track how much you have left.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}></div>
            <h3 className={styles.featureTitle}>Get all time spending Alerts</h3>
            <p className={styles.featureText}>
              Get alerted when you go over budget so you never overspend again.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}