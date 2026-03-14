import { auth } from '../firebase';

export const integrationService = {
  async triggerWebhook(organizationId: string, eventType: string, payload: any) {
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const response = await fetch('/api/webhooks/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          organizationId,
          eventType,
          payload
        })
      });

      if (!response.ok) {
        console.error('Failed to trigger webhook:', await response.text());
      }
    } catch (error) {
      console.error('Error triggering webhook:', error);
    }
  },

  async sendNotificationEmail(organizationId: string, to: string, subject: string, body: string) {
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          organizationId,
          to,
          subject,
          body
        })
      });

      if (!response.ok) {
        console.error('Failed to send notification email:', await response.text());
      }
    } catch (error) {
      console.error('Error sending notification email:', error);
    }
  }
};
