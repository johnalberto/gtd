import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TaskProvider } from "@/contexts/TaskContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FocusPro - GTD Task Manager",
  description: "Gestiona tus tareas con el método Getting Things Done",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} antialiased`}>
        <TaskProvider>
          {children}
        </TaskProvider>
      </body>
    </html>
  );
}
