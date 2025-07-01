// /src/app/account/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AccountClientPage from './AccountClientPage';
import PageHeader from "@/components/PageHeader";

export default async function AccountPage() {
    const session = await getServerSession(authOptions);

    // This is a server-side check. If the user is not logged in,
    // they will be redirected to the login page before this page ever renders.
    if (!session) {
        redirect('/login?callbackUrl=/account');
    }

    return (
        <>
            <PageHeader
                title="My Account"
                subtitle={`Welcome back, ${session.user?.name || 'Valued Customer'}!`}
                breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Account', href: '/account' }]}
            />
            <main className="bg-gray-50 py-12 sm:py-16">
                <div className="container mx-auto px-4">
                    {/* We pass the user session data to the client component */}
                    <AccountClientPage user={session.user} />
                </div>
            </main>
        </>
    );
}
