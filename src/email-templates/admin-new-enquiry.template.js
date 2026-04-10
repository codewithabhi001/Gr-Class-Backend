import { escapeHtml, wrapGrclassEmail } from './layout.js';

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
      <p style="margin:0 0 16px;">Hello Administrative Team,</p>
      
      <p style="margin:0 0 16px;">A new enquiry has been submitted through the <strong>GR Class Website</strong> contact form. Please review the details below and take appropriate action.</p>
      
      <div style="background: #ffffff; padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        <h3 style="margin: 0 0 16px; color: #1e293b; font-size: 18px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">Enquiry Details</h3>
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 120px; font-weight: 600;">Full Name:</td>
            <td style="padding: 8px 0; color: #1e293b;">${fullName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Company:</td>
            <td style="padding: 8px 0; color: #1e293b;">${company}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email:</td>
            <td style="padding: 8px 0; color: #1e293b;"><a href="mailto:${email}" style="color: #14b8a6; text-decoration: none;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Phone:</td>
            <td style="padding: 8px 0; color: #1e293b;">${phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Subject:</td>
            <td style="padding: 8px 0; color: #1e293b;">${enquirySubject}</td>
          </tr>
        </table>

        <div style="margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1;">
          <p style="margin: 0 0 8px; color: #64748b; font-weight: 600; font-size: 14px;">Message Content:</p>
          <p style="margin: 0; color: #334155; white-space: pre-wrap; line-height: 1.5;">${message}</p>
        </div>
      </div>

      <p style="margin: 0 0 24px; text-align: center;">
        <a href="https://ops.grclass.com/admin/enquiries/${enquiryId}" style="display:inline-block; background:#1e293b; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:600; font-size:15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">View in Admin Panel</a>
      </p>

      <p style="margin:0; color:#94a3b8; font-size:13px; text-align: center;">
        This notification was generated automatically by the GR Class Backend System.
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
