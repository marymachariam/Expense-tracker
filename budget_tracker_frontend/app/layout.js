import "./globals.css";
import ConditionalLayout from "./components/ConditionalLayout";

export const metadata = {
  title: "Budget Tracker",
  description: "Smart Budget Tracker App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#f1f5f9", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}