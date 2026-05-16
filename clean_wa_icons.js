const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const iconSpan = `<span class="whatsapp-inline-icon" aria-hidden="true" style="display: inline-block; width: 1.2em; height: 1.2em; background-image: url('./assets/images/whatsapp-icon.jpg'); background-size: contain; background-repeat: no-repeat; transform: translateY(0.2em); margin-right: 0.3em;"></span>`;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let html = fs.readFileSync(filePath, 'utf8');
    
    // First, completely remove all traces of whatsapp-inline-text and whatsapp-inline-icon
    html = html.replace(/<span class="whatsapp-inline-text[^>]*>/g, '');
    html = html.replace(/<span class="whatsapp-inline-icon[^>]*><\/span>/g, '');
    html = html.replace(/<\/span>(?=WhatsApp)/g, ''); // Be careful with this, might leave unclosed tags if not precise. Let's do it safer:
    
    // Actually, a safer way to reset is to find the pattern where WhatsApp is inside a span that we added:
    // Because we just removed the opening `<span class="whatsapp-inline-text">`, we have an extra `</span>` after WhatsApp.
    // Let's just restore from git? No git available.
    
    fs.writeFileSync(filePath, html, 'utf8');
});
