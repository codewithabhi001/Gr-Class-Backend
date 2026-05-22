const formatDate = (d) => (d instanceof Date ? d.toISOString().split('T')[0] : String(d ?? ''));

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const buildFallbackCertificateHtml = ({ variables, issuingAuthority, qrDataUrl }) => {
    const vesselName = escapeHtml(variables?.vessel_name);
    const imoNumber = escapeHtml(variables?.imo_number);
    const certificateNumber = escapeHtml(variables?.certificate_number);
    const certificateType = escapeHtml(variables?.certificate_type || 'Certificate');
    const authority = escapeHtml(issuingAuthority);
    const flagState = escapeHtml(variables?.flag_state);
    const certTerm = escapeHtml(variables?.certificate_term);
    const issueDate = escapeHtml(formatDate(variables?.issue_date));
    const expiryDate = escapeHtml(formatDate(variables?.expiry_date));
    const grLogo = variables?.gr_class_logo || 'https://grclass.com/grclass-logo.webp';
    const caLogo = variables?.authority_logo;
    const mt = variables || {};

    const qrHtml = qrDataUrl
        ? `<div style="width:120px;height:120px;"><img src="${qrDataUrl}" style="width:100%;height:100%;" alt="QR"/></div>`
        : `<div style="width:120px;height:120px;border:1px dashed #ccc;">QR</div>`;

    // AFS Logic from Template
    let afsContent = '';
    if (mt.afs_option === 'not_applied') {
        afsContent = `An anti-fouling system controlled under Annex 1 has not been applied during or after construction of this ship`;
    } else if (mt.afs_option === 'applied_previously_removed') {
        afsContent = `An anti-fouling system controlled under Annex 1 has been applied on this ship previously, but has been removed by <strong>${escapeHtml(mt.facility_name)}</strong> on <strong>${escapeHtml(mt.facility_date)}</strong>`;
    } else if (mt.afs_option === 'applied_previously_covered') {
        afsContent = `An anti-fouling system controlled under Annex 1 has been applied on this ship previously, but has been covered with a sealer coat applied by <strong>${escapeHtml(mt.facility_name)}</strong> on <strong>${escapeHtml(mt.facility_date)}</strong>`;
    } else if (mt.afs_option === 'applied_prior') {
        afsContent = `An anti-fouling system controlled under Annex 1 was applied on this ship prior to <strong>${escapeHtml(mt.facility_date)}</strong> but must be removed or covered with a sealer coat prior to <strong>${escapeHtml(mt.compliance_deadline)}</strong>`;
    }

    return `
      <div style="max-width:900px;margin:16px auto;padding:40px;border:2px solid #0b5394;border-radius:4px;font-family: 'Times New Roman', Times, serif;color:#000;line-height:1.5;background:#fff;">
        
        <!-- Header with Triple Logos -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:30px;">
          <div style="width:140px;">
            <img src="${grLogo}" style="max-width:140px;height:auto;" alt="GR CLASS"/>
          </div>
          <div style="text-align:center;flex:1;padding:0 20px;">
            <div style="font-size:20px;font-weight:bold;text-transform:uppercase;color:#0b5394;line-height:1.2;">
              ${certTerm || ''} INTERNATIONAL ANTI-FOULING SYSTEM CERTIFICATE
            </div>
            <div style="margin-top:10px;">
               ${variables?.flag_logo ? `<img src="${variables.flag_logo}" style="max-height:40px;margin-bottom:5px;"/><br/>` : ''}
               <span style="font-size:13px;">Issued under the authority of the Government of</span><br/>
               <span style="font-size:17px;font-weight:bold;text-decoration:underline;">${flagState || 'THE MERCHANT MARINE'}</span>
            </div>
          </div>
          <div style="width:140px;text-align:right;">
            ${caLogo ? `<img src="${caLogo}" style="max-width:140px;max-height:80px;height:auto;" alt="Authority Logo"/>` : ''}
          </div>
        </div>

        <div style="text-align:center;margin-bottom:30px;font-weight:bold;font-size:16px;">
          By ${authority}
        </div>

        <!-- Vessel Details Table -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:30px;font-size:13px;">
          <tr>
            <th style="border:1px solid #000;padding:8px;text-align:left;width:250px;">Certificate No.</th>
            <td style="border:1px solid #000;padding:8px;font-weight:bold;">${certificateNumber}</td>
          </tr>
          <tr>
            <th style="border:1px solid #000;padding:8px;text-align:left;">Name of ship</th>
            <td style="border:1px solid #000;padding:8px;">${vesselName}</td>
          </tr>
          <tr>
            <th style="border:1px solid #000;padding:8px;text-align:left;">Distinctive number or letters</th>
            <td style="border:1px solid #000;padding:8px;">${escapeHtml(variables.call_sign || '')}</td>
          </tr>
          <tr>
            <th style="border:1px solid #000;padding:8px;text-align:left;">Port of registry</th>
            <td style="border:1px solid #000;padding:8px;">${escapeHtml(variables.port_of_registry || '')}</td>
          </tr>
          <tr>
            <th style="border:1px solid #000;padding:8px;text-align:left;">Gross tonnage</th>
            <td style="border:1px solid #000;padding:8px;">${escapeHtml(variables.gross_tonnage || '')}</td>
          </tr>
          <tr>
            <th style="border:1px solid #000;padding:8px;text-align:left;">IMO Number</th>
            <td style="border:1px solid #000;padding:8px;">${imoNumber}</td>
          </tr>
        </table>

        <!-- AFS Content Section -->
        <div style="border:1px solid #000;padding:20px;margin-bottom:30px;font-size:14px;">
          ${afsContent || '<em>Select Anti-Fouling System details in management panel</em>'}
        </div>

        <!-- Verification Section -->
        <div style="margin-bottom:30px;font-size:14px;">
          <strong>THIS IS TO CERTIFY THAT:</strong><br/>
          1. The ship has been surveyed in accordance with regulation 1 of the Annex 4 of the Convention; and<br/>
          2. The survey shows that the anti-fouling system on the ship complies with the applicable requirements of Annex 1 to the Convention.
        </div>

        <div style="display:flex;gap:40px;margin-bottom:40px;font-size:14px;">
           <div style="flex:1;">
             <p>This certificate is valid until: <strong>${expiryDate}</strong></p>
             <p>Completion date of the survey: <strong>${escapeHtml(mt.survey_completion_date || issueDate)}</strong></p>
             <p>Issued at: <strong>${escapeHtml(mt.issued_at_place || 'Mumbai, India')}</strong></p>
             <p>Date of issue: <strong>${issueDate}</strong></p>
           </div>
           <div style="text-align:center;">
             ${qrHtml}
             <div style="font-size:10px;margin-top:4px;">Scan to Verify</div>
           </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:flex-end;">
          <div style="font-size:11px;color:#666;width:250px;">
            GR CLASS – CLASSIFIED FOR STANDARD<br/>
            E-mail: info@grclass.com | Web: www.grclass.com<br/>
            Form AFS-ST | Approved by GM
          </div>
          <div style="text-align:center;">
            <div style="border-bottom:1px solid #000;width:250px;margin-bottom:8px;height:60px;"></div>
            <div style="font-weight:bold;">${authority} REPRESENTATIVE</div>
          </div>
        </div>

      </div>`;
};
