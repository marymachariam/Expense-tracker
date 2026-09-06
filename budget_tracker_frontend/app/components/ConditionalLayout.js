"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

const noNavbarPaths = [
  "/",
  "/login",
  "/register",
  "/verify-otp",
  "/forgot-password",
  "/reset-password",
];

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const hideNavbar = noNavbarPaths.includes(pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main style={{ flex: 1 }}>{children}</main>
      {hideNavbar && <Footer />}
    </>
  );
}