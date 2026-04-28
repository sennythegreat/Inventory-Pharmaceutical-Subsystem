import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/shared/Sidebar";
import Header from "../components/shared/Header";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "PharmaFlow Inventory",
  description: "Pharmaceutical Inventory Management System",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}


