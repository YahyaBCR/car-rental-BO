/**
 * Notifications Page
 */

import React from 'react';
import { FaBell, FaCircleCheck, FaCircleExclamation, FaCircleInfo } from 'react-icons/fa6';
import { FlitCarColors } from '../../constants/colors';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const NotificationsPage: React.FC = () => {
  // Mock notifications - will be replaced with real data from backend
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'success',
      title: 'Réservation confirmée',
      message: 'Votre réservation pour la BMW Série 3 a été confirmée avec succès.',
      timestamp: '2024-01-15T10:30:00',
      read: false,
    },
    {
      id: '2',
      type: 'info',
      title: 'Nouveau message',
      message: 'Le propriétaire a répondu à votre question.',
      timestamp: '2024-01-14T15:45:00',
      read: false,
    },
    {
      id: '3',
      type: 'warning',
      title: 'Paiement en attente',
      message: 'Votre paiement pour la réservation #1234 est en attente.',
      timestamp: '2024-01-13T09:20:00',
      read: true,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FaCircleCheck className="text-green-500 text-xl" />;
      case 'warning':
        return <FaCircleExclamation className="text-yellow-500 text-xl" />;
      default:
        return <FaCircleInfo className="text-blue-500 text-xl" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: `${FlitCarColors.primary}15` }}
              >
                <FaBell className="text-2xl" style={{ color: FlitCarColors.primary }} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-600">
                    Vous avez {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            {notifications.length > 0 && (
              <button
                className="text-sm font-medium hover:underline"
                style={{ color: FlitCarColors.primary }}
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: `${FlitCarColors.primary}10` }}
              >
                <FaBell className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Aucune notification
              </h3>
              <p className="text-gray-600">
                Vous n'avez pas encore de notifications. Revenez plus tard !
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md cursor-pointer ${
                  notification.read
                    ? 'border-gray-200'
                    : 'border-primary/30 bg-primary/5'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3
                            className={`text-base font-semibold ${
                              notification.read ? 'text-gray-700' : 'text-gray-900'
                            }`}
                          >
                            {notification.title}
                          </h3>
                          <p
                            className={`mt-1 text-sm ${
                              notification.read ? 'text-gray-500' : 'text-gray-600'
                            }`}
                          >
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0 ml-2"
                            style={{ backgroundColor: FlitCarColors.primary }}
                          />
                        )}
                      </div>
                      <p className="mt-2 text-xs text-gray-400">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
