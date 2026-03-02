const puppeteer = require('puppeteer');
const path = require('path');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function exportBanners() {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

    const banners = [
        { file: '3k-seguidores.html', output: '3k-seguidores.png' },
        { file: 'cupom-10-desconto.html', output: 'cupom-10-desconto.png' },
    ];

    for (const banner of banners) {
        const page = await browser.newPage();
        await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 2 });

        const filePath = path.resolve(__dirname, '..', 'public', 'banners', banner.file);
        await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });

        // Wait for fonts to load
        await sleep(3000);

        const outputPath = path.resolve(__dirname, '..', 'public', 'banners', banner.output);
        await page.screenshot({
            path: outputPath,
            clip: { x: 0, y: 0, width: 1080, height: 1920 },
        });

        console.log(`✅ Exportado: ${outputPath}`);
        await page.close();
    }

    await browser.close();
    console.log('\n🎉 Todos os banners foram exportados com sucesso!');
}

exportBanners().catch(console.error);
