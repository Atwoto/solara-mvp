// /src/app/account/tabs/ProfileTab.tsx


'use client';

import { motion } from 'framer-motion';
import { User, Mail, ShieldCheck } from 'lucide-react';

const ProfileInfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | null | undefined }) => (
    <div className="flex items-start py-4">
        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-md font-semibold text-graphite">{value || 'Not provided'}</p>
        </div>
    </div>
);

export default function ProfileTab({ user }: { user: any }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold text-graphite mb-6">My Profile</h2>
            <div className="bg-white rounded-lg border divide-y">
                <ProfileInfoRow
                    icon={<User className="h-5 w-5" />}
                    label="Full Name"
                    value={user?.name}
                />
                <ProfileInfoRow
                    icon={<Mail className="h-5 w-5" />}
                    label="Email Address"
                    value={user?.email}
                />
                 <ProfileInfoRow
                    icon={<ShieldCheck className="h-5 w-5" />}
                    label="Account Status"
                    value="Verified"
                />
            </div>
             <p className="text-xs text-gray-500 mt-4">To update your details, please contact customer support.</p>
        </motion.div>
    );
}
