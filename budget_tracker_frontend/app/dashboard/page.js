"use client";

import { useState, useEffect } from "react";
import {
  getDashboard,
  getCategorySummary,
  getMonthlySpending,
  getBudgetVsSpending,
  getAlerts,
} from "../lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#ef4444"];

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [budgetVs, setBudgetVs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [s, c, m, b, a] = await Promise.all([
          getDashboard(),
          getCategorySummary(),
          getMonthlySpending(),
          getBudgetVsSpending(),
          getAlerts(),
        ]);

        // Guard against error responses or unexpected shapes —
        // fall back to safe defaults so .map() never crashes.
        setSummary(s && !s.detail ? s : {
          total_income: 0,
          total_expenses: 0,
          remaining_balance: 0,
          number_of_transactions: 0,
        });
        setCategories(Array.isArray(c?.category_summary) ? c.category_summary : []);
        setMonthly(Array.isArray(m?.monthly_spending) ? m.monthly_spending : []);
        setBudgetVs(Array.isArray(b?.budget_vs_actual) ? b.budget_vs_actual : []);
        setAlerts(Array.isArray(a?.alerts) ? a.alerts : []);

        if (c?.detail || m?.detail || b?.detail || a?.detail) {
          setError("Some dashboard data could not be loaded. Please try logging in again.");
        }
      } catch (err) {
        setError("Failed to load dashboard data.");
      }
    }
    fetchAll();
  }, []);

  if (!summary) return <p style={{ padding: "2rem" }}>Loading dashboard...</p>;

  return (
    <div className="dash-page">
      <h1 className="dash-title"> Budget Tracker Dashboard</h1>

      {error && <div className="dash-error">{error}</div>}

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card" style={{ background: "#6366f1" }}>
          <p className="summary-label">Total Income</p>
          <h2 className="summary-value">Ksh {summary.total_income}</h2>
        </div>
        <div className="summary-card" style={{ background: "#ef4444" }}>
          <p className="summary-label">Total Expenses</p>
          <h2 className="summary-value">Ksh {summary.total_expenses}</h2>
        </div>
        <div className="summary-card" style={{ background: "#10b981" }}>
          <p className="summary-label">Remaining Balance</p>
          <h2 className="summary-value">Ksh {summary.remaining_balance}</h2>
        </div>
        <div className="summary-card" style={{ background: "#f59e0b" }}>
          <p className="summary-label">Transactions</p>
          <h2 className="summary-value">{summary.number_of_transactions}</h2>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Bar Chart - Monthly Spending */}
        <div className="card">
          <h3 className="card-title"> Monthly Spending</h3>
          {monthly.length === 0 ? (
            <p className="empty-note">No spending data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250} minWidth={0}>
              <BarChart data={monthly}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart - Category Breakdown */}
        <div className="card">
          <h3 className="card-title">Spending by Category</h3>
          {categories.length === 0 ? (
            <p className="empty-note">No category data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250} minWidth={0}>
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {categories.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Budget vs Spending Table */}
      <div className="card table-card">
        <h3 className="card-title">Budget vs Actual Spending</h3>
        {budgetVs.length === 0 ? (
          <p className="empty-note">No budget data yet.</p>
        ) : (
          <div className="table-scroll">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Budget</th>
                  <th>Spent</th>
                  <th>Difference</th>
                </tr>
              </thead>
              <tbody>
                {budgetVs.map((row, i) => (
                  <tr key={i}>
                    <td>{row.category}</td>
                    <td>Ksh {row.budget}</td>
                    <td>Ksh {row.spent}</td>
                    <td style={{ color: row.difference < 0 ? "#ef4444" : "#10b981", fontWeight: "bold" }}>
                      Ksh {row.difference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alerts */}
      <div className="card">
        <h3 className="card-title"> Spending Alerts</h3>
        {alerts.length === 0 && <p className="empty-note">No alerts at the moment</p>}
        {alerts.map((alert, i) => (
          <div
            key={i}
            className="alert-row"
            style={{
              background: alert.status === "OVERSPENT" ? "#fef2f2" : "#f0fdf4",
              borderLeft: `4px solid ${alert.status === "OVERSPENT" ? "#ef4444" : "#10b981"}`,
            }}
          >
            <strong>{alert.category}</strong> —
            {alert.status === "OVERSPENT"
              ? ` Overspent by Ksh ${alert.over_by}`
              : ` Within budget ✓`}
          </div>
        ))}
      </div>

      <style jsx>{`
        .dash-page {
          padding: 2rem;
          font-family: sans-serif;
          background: #f1f5f9;
          min-height: 100vh;
        }

        .dash-title {
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          color: #1e293b;
        }

        .dash-error {
          background: #fef2f2;
          color: #ef4444;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .summary-card {
          color: white;
          border-radius: 12px;
          padding: 1.5rem;
          min-width: 0;
        }

        .summary-label {
          margin: 0;
          font-size: 0.85rem;
          opacity: 0.8;
        }

        .summary-value {
          margin: 0.5rem 0 0;
          font-size: 1.6rem;
          word-break: break-word;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          min-width: 0;
        }

        .charts-grid .card {
          margin-bottom: 0;
        }

        .card-title {
          margin-top: 0;
          color: #1e293b;
        }

        .empty-note {
          color: #94a3b8;
        }

        .table-scroll {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .dash-table {
          width: 100%;
          min-width: 480px;
          border-collapse: collapse;
        }

        .dash-table thead tr {
          background: #f8fafc;
        }

        .dash-table th {
          padding: 0.75rem;
          text-align: left;
          color: #64748b;
          white-space: nowrap;
        }

        .dash-table td {
          padding: 0.75rem;
          border-top: 1px solid #f1f5f9;
          white-space: nowrap;
        }

        .alert-row {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 0.75rem;
        }

        /* Tablet */
        @media (max-width: 900px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Mobile */
        @media (max-width: 640px) {
          .dash-page {
            padding: 1rem;
          }

          .dash-title {
            font-size: 1.4rem;
            margin-bottom: 1rem;
          }

          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
            margin-bottom: 1.5rem;
          }

          .summary-card {
            padding: 1rem;
            border-radius: 10px;
          }

          .summary-value {
            font-size: 1.25rem;
          }

          .card {
            padding: 1rem;
            border-radius: 10px;
            margin-bottom: 1.5rem;
          }

          .charts-grid {
            gap: 1rem;
            margin-bottom: 1.5rem;
          }
        }

        /* Very small phones */
        @media (max-width: 380px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}