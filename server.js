const express = require('express');
const { chromium } = require('playwright');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/colok-haptik', async (req, res) => {
    const { phoneNumber } = req.body;
    let browser = null;

    try {
        console.log(`[BOT] Memproses nomor: ${phoneNumber}`);
        // Di server cloud, wajib pakai headless: true agar berjalan di background tanpa layar monitor
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        // STEP 1: Buka target & Masukkan nomor
        await page.goto('https://business.facebook.com/business/wa_login/?logger_id=01a1737d-3496-7e2c-a56d-a997f25fd1ea&next=https%3A%2F%2Fbusiness.facebook.com%2Fv22.0%2Fdialog%2Foauth%3Fapp_id%3D1100908887049211%26cbt%3D1777861544843%26channel_url%3Dhttps%253A%252F%252Fstaticxx.facebook.com%252Fx%252Fconnect%252Fxd_arbiter%252F%253Fversion%253D46%2523cb%253Df2501cf6806ec82c0%2526domain%253Dapp.interakt.ai%2526is_canvas%253Dfalse%2526origin%253Dhttps%25253A%25252F%25252Fapp.interakt.ai%25252Ff8376385cc1d82332%2526relation%253Dopener%26client_id%3D1100908887049211%26config_id%3D1108757774047280%26display%3Dpopup%26domain%3Dapp.interakt.ai%26e2e%3D%257B%257D%26extras%3D%257B%2522sessionInfoVersion%2522%253A3%252C%2522version%2522%253A%2522v3%2522%252C%2522featureType%2522%253A%2522whatsapp_business_app_onboarding%2522%252C%2522setup%2522%253A%257B%2522business%2522%253A%257B%2522isWebsiteRequired%2522%253Atrue%257D%252C%2522phone%2522%253A%257B%257D%257D%257D%26fallback_redirect_uri%3Dhttps%253A%252F%252Fapp.interakt.ai%252Fsignup%252Fwhatsapp%26locale%3Den_US%26logger_id%3D01a1737d-3496-7e2c-a56d-a997f25fd1ea%26origin%3D1%26override_default_response_type%3Dtrue%26redirect_uri%3Dhttps%253A%252F%252Fstaticxx.facebook.com%252Fx%252Fconnect%252Fxd_arbiter%252F%253Fversion%253D46%2523cb%253Df25e2f5be853c204a%2526domain%253Dapp.interakt.ai%2526is_canvas%253Dfalse%2526origin%253Dhttps%25253A%25252F%25252Fapp.interakt.ai%25252Ff8376385cc1d82332%2526relation%253Dopener%2526frame%253Df68f88b0c660768cc%26response_type%3Dcode%26sdk%3Djoey%26version%3Dv22.0%26http_ref%3DeyJ0cyI6IjE3Nzc4NjE1NDU1MDUiLCJyIjoiaHR0cHM6XC9cL2FwcC5pbnRlcmFrdC5haVwvIn0%253D%26cah%3D2%26rwtsid%3DyrArsBZYjXdVjQd3Z%26ret%3Dlogin%26fbapp_pres%3D0%26tp%3Dunspecified%26biz_login_source%3Dbiz_unified_f3_fb_login_button%26join_id%3Db324f181-afad-4442-97c8-4025b9074017&request_id=chdcmpdefpdliekjckckgkdfhfgccpglcpbibmbp'); 
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
