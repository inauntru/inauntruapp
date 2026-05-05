import AdminSidebar from "@/components/admin/AdminSidebar";
import { ReactNode } from "react";

export const metadata = {
  title: "Admin — INAUNTRU",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-container-low">
      <AdminSidebar />
      <div className="lg:ml-64 pt-14 lg:pt-0">
        {children}
      </div>
    </div>
  );
}
