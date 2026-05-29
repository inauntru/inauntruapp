import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackgroundMusic from "@/components/ui/BackgroundMusic";
import MobileStickyBar from "@/components/ui/MobileStickyBar";
import { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-16 lg:pt-20">{children}</main>
      <Footer />
      <BackgroundMusic />
      <MobileStickyBar />
    </>
  );
}
