import React from 'react';
import Notifications from '../components/Notifications';


const NotificationsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">
            Manage all notifications related to found items that match your lost items
          </p>
        </div>

        {/* Notifications Component */}
        <Notifications />

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How Notifications Work
          </h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>When you post a lost item, it's added to our database.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>When someone posts a found item with a similar title, we search for matches.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>If we find a match, we create a notification and send you an email.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              <span>You can view the found item and contact the person who posted it.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
export default NotificationsPage;