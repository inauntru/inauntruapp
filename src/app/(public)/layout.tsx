import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackgroundMusic from "@/components/ui/BackgroundMusic";
import { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/*
        Cine navighează din tastatură (sau cu cititor de ecran) ar trebui altfel să treacă
        prin tot meniul la fiecare pagină. Linkul e invizibil până e selectat cu Tab.
      */}
      <a
        href="#continut"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-forest-green focus:px-5 focus:py-3 focus:font-body focus:text-body-sm focus:text-white focus:shadow-lg"
      >
        Sari la conținut
      </a>
      <Navbar />
      <main id="continut" className="pt-16 lg:pt-20">{children}</main>
      <Footer />
      <BackgroundMusic />
    </>
  );
}
