import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import HomePage from "./(public)/page";

export default function RootPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 lg:pt-20">
        <HomePage />
      </main>
      <Footer />
      <div className="md:hidden mobile-sticky-bar">
        <Link
          href="/register"
          className="btn btn-primary w-full text-center flex items-center justify-center"
        >
          Începe gratuit
        </Link>
      </div>
    </>
  );
}
