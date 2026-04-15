import { escapeHtml, wrapEmailHtml } from './layout.js';
import { emailTheme as theme } from './theme.js';

/**
 * Subscription welcome email.
 * Expected data: { email: string }
 */
export const templateName = 'SUBSCRIPTION_WELCOME';

export const render = (data) => {
    const userEmail = escapeHtml(data.email);
    const subject = 'Welcome to GR Class Network';

    const innerHtml = `
      <p style="margin: 0; font-size: 11px; font-weight: 700; color: ${theme.colors.brand.main}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">
        Communication
      </p>
      <h1 style="margin: 0; color: ${theme.colors.text.core}; font-size: 22px; font-weight: 800; line-height: 1.2; letter-spacing: -0.02em;">
        Network Joined
      </h1>
      <p style="margin: 20px 0; color: ${theme.colors.text.body}; font-size: 14px; line-height: 1.6;">
        Welcome to the <strong>GR Class</strong> professional network. Your subscription to our maritime insights and technical bulletins at <strong>${userEmail}</strong> has been successfully registered.
      </p>
      
      <div style="background-color: ${theme.colors.brand.surface}; border: 1px solid ${theme.colors.brand.faded}; border-radius: 0; padding: 24px; margin-bottom: 30px;">
        <p style="margin: 0; font-size: 13px; color: ${theme.colors.text.body}; line-height: 1.6;">
            <strong>Information Stream</strong><br>
            You will now receive periodic technical updates regarding maritime classification, statutory regulations, and vessel inspection standards handled by our global division.
        </p>
      </div>

      <div align="center" style="margin-bottom: 30px;">
        <a href="https://grclass.com" style="background-color: ${theme.colors.brand.main}; color: ${theme.colors.text.white}; padding: 15px 35px; border-radius: 0; text-decoration: none; font-size: 13px; font-weight: 700; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em;">
          Access Resources
        </a>
      </div>
    `;

    return {
        subject,
        html: wrapEmailHtml({ title: subject, innerHtml }),
        type: 'communication',
    };
};
