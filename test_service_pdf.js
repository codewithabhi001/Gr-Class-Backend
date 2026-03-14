import * as certificatePdfService from './src/services/certificate-pdf.service.js';
import fs from 'fs';

async function testLocalPdf() {
    console.log('--- Testing PDF Generation ---');
    const html = '<h1>Test Certificate</h1><p>This is a test PDF.</p>';
    const wrappedHtml = certificatePdfService.wrapHtmlForPdf(html);
    
    try {
        console.log('Generating PDF buffer...');
        const buffer = await certificatePdfService.htmlToPdfBuffer(wrappedHtml);
        console.log('PDF generated successfully! Size:', buffer.length);
        fs.writeFileSync('test_output.pdf', buffer);
        console.log('Saved to test_output.pdf');
    } catch (err) {
        console.error('PDF Generation Failed:');
        console.error(err);
    }
}

testLocalPdf();
