"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function LayoutWithNavbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbar = pathname === "/sign-in" || pathname === "/sign-up";
  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
} 