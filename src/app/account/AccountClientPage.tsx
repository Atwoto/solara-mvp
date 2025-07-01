// /src/app/account/AccountClientPage.tsx

'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, User, LogOut } from 'lucide-react';

// Import the tab components we will create next
import DashboardTab from './tabs/DashboardTab';
import OrdersTab from './tabs/OrdersTab';
import ProfileTab from './tabs/ProfileTab';

const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', name: 'My Orders', icon: Package },
    { id: 'profile', name: 'My Profile', icon: User },
];

export default function AccountClientPage({ user }: { user: any }) {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-1">
                <div className="bg-white p-4 rounded-2xl shadow-lg sticky top-28">
                    <nav className="space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                                    activeTab === tab.id ? 'text-deep-night' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="active-account-tab"
                                        className="absolute inset-0 bg-solar-flare-start/10 rounded-lg"
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    />
                                )}
                                <tab.icon className="h-5 w-5 relative z-10" />
                                <span className="relative z-10">{tab.name}</span>
                            </button>
                        ))}
                        <hr className="my-2" />
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Log Out</span>
                        </button>
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="lg:col-span-3">
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg min-h-[400px]">
                    {activeTab === 'dashboard' && <DashboardTab user={user} />}
                    {activeTab === 'orders' && <OrdersTab />}
                    {activeTab === 'profile' && <ProfileTab user={user} />}
                </div>
            </main>
        </div>
    );
}
