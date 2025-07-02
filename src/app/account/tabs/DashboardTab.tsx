// /src/app/account/tabs/DashboardTab.tsx

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function DashboardTab({ user }: { user: any }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-2xl font-bold text-graphite mb-2">Welcome to your Dashboard</h2>
            <p className="text-gray-600 mb-8">
                From here you can view your recent orders, manage your shipping and billing addresses, and edit your password and account details.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/products" className="group block p-6 bg-gray-50 hover:bg-white rounded-xl border border-gray-200 hover:border-solar-flare-start transition-all duration-300 shadow-sm hover:shadow-lg">
                    <h3 className="font-semibold text-lg text-graphite group-hover:text-solar-flare-end">Browse Products</h3>
                    <p className="text-sm text-gray-500 mt-1">Find the perfect solar solution for your needs.</p>
                    <p className="font-semibold text-sm text-solar-flare-start flex items-center mt-4">
                        Start Shopping <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </p>
                </Link>
                <Link href="/#contact-us" className="group block p-6 bg-gray-50 hover:bg-white rounded-xl border border-gray-200 hover:border-solar-flare-start transition-all duration-300 shadow-sm hover:shadow-lg">
                    <h3 className="font-semibold text-lg text-graphite group-hover:text-solar-flare-end">Get Support</h3>
                    <p className="text-sm text-gray-500 mt-1">Have a question? Our team is here to help.</p>
                     <p className="font-semibold text-sm text-solar-flare-start flex items-center mt-4">
                        Contact Us <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </p>
                </Link>
            </div>
        </motion.div>
    );
}
