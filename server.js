const express = require('express');
const puppeteer = require('puppeteer-core');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/run-script', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser', // Railway & Render içindir
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto('https://fityasa.net/giris-yap.php', { waitUntil: 'networkidle2' });

    await page.type('input[name="telefon"]', '05352879731', { delay: 100 });
    await page.type('input[name="password"]', '0000', { delay: 100 });

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    const turnikePage = await browser.newPage();
    await turnikePage.goto('https://fityasa.net/turnike.php', { waitUntil: 'networkidle2' });

    const fileInputSelector = '#html5-qrcode-private-filescan-input';
    const filePath = path.resolve(__dirname, 'qr.png');

    await turnikePage.waitForSelector(fileInputSelector, { timeout: 5000 });
    const inputHandle = await turnikePage.$(fileInputSelector);
    await inputHandle.uploadFile(filePath);

    console.log('📷 QR kod başarıyla yüklendi.');
    res.send('✅ QR kod yüklendi!');
  } catch (err) {
    console.error('❌ Hata:', err.message);
    res.status(500).send('Hata: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Sunucu ${PORT} portunda çalışıyor`);
});