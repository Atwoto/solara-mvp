// src/app/admin/subscribers/SubscribersClient.tsx
'use client';

import PageHeader from '@/components/PageHeader'; // Corrected to use PageHeader
import { UsersIcon } from '@heroicons/react/24/outline';
import { Subscriber } from '@/types';

interface SubscribersClientProps {
  subscribers: Subscriber[];
}

const SubscribersClient = ({ subscribers }: SubscribersClientProps) => {
  return (
    // The main container for the admin page content
    <div className="flex-1 p-6 sm:p-8">
      {/* This section is updated to correctly use the PageHeader component.
        The icon is now displayed alongside the title for a clean layout.
      */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-solar-flare-end/10 p-3 rounded-lg">
            <UsersIcon className="h-8 w-8 text-solar-flare-end" />
          </div>
          <div>
            <PageHeader
              title="Newsletter Subscribers"
              subtitle={`A total of ${subscribers.length} people have subscribed.`}
            />
          </div>
        </div>
      </div>

      <main>
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    Email Address
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Subscription Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscribers.length > 0 ? (
                  subscribers.map((subscriber) => (
                    <tr
                      key={subscriber.id}
                      className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        {subscriber.email}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(subscriber.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="text-center py-10 px-6">
                      No subscribers found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubscribersClient;
