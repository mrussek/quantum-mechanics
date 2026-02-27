import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Schrodinger Equation Visualizer",
  description:
    "Interactive visualization of the 1D time-dependent Schrodinger equation for various quantum potentials",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
