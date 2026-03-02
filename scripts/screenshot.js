const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Wait a moment for animations
    await page.waitForTimeout(2000);

    await page.screenshot({ path: '/home/leonardo/Área de trabalho/ws/gio-handmade/hero_chrome_check.png' });

    await browser.close();
    console.log('Screenshot saved to hero_chrome_check.png');
})();
