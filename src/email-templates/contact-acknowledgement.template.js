import { escapeHtml, wrapGrclassEmail } from './layout.js';

/**
 * Thank you for contacting us email.
 * Expected data: { full_name: string }
 */
export const templateName = 'CONTACT_ACKNOWLEDGEMENT';

export const render = (data) => {
    const fullName = escapeHtml(data.full_name);

    const subject = 'Thank you for contacting GR Class';

    const innerHtml = `
      <p style="margin:0 0 16px;">Dear ${fullName || 'Valued Customer'},</p>
      
      <p style="margin:0 0 16px;">Thank you for reaching out to <strong>GR Class</strong>. We have successfully received your enquiry sent through our contact form.</p>
      
      <p style="margin:0 0 16px;">Our team is currently reviewing your message and we will get back to you with a formal response as soon as possible. We pride ourselves on timely communication and aim to address all queries within 24-48 business hours.</p>

      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
        <p style="margin:0; font-size: 14px; color: #4b5563;">
            <strong>What's Next?</strong><br>
            A member of our maritime certification team will contact you directly at this email address if further information is required or to provide the assistance you requested.
        </p>
      </div>

      <p style="margin:0 0 20px;">
        In the meantime, feel free to explore our website to learn more about our maritime services and classification standards.
      </p>

      <p style="margin:0 0 20px;">
        <a href="https://grclass.com" style="display:inline-block;background:#14b8a6;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px;">Visit GR Class</a>
      </p>

      <p style="margin:0;color:#71717a;font-size:14px;">Best regards,<br>The GR Class Team</p>
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
