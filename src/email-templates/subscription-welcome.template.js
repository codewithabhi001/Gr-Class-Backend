import { escapeHtml, wrapGrclassEmail } from './layout.js';

/**
 * Thank you for subscribing email.
 * Expected data: { email: string, unsubscribeUrl: string }
 */
export const templateName = 'SUBSCRIPTION_WELCOME';

export const render = (data) => {
    const userEmail = escapeHtml(data.email);
    const unsubscribeUrl = data.unsubscribeUrl || '';

    const subject = 'Welcome to the GR Class Newsletter!';

    const innerHtml = `
      <p style="margin:0 0 16px;">Hi there,</p>
      <p style="margin:0 0 16px;">Thank you for subscribing to the <strong>GR Class Newsletter</strong>. You've been successfully added to our mailing list (${userEmail}).</p>
      
      <p style="margin:0 0 20px;">From now on, you'll receive the latest updates on maritime classification, certification standards, and vessel inspection technologies directly in your inbox.</p>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
        <p style="margin:0; font-size: 14px; color: #4b5563;">
            We promise not to spam you. You can manage your preferences or unsubscribe at any time using the link in the footer of our emails.
        </p>
      </div>

      <p style="margin:0 0 20px;">
        <a href="https://grclass.com" style="display:inline-block;background:#14b8a6;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px;">Visit our Website</a>
      </p>

      <p style="margin:0;color:#71717a;font-size:14px;">Best regards,<br>The GR Class Team</p>
    `;

    return {
        subject,
        html: wrapGrclassEmail({ 
            title: subject, 
            innerHtml,
            unsubscribeUrl
        }),
        type: 'notification',
    };
};
