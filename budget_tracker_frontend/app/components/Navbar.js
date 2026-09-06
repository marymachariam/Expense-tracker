"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { isLoggedIn, getUser, logout } from "../lib/auth";
import { getProfile, updatePreferences, changePassword } from "../lib/api";

const CURRENCIES = ["KES", "USD", "EUR", "GBP", "UGX", "TZS"];

function PreferencesForm({
  currency,
  setCurrency,
  defaultMonth,
  setDefaultMonth,
  prefsSaving,
  prefsMsg,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit}>
      <p style={{ margin: "0 0 0.5rem", fontWeight: "bold", fontSize: "0.85rem", color: "#1e293b" }}>
        Preferences
      </p>
      <label style={{ fontSize: "0.75rem", color: "#64748b" }}>Currency</label>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}
      >
        {CURRENCIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <label style={{ fontSize: "0.75rem", color: "#64748b" }}>Default budget month</label>
      <select
        value={defaultMonth}
        onChange={(e) => setDefaultMonth(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}
      >
        <option value="">None</option>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <button
        type="submit"
        disabled={prefsSaving}
        style={{
          width: "100%",
          background: "#6366f1",
          color: "white",
          border: "none",
          padding: "0.5rem",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "0.85rem",
        }}
      >
        {prefsSaving ? "Saving..." : "Save preferences"}
      </button>
      {prefsMsg && (
        <p style={{ fontSize: "0.75rem", marginTop: "0.4rem", color: prefsMsg.includes("saved") ? "#10b981" : "#ef4444" }}>
          {prefsMsg}
        </p>
      )}
    </form>
  );
}

function ChangePasswordForm({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  pwSaving,
  pwMsg,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit}>
      <p style={{ margin: "0 0 0.5rem", fontWeight: "bold", fontSize: "0.85rem", color: "#1e293b" }}>
        Change password
      </p>
      <input
        type="password"
        placeholder="Current password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.4rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}
      />
      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.4rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}
      />
      <input
        type="password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}
      />
      <button
        type="submit"
        disabled={pwSaving}
        style={{
          width: "100%",
          background: "#1e293b",
          color: "white",
          border: "none",
          padding: "0.5rem",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "0.85rem",
        }}
      >
        {pwSaving ? "Saving..." : "Change password"}
      </button>
      {pwMsg && (
        <p style={{ fontSize: "0.75rem", marginTop: "0.4rem", color: pwMsg.includes("success") ? "#10b981" : "#ef4444" }}>
          {pwMsg}
        </p>
      )}
    </form>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [currency, setCurrency] = useState("KES");
  const [defaultMonth, setDefaultMonth] = useState("");
  const [prefsMsg, setPrefsMsg] = useState("");
  const [prefsSaving, setPrefsSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setUser(getUser());
    setMenuOpen(false);
    setProfileOpen(false);
    setMobileProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadProfileIfNeeded() {
    if (!profile) {
      const data = await getProfile();
      if (!data.error) {
        setProfile(data);
        setCurrency(data.currency || "KES");
        setDefaultMonth(data.default_budget_month ? String(data.default_budget_month) : "");
      }
    }
  }

  async function openProfile() {
    const next = !profileOpen;
    setProfileOpen(next);
    setPrefsMsg("");
    setPwMsg("");
    if (next) await loadProfileIfNeeded();
  }

  async function toggleMobileProfile() {
    const next = !mobileProfileOpen;
    setMobileProfileOpen(next);
    setPrefsMsg("");
    setPwMsg("");
    if (next) await loadProfileIfNeeded();
  }

  async function handleSavePreferences(e) {
    e.preventDefault();
    setPrefsSaving(true);
    setPrefsMsg("");

    const result = await updatePreferences({
      currency,
      default_budget_month: defaultMonth ? Number(defaultMonth) : null,
    });

    setPrefsSaving(false);
    if (result.error) {
      setPrefsMsg(result.error);
    } else {
      setProfile(result);
      setPrefsMsg("Preferences saved.");
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwMsg("");

    if (newPassword !== confirmPassword) {
      setPwMsg("New passwords don't match.");
      return;
    }

    setPwSaving(true);
    const result = await changePassword({
      current_password: currentPassword,
      new_password: newPassword,
    });
    setPwSaving(false);

    if (result.error) {
      setPwMsg(result.error);
    } else {
      setPwMsg("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  function handleLogout() {
    logout();
    setMenuOpen(false);
    setProfileOpen(false);
    setMobileProfileOpen(false);
    router.push("/");
  }

  const links = [
    { href: "/dashboard", label: " Dashboard" },
    { href: "/transactions", label: " Transactions" },
    { href: "/categories", label: "Categories" },
    { href: "/budgets", label: " Budgets" },
  ];

  const preferencesProps = {
    currency,
    setCurrency,
    defaultMonth,
    setDefaultMonth,
    prefsSaving,
    prefsMsg,
    onSubmit: handleSavePreferences,
  };

  const passwordProps = {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    pwSaving,
    pwMsg,
    onSubmit: handleChangePassword,
  };

  return (
    <>
      <nav style={{
        background: "#1e293b",
        padding: "0 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>

        {/* Logo */}
        <Link href="/" style={{
          color: "white",
          fontWeight: "bold",
          fontSize: "1.2rem",
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}>
          Marys Budget Tracker
        </Link>

        {/* Desktop Nav Links — only when logged in */}
        {loggedIn && (
          <div className="desktop-links" style={{ display: "flex", gap: "0.5rem" }}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: pathname === link.href ? "white" : "#94a3b8",
                  background: pathname === link.href ? "#6366f1" : "transparent",
                  fontWeight: pathname === link.href ? "bold" : "normal",
                  fontSize: "0.9rem",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right Side — desktop only */}
        <div className="desktop-right" style={{ display: "flex", gap: "1rem", alignItems: "center", position: "relative" }}>
          {loggedIn ? (
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <button
                onClick={openProfile}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "8px",
                }}
              >
                👤 {user?.username} ▾
              </button>

              {profileOpen && (
                <div style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 0.5rem)",
                  background: "white",
                  borderRadius: "12px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  width: "300px",
                  padding: "1.25rem",
                  zIndex: 200,
                }}>
                  {!profile ? (
                    <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>Loading...</p>
                  ) : (
                    <>
                      <div style={{ marginBottom: "1rem" }}>
                        <p style={{ margin: 0, fontWeight: "bold", color: "#1e293b" }}>{profile.username}</p>
                        <p style={{ margin: "0.15rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>{profile.email}</p>
                        <p style={{ margin: "0.35rem 0 0", color: "#94a3b8", fontSize: "0.75rem" }}>
                          Member since {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "0.75rem 0" }} />
                      <PreferencesForm {...preferencesProps} />
                      <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "0.75rem 0" }} />
                      <ChangePasswordForm {...passwordProps} />
                    </>
                  )}

                  <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "0.75rem 0" }} />

                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      padding: "0.5rem",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" style={{
                color: "#94a3b8",
                textDecoration: "none",
                fontSize: "0.9rem",
              }}>
                Login
              </Link>
              <Link href="/register" style={{
                background: "#6366f1",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "0.9rem",
              }}>
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="hamburger"
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "white",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: "fixed",
          top: "64px",
          left: 0,
          right: 0,
          background: "#1e293b",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          zIndex: 99,
          maxHeight: "calc(100vh - 64px)",
          overflowY: "auto",
        }}>
          {loggedIn && links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                textDecoration: "none",
                color: pathname === link.href ? "white" : "#94a3b8",
                background: pathname === link.href ? "#6366f1" : "transparent",
              }}
            >
              {link.label}
            </Link>
          ))}

          {loggedIn && (
            <>
              <button
                onClick={toggleMobileProfile}
                style={{
                  background: "none",
                  border: "none",
                  borderTop: "1px solid #334155",
                  marginTop: "0.5rem",
                  color: "#94a3b8",
                  fontSize: "0.9rem",
                  textAlign: "left",
                  padding: "0.75rem 1rem",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>👤 {user?.username}</span>
                <span>{mobileProfileOpen ? "▲" : "▼"}</span>
              </button>

              {mobileProfileOpen && (
                <div style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "1.1rem",
                  margin: "0 0.25rem",
                }}>
                  {!profile ? (
                    <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>Loading...</p>
                  ) : (
                    <>
                      <div style={{ marginBottom: "1rem" }}>
                        <p style={{ margin: 0, fontWeight: "bold", color: "#1e293b" }}>{profile.username}</p>
                        <p style={{ margin: "0.15rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>{profile.email}</p>
                        <p style={{ margin: "0.35rem 0 0", color: "#94a3b8", fontSize: "0.75rem" }}>
                          Member since {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "0.75rem 0" }} />
                      <PreferencesForm {...preferencesProps} />
                      <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "0.75rem 0" }} />
                      <ChangePasswordForm {...passwordProps} />
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {loggedIn ? (
            <button
              onClick={handleLogout}
              style={{
                background: "#ef4444",
                color: "white",
                border: "none",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "0.9rem",
                marginTop: "0.25rem",
              }}
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{
                color: "#94a3b8",
                textDecoration: "none",
                padding: "0.75rem 1rem",
              }}>
                Login
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} style={{
                background: "#6366f1",
                color: "white",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                textDecoration: "none",
                textAlign: "center",
              }}>
                Register
              </Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-links {
            display: none !important;
          }
          .desktop-right {
            display: none !important;
          }
          .hamburger {
            display: block !important;
          }
        }
        @media (max-width: 480px) {
          nav {
            padding: 0 1rem !important;
          }
        }
      `}</style>
    </>
  );
}