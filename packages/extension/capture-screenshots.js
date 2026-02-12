const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const extensionPath = path.resolve(__dirname);
  
  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();
  
  await page.goto('https://tailwindcss.com/');
  await page.waitForTimeout(2500);

  await page.screenshot({ 
    path: path.join(__dirname, 'screenshots', 'demo-1-collapsed.png'),
    fullPage: false 
  });
  console.log('Screenshot 1: Collapsed toolbar');

  await page.click('.agentation-toolbar');
  await page.waitForTimeout(500);
  
  await page.screenshot({ 
    path: path.join(__dirname, 'screenshots', 'demo-2-expanded.png'),
    fullPage: false 
  });
  console.log('Screenshot 2: Expanded toolbar');

  await page.click('[data-action="toggle"]');
  await page.waitForTimeout(300);

  const heroSection = page.locator('h1').first();
  await heroSection.hover();
  await page.waitForTimeout(500);

  await page.screenshot({ 
    path: path.join(__dirname, 'screenshots', 'demo-3-highlight.png'),
    fullPage: false 
  });
  console.log('Screenshot 3: Element highlighted');

  await heroSection.click();
  await page.waitForTimeout(500);

  await page.screenshot({ 
    path: path.join(__dirname, 'screenshots', 'demo-4-popover.png'),
    fullPage: false 
  });
  console.log('Screenshot 4: Annotation popover');

  const textarea = page.locator('.agentation-popover textarea');
  if (await textarea.isVisible()) {
    await textarea.fill('Make this heading bigger and add more contrast');
    await page.click('.agentation-popover .agentation-btn-add');
    await page.waitForTimeout(500);
  }

  await page.screenshot({ 
    path: path.join(__dirname, 'screenshots', 'demo-5-marker.png'),
    fullPage: false 
  });
  console.log('Screenshot 5: With marker');

  await page.click('[data-action="settings"]');
  await page.waitForTimeout(500);

  await page.screenshot({ 
    path: path.join(__dirname, 'screenshots', 'demo-6-settings.png'),
    fullPage: false 
  });
  console.log('Screenshot 6: Settings panel');

  console.log('\nAll screenshots saved to screenshots/ directory');
  
  await context.close();
})();
