
async function test() {
    try {
        console.log('Dynamic importing puppeteer...');
        const puppeteerModule = await import('puppeteer');
        console.log('Keys in puppeteerModule:', Object.keys(puppeteerModule));
        
        // Try puppeteerModule.default.launch
        console.log('Trying puppeteerModule.default.launch...');
        const browser = await puppeteerModule.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        console.log('Browser launched successfully!');
        await browser.close();
    } catch (err) {
        console.error('Test failed:', err);
    }
}

test();
