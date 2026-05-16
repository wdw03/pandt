const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let html = fs.readFileSync(filePath, 'utf8');

    // First, let's clean up existing spans so we don't nest them infinitely
    // Remove existing whatsapp-inline-text wrappers to normalize
    html = html.replace(/<span class="whatsapp-inline-text[^>]*>\s*<span class="whatsapp-inline-icon"[^>]*><\/span>\s*(WhatsApp[^<]*)<\/span>/g, '$1');
    html = html.replace(/<span class="whatsapp-inline-text[^>]*>\s*(WhatsApp[^<]*)<\/span>/g, '$1');

    // The inline style guarantees it will show up
    const iconSpan = `<span class="whatsapp-inline-icon" aria-hidden="true" style="display: inline-block; width: 1.2em; height: 1.2em; background-image: url('./assets/images/whatsapp-icon.jpg'); background-size: contain; background-repeat: no-repeat; transform: translateY(0.2em); margin-right: 0.3em;"></span>`;

    // Replace 'WhatsApp report'
    html = html.replace(/(>|\s)(WhatsApp report)(<|\s|\.|\,)/gi, `$1<span class="whatsapp-inline-text whatsapp-inline-chip">${iconSpan}$2</span>$3`);

    // Replace 'WhatsApp number'
    html = html.replace(/(>|\s)(WhatsApp number)(<|\s|\.|\,)/gi, `$1<span class="whatsapp-inline-text">${iconSpan}$2</span>$3`);

    // Replace standalone 'WhatsApp' (but avoid matching inside URLs, attributes, or the ones we just replaced)
    html = html.replace(/(>)(WhatsApp)(<)/g, `$1<span class="whatsapp-inline-text">${iconSpan}$2</span>$3`);

    // Also look for "WhatsApp" in free text like "Gender, birth time and WhatsApp"
    html = html.replace(/(and )(WhatsApp)(<)/g, `$1<span class="whatsapp-inline-text">${iconSpan}$2</span>$3`);

    // In navbars, it says "WhatsApp" in data-i18n="drawer_whatsapp"
    html = html.replace(/>WhatsApp<\/span>/g, `>${iconSpan}WhatsApp</span>`);

    // Fix any double icons if they happened
    html = html.replace(new RegExp(`${iconSpan.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(<span class="whatsapp-inline-text)`, 'g'), '$1');

    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`Processed ${file}`);
});
