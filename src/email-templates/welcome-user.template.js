import { escapeHtml, wrapEmailHtml } from './layout.js';

/**
 * Welcome user email with credentials.
 * Expected data: { name: string, email: string, password: string, loginUrl?: string }
 */
export const templateName = 'WELCOME_USER';

export const render = (data) => {
    const userName = data.name ? escapeHtml(data.name) : 'User';
    const userEmail = data.email ? escapeHtml(data.email) : '';
    const userPassword = data.password ? escapeHtml(data.password) : '';
    const loginUrl = data.loginUrl ? escapeHtml(data.loginUrl) : 'https://ops.grclass.com';

    const subject = 'Welcome to Girik Class - Your Login Credentials';

    const innerHtml = `
      <p style="margin:0 0 12px;">Hi ${userName},</p>
      <p style="margin:0 0 16px;">Welcome to <strong>Girik Class</strong>! Your account has been successfully created by the administrator. You can now log in to the portal using the credentials below.</p>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
        <p style="margin:0 0 8px;"><strong>Login Page:</strong> <a href="${loginUrl}" style="color: #14b8a6; text-decoration: none;">${loginUrl}</a></p>
        <p style="margin:0 0 8px;"><strong>Email:</strong> ${userEmail}</p>
        <p style="margin:0;"><strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 2px 4px; border-radius: 4px; color: #0f766e;">${userPassword}</code></p>
      </div>

      <p style="margin:0 0 20px;">For security reasons, we strongly recommend that you change your password immediately after your first login.</p>
      
      <p style="margin:0 0 20px;">
        <a href="${loginUrl}" style="display:inline-block;background:#14b8a6;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px;">Log in to Portal</a>
      </p>

      <p style="margin:0;color:#71717a;font-size:14px;">If you face any issues while logging in, please contact the IT support team.</p>
    `;

    return {
        subject,
        html: wrapEmailHtml({ title: subject, innerHtml }),
        type: 'system',
    };
};
