import { escapeHtml, wrapGrclassEmail } from './layout.js';
import { emailTheme as theme } from './theme.js';

/**
 * Thank you for subscribing email.
 * Expected data: { email: string, unsubscribeUrl: string }
 */
export const templateName = 'SUBSCRIPTION_WELCOME';

export const render = (data) => {
    const userEmail = escapeHtml(data.email);
    const unsubscribeUrl = data.unsubscribeUrl || '';

    const subject = 'Welcome to GR Class Insights';

    const innerHtml = `
      <p style="margin: 0; font-size: 11px; font-weight: 700; color: ${theme.colors.brand.main}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">
        Subscription Confirmed
      </p>
      <h1 style="margin: 0; color: ${theme.colors.text.core}; font-size: 22px; font-weight: 800; line-height: 1.2; letter-spacing: -0.02em;">
        Welcome to GR Class
      </h1>
      <p style="margin: 20px 0; color: ${theme.colors.text.body}; font-size: 14px; line-height: 1.6;">
        Thank you for joining the <strong>GR Class Newsletter</strong>. You are now subscribed to receive the latest maritime insights, regulatory updates, and technological advancements directly at <strong>${userEmail}</strong>.
      </p>
      
      <div style="background-color: ${theme.colors.brand.surface}; border: 1px solid ${theme.colors.brand.faded}; border-radius: ${theme.radius.lg}; padding: 24px; margin-bottom: 30px;">
        <p style="margin: 0; font-size: 13px; color: ${theme.colors.text.body}; line-height: 1.6;">
            <strong>Stay Informed</strong><br>
            You will receive periodic updates regarding maritime classification, certification standards, and vessel inspection innovations to help you stay informed in an evolving industry.
        </p>
      </div>

      <div align="center" style="margin-bottom: 30px;">
        <a href="https://grclass.com" style="background-color: ${theme.colors.brand.main}; color: ${theme.colors.text.white}; padding: 14px 28px; border-radius: ${theme.radius.md}; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
          Explore Our Services
        </a>
      </div>

      <p style="margin: 0; font-size: 12px; color: ${theme.colors.text.muted}; line-height: 1.6; border-top: 1px solid ${theme.colors.brand.faded}; padding-top: 20px; text-align: center;">
        We respect your inbox. You can manage your preferences or <a href="${unsubscribeUrl}" style="color: ${theme.colors.text.muted}; text-decoration: underline;">unsubscribe</a> at any time.
      </p>
    `;

    return {
        subject,
        html: wrapGrclassEmail({ 
            title: subject, 
            innerHtml 
        }),
        type: 'notification',
    };
};
