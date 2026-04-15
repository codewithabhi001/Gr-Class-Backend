import { escapeHtml, wrapGrclassEmail } from './layout.js';
import { emailTheme as theme } from './theme.js';

/**
 * Thank you for contacting us email.
 * Expected data: { full_name: string }
 */
export const templateName = 'CONTACT_ACKNOWLEDGEMENT';

export const render = (data) => {
    const fullName = escapeHtml(data.full_name);

    const subject = 'Inquiry Received - GR Class';

    const innerHtml = `
      <p style="margin: 0; font-size: 11px; font-weight: 700; color: ${theme.colors.brand.main}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">
        Communication
      </p>
      <h1 style="margin: 0; color: ${theme.colors.text.core}; font-size: 22px; font-weight: 800; line-height: 1.2; letter-spacing: -0.02em;">
        Message Confirmed
      </h1>
      <p style="margin: 20px 0; color: ${theme.colors.text.body}; font-size: 14px; line-height: 1.6;">
        Dear ${fullName || 'Valued Partner'},<br><br>
        Thank you for reaching out to <strong>GR Class</strong>. We have successfully received your enquiry sent through our contact portal.
      </p>
      
      <div style="background-color: ${theme.colors.brand.surface}; border: 1px solid ${theme.colors.brand.faded}; border-radius: ${theme.radius.lg}; padding: 24px; margin-bottom: 30px;">
        <p style="margin: 0; font-size: 13px; color: ${theme.colors.text.body}; line-height: 1.6;">
            <strong>What to Expect</strong><br>
            Our maritime certification specialists are reviewing your message. You can expect a formal response within 24-48 business hours at this email address.
        </p>
      </div>

      <div align="center" style="margin-bottom: 30px;">
        <a href="https://grclass.com" style="background-color: ${theme.colors.brand.main}; color: ${theme.colors.text.white}; padding: 14px 28px; border-radius: ${theme.radius.md}; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
          Visit Our Portal
        </a>
      </div>

      <p style="margin: 0; font-size: 12px; color: ${theme.colors.text.muted}; line-height: 1.6; border-top: 1px solid ${theme.colors.brand.faded}; padding-top: 20px; text-align: center;">
        Thank you for choosing GR Class for your maritime classification needs.
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
