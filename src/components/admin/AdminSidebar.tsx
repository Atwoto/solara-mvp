// src/components/admin/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { 
    ChartBarIcon, ShoppingBagIcon, CubeIcon, NewspaperIcon,
    WrenchScrewdriverIcon, ChatBubbleBottomCenterTextIcon, 
    PhotoIcon, UsersIcon // <-- NEW ICON for Subscribers
} from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBagIcon },
  { name: 'Products', href: '/admin/products', icon: CubeIcon }, 
  { name: 'Services', href: '/admin/services', icon: WrenchScrewdriverIcon },
  { name: 'Projects', href: '/admin/projects', icon: PhotoIcon },
  { name: 'Articles', href: '/admin/blog', icon: NewspaperIcon },
  { name: 'Testimonials', href: '/admin/testimonials', icon: ChatBubbleBottomCenterTextIcon },
  { name: 'Subscribers', href: '/admin/subscribers', icon: UsersIcon }, // <-- ADDED THIS LINE
];

const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-deep-night text-white">
      <div className="flex h-full flex-col">
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          <Link href="/admin" className="text-2xl font-bold hover:text-solar-flare-start transition-colors">
            Admin Panel
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                  ? 'bg-solar-flare-end text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;
