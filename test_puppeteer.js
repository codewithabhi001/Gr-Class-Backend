import puppeteer from 'puppeteer';

async function test() {
    try {
        console.log('Launching browser...');
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        console.log('Browser launched successfully!');
        const page = await browser.newPage();
        await page.setContent('<h1>Hello World</h1>');
        const pdf = await page.pdf({ format: 'A4' });
        console.log('PDF generated, size:', pdf.length);
        await browser.close();
    } catch (err) {
        console.error('Test failed:', err);
    }
}

test();
