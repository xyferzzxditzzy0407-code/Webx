const express = require('express');
const { chromium } = require('playwright');
const path = require('path');

const app = express();
app.use(express.json());
// Karena index.html ada di root, kita set static folder ke current directory (__dirname)
app.use(express.static(__dirname));

app.post('/api/colok-haptik', async (req, res) => {
    const { phoneNumber } = req.body;
    let browser = null;

    try {
        console.log(`[BOT] Memproses nomor: ${phoneNumber}`);
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        // STEP 1: Buka target & Masukkan nomor
        await page.goto('URL_TARGET_FACEBOOK_SINI'); // Ganti dengan URL target aslimu
        await page.fill('input[type="tel"]', phoneNumber);
        await page.click('button:has-text("Next")');

        // STEP 2: Ambil Kode OTP Real
        const codeElement = await page.waitForSelector('text=/[A-Z0-9]{6,8}/', { timeout: 30000 });
        const realOtpCode = await codeElement.innerText();

        // STEP 3: Sambutan / Continue
        const continueBtn = await page.$('button:has-text("Continue")');
        if (continueBtn) await continueBtn.click();

        // STEP 4: Review Bisnis & Isi neko.box.my.id
        await page.waitForSelector('input[name*="website"], input[placeholder*="website"]');
        await page.fill('input[name*="website"], input[placeholder*="website"]', 'https://neko.box.my.id/');
        await page.click('button:has-text("Next")');

        // STEP 5: Confirm
        const confirmBtn = await page.waitForSelector('button:has-text("Confirm")', { timeout: 15000 });
        if (confirmBtn) await confirmBtn.click();

        await browser.close();
        res.json({ status: 'success', code: realOtpCode });

    } catch (err) {
        console.error('[BOT] Error:', err.message);
        if (browser) await browser.close();
        res.status(500).json({ status: 'error', message: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server aktif di port ${PORT}`);
});
