const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const inlineStyles = `style="background-image: url('./assets/images/whatsapp-icon.jpg'); background-size: contain; background-repeat: no-repeat; width: 1.2em; height: 1.2em; display: inline-block; transform: translateY(0.2em); margin-right: 0.3em;"`;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let html = fs.readFileSync(filePath, 'utf8');
    let originalHtml = html;
    
    // Task 1: Fix Navbars (horoscope.html -> astrology.html)
    html = html.replace(/href="horoscope\.html" data-i18n="nav_horoscope">Horoscope<\/a>/g, 'href="astrology.html" data-i18n="nav_horoscope">Astrology</a>');
    html = html.replace(/href="horoscope\.html" data-i18n="nav_horoscope">Daily Horoscope<\/a>/g, 'href="astrology.html" data-i18n="nav_horoscope">Astrology</a>');
    
    // Task 2: Inject Inline Styles to EXISTING whatsapp-inline-icon spans
    // This handles the spans the user already has in index.html (like line 447)
    // We replace the opening tag and make sure we don't duplicate styles if they exist
    html = html.replace(/<span class="whatsapp-inline-icon"\s*(aria-hidden="true")?\s*(style="[^"]*")?>/g, `<span class="whatsapp-inline-icon" aria-hidden="true" ${inlineStyles}>`);
    
    // Task 3: Ensure "WhatsApp report", "WhatsApp number", and bare "WhatsApp" have the icon next to them
    // But we only want to do this if they DON'T already have a whatsapp-inline-text wrapper around them!
    
    // A simple trick: Let's manually replace the known bare occurrences in index.html, free-janam-kundali.html, kundali-matching.html
    // For "WhatsApp report"
    html = html.replace(/(?<!<span class="whatsapp-inline-icon"[^>]*><\/span>)\s*WhatsApp report/g, 
        ` <span class="whatsapp-inline-text whatsapp-inline-chip"><span class="whatsapp-inline-icon" aria-hidden="true" ${inlineStyles}></span>WhatsApp report</span>`);
    
    // Clean up any double-wrappings we just caused by the aggressive regex
    // If we have `<span class="whatsapp-inline-text...><span class="whatsapp-inline-text...>`
    html = html.replace(/<span class="whatsapp-inline-text[^>]*>\s*<span class="whatsapp-inline-text/g, '<span class="whatsapp-inline-text');
    html = html.replace(/<\/span>\s*<\/span>(?=\s*<\/div>|\s*<\/a>|\s*<\/p>|\s*<\/li>)/g, '</span>');

    if (html !== originalHtml) {
        fs.writeFileSync(filePath, html, 'utf8');
        console.log(`Updated ${file}`);
    }
});
