"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isActive = !path.includes("admin");
  return (
    <>
      {" "}
      {isActive && <Navbar />}
      <main className={`${isActive && "pt-20"}`}>
        {/* pt-20 adds padding so content doesn't hide behind fixed navbar */}
        {children}
      </main>
      {isActive && <Footer />}
    </>
  );
}
