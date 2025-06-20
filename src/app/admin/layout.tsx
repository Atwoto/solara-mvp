// src/app/admin/layout.tsx
import AdminLayoutComponent from '@/components/admin/AdminLayout'; 

export default function AdminSectionLayout({ children }: { children: React.ReactNode; }) {
  return (
      <AdminLayoutComponent> {/* This applies the sidebar and auth checks ONCE */}
        {children} 
      </AdminLayoutComponent>
  );
}