#!/usr/bin/env node
/**
 * analyze_styles.js - CSS and styling analysis tool
 * Analyzes the visual appearance and styles of the TradingPool frontend
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://tradingpool-frontend.onrender.com';
const OUTPUT_DIR = path.join(__dirname, 'style_analysis');

// Couleurs pour logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + colors.bright + colors.cyan + '='.repeat(60) + colors.reset);
  console.log(colors.bright + colors.cyan + `  ${title}` + colors.reset);
  console.log(colors.bright + colors.cyan + '='.repeat(60) + colors.reset + '\n');
}

/**
 * Analyser les styles d'un élément
 */
function getComputedStyles(element) {
  const styles = window.getComputedStyle(element);
  return {
    // Layout
    display: styles.display,
    position: styles.position,
    width: styles.width,
    height: styles.height,
    
    // Colors
    backgroundColor: styles.backgroundColor,
    color: styles.color,
    
    // Typography
    fontFamily: styles.fontFamily,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    lineHeight: styles.lineHeight,
    
    // Spacing
    margin: styles.margin,
    padding: styles.padding,
    
    // Borders
    border: styles.border,
    borderRadius: styles.borderRadius,
    
    // Others
    opacity: styles.opacity,
    zIndex: styles.zIndex
  };
}

/**
 * Analyser toutes les couleurs utilisées sur la page
 */
function extractColors() {
  const colors = new Set();
  const elements = document.querySelectorAll('*');
  
  elements.forEach(el => {
    const styles = window.getComputedStyle(el);
    
    // Background colors
    if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      colors.add(styles.backgroundColor);
    }
    
    // Text colors
    if (styles.color) {
      colors.add(styles.color);
    }
    
    // Border colors
    if (styles.borderColor && styles.borderColor !== 'rgb(0, 0, 0)') {
      colors.add(styles.borderColor);
    }
  });
  
  return Array.from(colors);
}

/**
 * Analyser les polices utilisées
 */
function extractFonts() {
  const fonts = new Set();
  const elements = document.querySelectorAll('*');
  
  elements.forEach(el => {
    const fontFamily = window.getComputedStyle(el).fontFamily;
    if (fontFamily) {
      fonts.add(fontFamily);
    }
  });
  
  return Array.from(fonts);
}

/**
 * Analyser la structure du DOM
 */
function analyzeDOMStructure() {
  return {
    totalElements: document.querySelectorAll('*').length,
    divs: document.querySelectorAll('div').length,
    buttons: document.querySelectorAll('button').length,
    inputs: document.querySelectorAll('input').length,
    images: document.querySelectorAll('img').length,
    links: document.querySelectorAll('a').length,
    headings: {
      h1: document.querySelectorAll('h1').length,
      h2: document.querySelectorAll('h2').length,
      h3: document.querySelectorAll('h3').length,
      h4: document.querySelectorAll('h4').length,
      h5: document.querySelectorAll('h5').length,
      h6: document.querySelectorAll('h6').length
    }
  };
}

/**
 * Analyser les animations et transitions
 */
function extractAnimations() {
  const animations = [];
  const elements = document.querySelectorAll('*');
  
  elements.forEach(el => {
    const styles = window.getComputedStyle(el);
    
    if (styles.animation && styles.animation !== 'none') {
      animations.push({
        element: el.tagName + (el.className ? `.${el.className.split(' ')[0]}` : ''),
        animation: styles.animation
      });
    }
    
    if (styles.transition && styles.transition !== 'all 0s ease 0s') {
      animations.push({
        element: el.tagName + (el.className ? `.${el.className.split(' ')[0]}` : ''),
        transition: styles.transition
      });
    }
  });
  
  return animations.slice(0, 50); // Limiter à 50
}

/**
 * Exécuter l'analyse complète
 */
async function runStyleAnalysis() {
  logSection('🎨 TRADINGPOOL - STYLE ANALYSIS');
  
  // Créer le dossier de sortie
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  log('🚀 Launching browser...', 'cyan');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  log(`🌐 Navigating to: ${FRONTEND_URL}`, 'cyan');
  await page.goto(FRONTEND_URL, {
    waitUntil: 'networkidle2',
    timeout: 60000
  });
  
  await page.waitForTimeout(3000);

  log('📊 Analyzing styles...', 'cyan');

  // Analyser les styles
  const styleAnalysis = await page.evaluate(() => {
    const getComputedStyles = ${getComputedStyles.toString()};
    const extractColors = ${extractColors.toString()};
    const extractFonts = ${extractFonts.toString()};
    const analyzeDOMStructure = ${analyzeDOMStructure.toString()};
    const extractAnimations = ${extractAnimations.toString()};
    
    const root = document.getElementById('root');
    const body = document.body;
    
    return {
      body: getComputedStyles(body),
      root: root ? getComputedStyles(root) : null,
      rootContent: root ? root.innerHTML.substring(0, 500) : 'No root element',
      colors: extractColors(),
      fonts: extractFonts(),
      domStructure: analyzeDOMStructure(),
      animations: extractAnimations(),
      stylesheets: Array.from(document.styleSheets).map(sheet => ({
        href: sheet.href,
        rules: sheet.cssRules ? sheet.cssRules.length : 'blocked'
      })),
      customProperties: Array.from(document.styleSheets)
        .flatMap(sheet => {
          try {
            return Array.from(sheet.cssRules || []);
          } catch {
            return [];
          }
        })
        .filter(rule => rule.selectorText === ':root')
        .flatMap(rule => Array.from(rule.style))
        .filter(prop => prop.startsWith('--'))
        .slice(0, 50)
    };
  });

  // Afficher les résultats
  logSection('📋 ANALYSIS RESULTS');
  
  log('🎨 Body styles:', 'yellow');
  console.log(JSON.stringify(styleAnalysis.body, null, 2));
  
  log('\n🎨 Root element styles:', 'yellow');
  if (styleAnalysis.root) {
    console.log(JSON.stringify(styleAnalysis.root, null, 2));
  } else {
    log('  ⚠️  No root element found!', 'yellow');
  }
  
  log('\n🌈 Color palette:', 'yellow');
  log(`  Total unique colors: ${styleAnalysis.colors.length}`, 'gray');
  styleAnalysis.colors.slice(0, 20).forEach(color => {
    log(`    - ${color}`, 'gray');
  });
  if (styleAnalysis.colors.length > 20) {
    log(`    ... and ${styleAnalysis.colors.length - 20} more`, 'gray');
  }
  
  log('\n📝 Fonts used:', 'yellow');
  styleAnalysis.fonts.forEach(font => {
    log(`    - ${font}`, 'gray');
  });
  
  log('\n🏗️  DOM structure:', 'yellow');
  log(`  Total elements: ${styleAnalysis.domStructure.totalElements}`, 'gray');
  log(`  Divs: ${styleAnalysis.domStructure.divs}`, 'gray');
  log(`  Buttons: ${styleAnalysis.domStructure.buttons}`, 'gray');
  log(`  Inputs: ${styleAnalysis.domStructure.inputs}`, 'gray');
  log(`  Links: ${styleAnalysis.domStructure.links}`, 'gray');
  log(`  Images: ${styleAnalysis.domStructure.images}`, 'gray');
  log('  Headings:', 'gray');
  Object.entries(styleAnalysis.domStructure.headings).forEach(([tag, count]) => {
    if (count > 0) {
      log(`    - ${tag}: ${count}`, 'gray');
    }
  });
  
  log('\n📄 Stylesheets:', 'yellow');
  styleAnalysis.stylesheets.forEach((sheet, i) => {
    log(`  ${i + 1}. ${sheet.href || 'inline'} (${sheet.rules} rules)`, 'gray');
  });
  
  if (styleAnalysis.customProperties.length > 0) {
    log('\n🎯 CSS Custom Properties (first 20):', 'yellow');
    styleAnalysis.customProperties.slice(0, 20).forEach(prop => {
      log(`    ${prop}`, 'gray');
    });
  }
  
  if (styleAnalysis.animations.length > 0) {
    log('\n✨ Animations/Transitions (first 10):', 'yellow');
    styleAnalysis.animations.slice(0, 10).forEach(anim => {
      log(`    ${anim.element}:`, 'gray');
      if (anim.animation) {
        log(`      animation: ${anim.animation}`, 'gray');
      }
      if (anim.transition) {
        log(`      transition: ${anim.transition}`, 'gray');
      }
    });
  }
  
  // Sauvegarder les résultats
  const timestamp = Date.now();
  const outputPath = path.join(OUTPUT_DIR, `style_analysis_${timestamp}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(styleAnalysis, null, 2));
  
  log(`\n✅ Analysis saved to: ${outputPath}`, 'green');
  
  // Screenshot pour référence visuelle
  const screenshotPath = path.join(OUTPUT_DIR, `screenshot_${timestamp}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  log(`✅ Screenshot saved to: ${screenshotPath}`, 'green');

  await browser.close();
  
  logSection('✅ STYLE ANALYSIS COMPLETE');
  
  return styleAnalysis;
}

// Exécution
if (require.main === module) {
  runStyleAnalysis()
    .then(() => {
      log('\n✅ Style analysis completed successfully', 'green');
      process.exit(0);
    })
    .catch(error => {
      log('\n❌ Style analysis failed:', 'red');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { runStyleAnalysis };
