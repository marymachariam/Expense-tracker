"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { isLoggedIn, getUser, logout } from "../lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setUser(getUser());
  }, [pathname]);

  function handleLogout() {
    logout();
    router.push("/");
  }

  const links = [
    { href: "/dashboard", label: " Dashboard" },
    { href: "/transactions", label: " Transactions" },
    { href: "/categories", label: "Categories" },
    { href: "/budgets", label: " Budgets" },
  ];

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
          textDecoration: "none"
        }}>
          Marys Budget Tracker
        </Link>

        {/* Desktop Nav Links — only when logged in */}
        {loggedIn && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
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

        {/* Right Side */}
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {loggedIn ? (
            <>
              <span style={{
                color: "#94a3b8",
                fontSize: "0.9rem",
              }}>
                👤 {user?.username}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Logout
              </button>
            </>
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
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "white",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
          className="hamburger"
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
          .hamburger {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}