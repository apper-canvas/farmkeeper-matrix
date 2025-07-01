import { format } from 'date-fns';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const notificationService = {
  async requestPermission() {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  },

  async sendTaskReminder(task) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const dueDate = new Date(task.dueDate);
      const formattedDate = format(dueDate, 'MMM d, yyyy');
      
      const notification = new Notification('Task Reminder - FarmKeeper', {
        body: `"${task.title}" is due on ${formattedDate}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `task-${task.Id}`,
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'View Task'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      });

      notification.onclick = () => {
        window.focus();
        // Navigate to tasks page - could be enhanced with specific task focus
        if (window.location.pathname !== '/tasks') {
          window.location.href = '/tasks';
        }
        notification.close();
      };

      // Auto-close notification after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  },

  async sendBulkTaskReminders(tasks) {
    if (!tasks || tasks.length === 0) return;

    // Limit to prevent spam
    const tasksToNotify = tasks.slice(0, 5);
    
    for (const task of tasksToNotify) {
      await this.sendTaskReminder(task);
      await delay(1000); // Stagger notifications by 1 second
    }
  },

  isSupported() {
    return 'Notification' in window;
  },

  getPermissionStatus() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }
};