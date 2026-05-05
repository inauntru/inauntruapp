import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-16 lg:pt-20">{children}</main>
      <Footer />
      {/* Mobile sticky bottom bar */}
      <div className="md:hidden mobile-sticky-bar">
        <a
          href="/register"
          className="btn btn-primary w-full text-center flex items-center justify-center"
        >
          Începe gratuit
        </a>
      </div>
    </>
  );
}
