// src/app/admin/service-categories/page.tsx
import { createServerComponentClient } from &#39;@supabase/auth-helpers-nextjs&#39;;
import { cookies } from &#39;next/headers&#39;;
import { ServiceCategory } from &#39;@/types&#39;;
import PageHeader from &#39;@/components/admin/PageHeader&#39;;
import ServiceCategoryClientPage from &#39;./ServiceCategoryClientPage&#39;;
import { redirect } from &#39;next/navigation&#39;;
import { Session, getServerSession } from &quot;next-auth&quot;;
import { authOptions } from &#39;@/lib/auth&#39;;

export const dynamic = 'force-dynamic';

const ADMIN\_EMAIL = 'kenbillsonsolararea@gmail.com'; // Hardcoded for reliability

export default async function AdminServiceCategoriesPage() {
const supabase = createServerComponentClient({ cookies });
const session = await getServerSession(authOptions) as Session | null;

// Security Check: Redirect if not the admin
if (\!session || session.user?.email \!== ADMIN\_EMAIL) {
redirect('/'); // Or to a dedicated 'unauthorized' page
}

const { data, error } = await supabase
.from('service\_categories')
.select('\*')
.order('display\_order', { ascending: true })
.order('name', { ascending: true });

if (error) {
console.error("Error fetching service categories:", error);
return &lt;div className=&quot;p-8 text-red-500&quot;&gt;Error loading categories. Please ensure you have run the database migration for 'service\_categories' and have set the correct RLS policies.&lt;/div&gt;;
}

const categories: ServiceCategory[] = data || [];

return (
&lt;div className=&quot;p-6 sm:p-8&quot;&gt;
&lt;PageHeader
title=&quot;Manage Service Categories&quot;
description=&quot;Add, edit, and organize the service categories for the main navigation menu.&quot;
/&gt;
&lt;ServiceCategoryClientPage initialCategories={categories} /&gt;
&lt;/div&gt;
);
}