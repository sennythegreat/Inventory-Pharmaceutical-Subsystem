import { Inter } from "next/font/google";
import "./globals.css";

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
      <body className="min-h-full bg-gray-50">
        {children}
      </body>
    </html>
  );
}


