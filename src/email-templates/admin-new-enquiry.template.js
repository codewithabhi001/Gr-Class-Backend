import { escapeHtml, wrapGrclassEmail } from './layout.js';
import { emailTheme as theme } from './theme.js';

/**
 * Admin notification for new website enquiry.
 * Expected data: { full_name, company, corporate_email, message, phone, subject, enquiry_id }
 */
export const templateName = 'NEW_WEBSITE_ENQUIRY';

export const render = (data) => {
    const fullName = escapeHtml(data.full_name);
    const company = escapeHtml(data.company);
    const email = escapeHtml(data.corporate_email);
    const message = escapeHtml(data.message);
    const phone = escapeHtml(data.phone);
    const enquirySubject = escapeHtml(data.subject);
    const enquiryId = data.enquiry_id;

    const subject = `Action Required: New Website Enquiry - ${fullName}`;

    const innerHtml = `
      <p style="margin: 0; font-size: 11px; font-weight: 700; color: ${theme.colors.brand.main}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">
        System Alert
      </p>
      <h1 style="margin: 0; color: ${theme.colors.text.core}; font-size: 20px; font-weight: 800; line-height: 1.2; letter-spacing: -0.02em;">
        New Website Enquiry
      </h1>
      <p style="margin: 20px 0; color: ${theme.colors.text.body}; font-size: 14px; line-height: 1.6;">
        A new lead has been captured through the <strong>GR Class</strong> digital portal. Please review the following details and initiate the standard follow-up protocol.
      </p>
      
      <div style="background-color: ${theme.colors.brand.surface}; border: 1px solid ${theme.colors.brand.faded}; border-radius: ${theme.radius.lg}; padding: 24px; margin-bottom: 24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 6px 0; color: ${theme.colors.text.muted}; width: 110px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Client</td>
            <td style="padding: 6px 0; color: ${theme.colors.text.core}; font-size: 13px; font-weight: 600;">${fullName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: ${theme.colors.text.muted}; font-size: 12px; font-weight: 600; text-transform: uppercase;">Company</td>
            <td style="padding: 6px 0; color: ${theme.colors.text.core}; font-size: 13px; font-weight: 600;">${company}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: ${theme.colors.text.muted}; font-size: 12px; font-weight: 600; text-transform: uppercase;">Email</td>
            <td style="padding: 6px 0; color: ${theme.colors.text.core}; font-size: 13px; font-weight: 600;"><a href="mailto:${email}" style="color: ${theme.colors.brand.deep}; text-decoration: none;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: ${theme.colors.text.muted}; font-size: 12px; font-weight: 600; text-transform: uppercase;">Phone</td>
            <td style="padding: 6px 0; color: ${theme.colors.text.core}; font-size: 13px; font-weight: 600;">${phone}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: ${theme.colors.text.muted}; font-size: 12px; font-weight: 600; text-transform: uppercase;">Subject</td>
            <td style="padding: 6px 0; color: ${theme.colors.text.core}; font-size: 13px; font-weight: 600;">${enquirySubject}</td>
          </tr>
        </table>

        <div style="margin-top: 16px; padding: 16px; background: ${theme.colors.white}; border-radius: ${theme.radius.md}; border: 1px solid ${theme.colors.brand.faded};">
          <p style="margin: 0 0 8px; color: ${theme.colors.text.muted}; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Message Content</p>
          <p style="margin: 0; color: ${theme.colors.text.body}; font-size: 13px; line-height: 1.5;">${message}</p>
        </div>
      </div>

      <div align="center" style="margin-bottom: 24px;">
        <a href="https://ops.grclass.com/admin/enquiries/${enquiryId}" style="background-color: ${theme.colors.brand.primary}; color: ${theme.colors.text.white}; padding: 12px 24px; border-radius: ${theme.radius.md}; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
          Process in Admin Panel
        </a>
      </div>

      <p style="margin: 0; font-size: 11px; color: ${theme.colors.text.light}; text-align: center;">
        Inquiry ID: ${enquiryId} • Processed via Cloud Systems
      </p>
    `;

    return {
        subject,
        html: wrapGrclassEmail({ 
            title: 'New Website Enquiry', 
            innerHtml 
        }),
        type: 'notification',
    };
};
