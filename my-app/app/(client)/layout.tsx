"use client"
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

import { useEffect, useState } from "react";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <Provider store={store}>
      <html lang="en">
        <body>
          <div className="w-full m-auto text-[1.2rem]">
            <header className=""><Header /></header>
            <main style={{ position: 'relative', overflow: 'hidden' }}>
              {children}
             
            </main>


            <div>
              <Footer />
            </div>
          </div>
        </body>
      </html>
    </Provider>
  );
}
