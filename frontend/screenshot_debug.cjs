#!/usr/bin/env node
/**
 * screenshot_debug.js - Advanced screenshot and debugging tool
 * Captures screenshots and detailed logs from the TradingPool frontend
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://tradingpool-frontend.onrender.com';
const SCREENSHOTS_DIR = path.join(__dirname, 'debug_screenshots');
const LOGS_DIR = path.join(__dirname, 'debug_logs');

// Couleurs pour les logs console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + colors.bright + colors.blue + '='.repeat(60) + colors.reset);
  console.log(colors.bright + colors.blue + `  ${title}` + colors.reset);
  console.log(colors.bright + colors.blue + '='.repeat(60) + colors.reset + '\n');
}

// Créer les dossiers de sortie
function createOutputDirs() {
  [SCREENSHOTS_DIR, LOGS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`✅ Created directory: ${dir}`, 'green');
    }
  });
}

/**
 * Capture une page avec tous les logs et états
 */
async function capturePageWithLogs(page, pageName, url) {
  logSection(`📸 Capturing: ${pageName}`);
  log(`URL: ${url}`, 'cyan');

  const timestamp = Date.now();
  const consoleLogs = [];
  const jsErrors = [];
  const networkErrors = [];
  const requests = [];

  // Écouter les logs console
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    consoleLogs.push({
      type,
      text,
      timestamp: new Date().toISOString()
    });
    
    const colorMap = {
      error: 'red',
      warning: 'yellow',
      info: 'blue',
      log: 'gray'
    };
    
    log(`  [${type.toUpperCase()}] ${text}`, colorMap[type] || 'gray');
  });

  // Écouter les erreurs JavaScript
  page.on('pageerror', error => {
    jsErrors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    log(`  [JS ERROR] ${error.message}`, 'red');
  });

  // Écouter les requêtes réseau échouées
  page.on('requestfailed', request => {
    networkErrors.push({
      url: request.url(),
      failure: request.failure(),
      timestamp: new Date().toISOString()
    });
    log(`  [NETWORK FAIL] ${request.url()}`, 'red');
  });

  // Écouter toutes les requêtes
  page.on('request', request => {
    requests.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType(),
      timestamp: new Date().toISOString()
    });
  });

  try {
    // Naviguer vers la page
    log('  🌐 Navigating to page...', 'cyan');
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Attendre que React charge
    log('  ⏳ Waiting for React to load...', 'cyan');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Vérifier si React est chargé
    const reactStatus = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        hasReact: typeof window.React !== 'undefined' || (root && root.innerHTML.length > 100),
        rootContent: root ? root.innerHTML.substring(0, 200) : 'No root element',
        bodyLength: document.body.innerHTML.length,
        title: document.title,
        hasErrors: !!(window.errors && window.errors.length)
      };
    });

    log(`  React loaded: ${reactStatus.hasReact ? '✅' : '❌'}`, 
        reactStatus.hasReact ? 'green' : 'red');
    log(`  Page title: ${reactStatus.title}`, 'cyan');
    log(`  Body length: ${reactStatus.bodyLength} chars`, 'cyan');

    // Capturer le contenu du DOM
    const domContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        rootHtml: root ? root.innerHTML : 'Empty',
        bodyText: document.body.innerText.substring(0, 500),
        scripts: Array.from(document.scripts).map(s => ({
          src: s.src,
          type: s.type
        })),
        styles: Array.from(document.styleSheets).map(s => ({
          href: s.href,
          rules: s.cssRules ? s.cssRules.length : 'blocked'
        })),
        links: Array.from(document.links).map(l => ({
          href: l.href,
          text: l.textContent
        })).slice(0, 20)
      };
    });

    // Capturer les métriques de performance
    const metrics = await page.evaluate(() => {
      const perf = window.performance;
      const timing = perf.timing;
      
      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: perf.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: perf.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime || 0
      };
    });

    log(`  Performance metrics:`, 'cyan');
    log(`    - Load time: ${metrics.loadTime}ms`, 'gray');
    log(`    - DOM content loaded: ${metrics.domContentLoaded}ms`, 'gray');
    log(`    - First paint: ${metrics.firstPaint}ms`, 'gray');
    log(`    - FCP: ${metrics.firstContentfulPaint}ms`, 'gray');

    // Screenshot full page
    const screenshotPath = path.join(SCREENSHOTS_DIR, `${pageName}_${timestamp}.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    log(`  ✅ Screenshot saved: ${screenshotPath}`, 'green');

    // Screenshot viewport only
    const viewportScreenshotPath = path.join(SCREENSHOTS_DIR, `${pageName}_viewport_${timestamp}.png`);
    await page.screenshot({
      path: viewportScreenshotPath,
      fullPage: false
    });
    log(`  ✅ Viewport screenshot saved: ${viewportScreenshotPath}`, 'green');

    // Sauvegarder tous les logs
    const logsData = {
      page: pageName,
      url,
      timestamp: new Date().toISOString(),
      reactStatus,
      metrics,
      consoleLogs,
      jsErrors,
      networkErrors,
      requests: requests.slice(0, 50), // Limiter à 50 requêtes
      domContent: {
        ...domContent,
        rootHtml: domContent.rootHtml.substring(0, 5000) // Limiter la taille
      }
    };

    const logPath = path.join(LOGS_DIR, `${pageName}_${timestamp}.json`);
    fs.writeFileSync(logPath, JSON.stringify(logsData, null, 2));
    log(`  ✅ Logs saved: ${logPath}`, 'green');

    // Résumé
    log('\n  📊 Summary:', 'bright');
    log(`    - Console logs: ${consoleLogs.length}`, 'gray');
    log(`    - JS errors: ${jsErrors.length}`, jsErrors.length > 0 ? 'red' : 'gray');
    log(`    - Network errors: ${networkErrors.length}`, networkErrors.length > 0 ? 'red' : 'gray');
    log(`    - HTTP requests: ${requests.length}`, 'gray');

    return {
      success: true,
      reactLoaded: reactStatus.hasReact,
      errors: jsErrors.length + networkErrors.length
    };

  } catch (error) {
    log(`  ❌ Error: ${error.message}`, 'red');
    
    // Sauvegarder l'erreur
    const errorLogPath = path.join(LOGS_DIR, `${pageName}_error_${timestamp}.json`);
    fs.writeFileSync(errorLogPath, JSON.stringify({
      error: error.message,
      stack: error.stack,
      consoleLogs,
      jsErrors,
      networkErrors
    }, null, 2));
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Audit complet de toutes les pages
 */
async function runFullAudit() {
  logSection('🔬 TRADINGPOOL FRONTEND - COMPLETE AUDIT');
  
  createOutputDirs();

  log('🚀 Launching browser...', 'cyan');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();
  
  // Configurer viewport
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1
  });

  // Définir les pages à tester
  const pages = [
    { name: 'homepage', url: FRONTEND_URL },
    { name: 'login', url: `${FRONTEND_URL}/login` },
    { name: 'pools', url: `${FRONTEND_URL}/pools` },
    { name: 'dashboard', url: `${FRONTEND_URL}/dashboard` },
    { name: 'admin', url: `${FRONTEND_URL}/admin` }
  ];

  const results = [];

  // Capturer chaque page
  for (const pageInfo of pages) {
    const result = await capturePageWithLogs(page, pageInfo.name, pageInfo.url);
    results.push({
      ...pageInfo,
      ...result
    });
    
    // Attendre entre les captures
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  await browser.close();

  // Générer le rapport final
  logSection('📋 FINAL REPORT');
  
  log('Results by page:', 'bright');
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    const reactIcon = result.reactLoaded ? '🟢' : '🔴';
    const errorCount = result.errors || 0;
    
    log(`  ${icon} ${result.name.padEnd(15)} | React: ${reactIcon} | Errors: ${errorCount}`, 
        result.success ? 'green' : 'red');
  });

  log('\n📂 Output directories:', 'bright');
  log(`  Screenshots: ${SCREENSHOTS_DIR}`, 'cyan');
  log(`  Logs: ${LOGS_DIR}`, 'cyan');

  // Statistiques globales
  const totalErrors = results.reduce((sum, r) => sum + (r.errors || 0), 0);
  const successCount = results.filter(r => r.success).length;
  const reactLoadedCount = results.filter(r => r.reactLoaded).length;

  log('\n📊 Global statistics:', 'bright');
  log(`  ✅ Successful captures: ${successCount}/${results.length}`, 'green');
  log(`  🟢 React loaded: ${reactLoadedCount}/${results.length}`, reactLoadedCount === results.length ? 'green' : 'yellow');
  log(`  ⚠️  Total errors: ${totalErrors}`, totalErrors > 0 ? 'red' : 'green');

  if (totalErrors === 0 && reactLoadedCount === results.length) {
    logSection('🎉 ALL CHECKS PASSED!');
    log('The frontend appears to be working correctly.', 'green');
  } else {
    logSection('⚠️  ISSUES DETECTED');
    log('Please review the logs and screenshots for details.', 'yellow');
  }

  return results;
}

// Exécution principale
if (require.main === module) {
  runFullAudit()
    .then(() => {
      log('\n✅ Audit completed successfully', 'green');
      process.exit(0);
    })
    .catch(error => {
      log('\n❌ Audit failed:', 'red');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { capturePageWithLogs, runFullAudit };
