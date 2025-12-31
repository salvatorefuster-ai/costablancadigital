
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

// --- CONFIGURATION ---
const AGENCY_NAME = "Agencia Costa Blanca Digital";
const PROJECT_NAME = "Agencia-Costa-Digital";
const OUTPUT_DIR = path.join(__dirname, PROJECT_NAME);
const MAX_SITES = 100;
const CONCURRENCY = 4;

const HIGH_VALUE_PRIORITY = [
    'inmobiliarias',
    'hoteles',
    'abogados',
    'asesores',
    'reformas',
    'clinicas',
    'dentistas',
    'clubes nocturnos',
    'discotecas'
];

// --- DYNAMIC CONTENT & STYLE ENGINE (V5.5 Ultra Luxury) ---
const getBusinessVibe = (category = '', name = '') => {
    const cat = category.toLowerCase();
    const n = name.toLowerCase();

    // Legal & Consulting
    if (cat.includes('abogado') || cat.includes('legal') || n.includes('abogado') || cat.includes('asesores')) {
        return {
            palette: { primary: '#080c14', accent: '#c5a358', secondary: '#1e293b' },
            font: 'font-serif',
            title: 'Garantía & Excelencia Jurídica',
            tagline: 'Defendiendo su Legado en Benidorm'
        };
    }
    // High-End Real Estate & Tourism
    if (cat.includes('inmobiliaria') || cat.includes('hotel') || n.includes('apartamento') || cat.includes('hostales')) {
        return {
            palette: { primary: '#020617', accent: '#38bdf8', secondary: '#0f172a' },
            font: 'font-sans',
            title: 'Exclusividad en cada estancia',
            tagline: 'Su refugio de lujo en la Costa Blanca'
        };
    }
    // Nightlife & Entertainment
    if (cat.includes('club') || cat.includes('discoteca') || cat.includes('bingo')) {
        return {
            palette: { primary: '#000000', accent: '#f472b6', secondary: '#1e1b4b' },
            font: 'font-modern',
            title: 'La Noche Re-Imaginada',
            tagline: 'Donde Benidorm cobra vida'
        };
    }
    return {
        palette: { primary: '#000000', accent: '#c5a358', secondary: '#0a0a0a' },
        font: 'font-sans',
        title: 'Transformación Estratégica',
        tagline: 'Liderando el cambio digital'
    };
};

// --- ULTIMATE AGENCY HUB (Simplified as requested) ---
const generateAgencyLandingHTML = () => `
<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${AGENCY_NAME} | Centro de Evolución Digital</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background-color: #050505; color: #ffffff; font-family: sans-serif; }
        .hero-gradient { background: radial-gradient(circle at 50% 50%, rgba(197, 163, 88, 0.1) 0%, transparent 70%); }
    </style>
</head>
<body class="antialiased overflow-x-hidden hero-gradient">
    <nav class="p-10 flex justify-between items-center border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div class="font-bold text-xl uppercase tracking-tighter">${AGENCY_NAME}</div>
        <a href="proyectos.html" class="bg-white text-black px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest">Catálogo de 100 Leads</a>
    </nav>
    <header class="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
        <h1 class="text-6xl md:text-9xl font-bold mb-8 tracking-tighter">100 <span class="text-blue-500">Transformaciones.</span></h1>
        <p class="text-slate-400 text-xl max-w-2xl mb-12">Hemos seleccionado los 100 negocios con mayor potencial de Benidorm para una renovación digital completa.</p>
        <a href="proyectos.html" class="bg-blue-600 px-12 py-5 rounded-full font-bold uppercase tracking-widest hover:bg-blue-500 transition shadow-2xl">Ver Mi Prototipo</a>
    </header>
</body>
</html>
`;

// --- DIRECTORY (High-Value Focus) ---
const generateDirectoryHTML = (categories) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script>
    <title>Acceso Directo | Agencia Costa Blanca</title>
</head>
<body class="bg-black text-white font-sans p-10">
    <div class="max-w-7xl mx-auto">
        <h1 class="text-5xl font-bold mb-20 tracking-tighter">Top 100 <span class="text-blue-500">Targets</span> Benidorm</h1>
        ${Object.entries(categories).map(([catName, sites]) => `
            <div class="mb-20">
                <h2 class="text-xs uppercase tracking-[0.4em] text-slate-500 mb-10 border-b border-white/10 pb-4">${catName}</h2>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${sites.map(site => {
    const slug = site.name.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 50);
    return `
                        <a href="./${slug}/index.html" target="_blank" class="block bg-zinc-900/50 p-8 rounded-2xl border border-white/5 hover:border-blue-500/50 transition">
                             <div class="text-[9px] text-blue-400 font-bold uppercase tracking-widest mb-2">Lead Calificado</div>
                             <h3 class="text-xl font-bold mb-4">${site.name}</h3>
                             <div class="text-xs text-slate-500 truncate">${site.website}</div>
                        </a>
                        `;
}).join('')}
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>
`;

// --- THE CONSIDERABLE IMPROVEMENT TEMPLATE ---
const generateDemoHTML = (data) => {
    const vibe = getBusinessVibe(data.category, data.name);
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name} | Propuesta de Rediseño</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;600;700&family=Playfair+Display:ital,wght@1,700&display=swap" rel="stylesheet">
    <script>
        tailwind.config = { theme: { extend: { colors: { brand: { primary: '${vibe.palette.primary}', accent: '${vibe.palette.accent}', secondary: '${vibe.palette.secondary}' } } } } }
    </script>
    <style>
        .comparison-slider { position: relative; width: 100%; height: 75vh; overflow: hidden; border-radius: 20px; box-shadow: 0 40px 80px rgba(0,0,0,0.5); }
        .comparison-slider .image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-size: cover; background-position: center top; }
        .comparison-slider .before { background-image: url('./old.png'); z-index: 1; filter: grayscale(100%) blur(2px); opacity: 0.7; }
        .comparison-slider .after { background-image: url('./new_preview.png'); z-index: 2; width: 50%; border-right: 4px solid ${vibe.palette.accent}; }
        .comparison-slider input[type="range"] { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 30; appearance: none; background: transparent; cursor: ew-resize; margin: 0; }
        .slider-handle { position: absolute; top: 0; bottom: 0; left: 50%; width: 4px; background: ${vibe.palette.accent}; z-index: 20; transform: translateX(-50%); pointer-events: none; }
        .slider-btn { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 64px; height: 64px; background: white; color: black; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 25; font-weight: bold; }
    </style>
</head>
<body class="bg-brand-primary text-white font-sans antialiased">
    <nav class="p-10 flex justify-between items-center bg-black/30 backdrop-blur-md">
        <a href="../proyectos.html" class="text-xs font-bold uppercase tracking-widest">&larr; Volver</a>
        <div class="font-bold">${data.name}</div>
        <div class="hidden md:block text-[9px] uppercase tracking-widest text-brand-accent">Lead Prioritario V5.5</div>
    </nav>
    <section class="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 class="text-7xl md:text-9xl font-bold mb-10 tracking-tighter">Adiós a lo <br> <span class="text-brand-accent italic font-serif">Antiguo.</span></h1>
        <p class="text-slate-400 text-xl max-w-2xl mx-auto mb-20 italic">"Su negocio genera miles de euros. Su web parece de otra década. Hemos corregido eso."</p>
        <div class="comparison-slider mb-32">
            <div class="image before"></div>
            <div class="image after" id="after-image"></div>
            <input type="range" min="0" max="100" value="50" id="slider-input">
            <div class="slider-handle" id="handle"></div>
            <div class="slider-btn" id="slider-btn">&harr;</div>
        </div>
        <div class="grid md:grid-cols-3 gap-10">
            <div class="bg-white/5 p-12 rounded-[40px] border border-white/5 hover:border-brand-accent/30 transition">
                <div class="text-brand-accent text-3xl mb-4 font-bold">10x Impacto</div>
                <p class="text-slate-400 text-sm italic">Diseño emocional que detiene el scroll y genera confianza inmediata.</p>
            </div>
            <div class="bg-white/5 p-12 rounded-[40px] border border-white/5 hover:border-brand-accent/30 transition">
                <div class="text-brand-accent text-3xl mb-4 font-bold">0.8s Carga</div>
                <p class="text-slate-400 text-sm italic">Tecnología de última generación compatible con el SEO de 2025.</p>
            </div>
            <div class="bg-white/5 p-12 rounded-[40px] border border-white/5 hover:border-brand-accent/30 transition">
                <div class="text-brand-accent text-3xl mb-4 font-bold">VIP Design</div>
                <p class="text-slate-400 text-sm italic">Personalizado para la demografía de alto poder adquisitivo de Benidorm.</p>
            </div>
        </div>
    </section>
    <section class="py-40 bg-brand-accent text-brand-primary text-center">
        <h2 class="text-6xl md:text-8xl font-black mb-10 tracking-tighter uppercase">¿Empezamos?</h2>
        <a href="https://wa.me/34663036070" class="bg-brand-primary text-white px-16 py-6 rounded-full font-bold uppercase tracking-widest inline-block scale-110">Activar mi Rediseño</a>
    </section>
    <script>
        const input = document.getElementById('slider-input');
        const after = document.getElementById('after-image');
        const handle = document.getElementById('handle');
        const btn = document.getElementById('slider-btn');
        input.addEventListener('input', (e) => {
            const val = e.target.value;
            after.style.width = val + '%';
            handle.style.left = val + '%';
            btn.style.left = val + '%';
        });
    </script>
</body>
</html>
`;
};

// --- CORE GENERATOR ---
async function run() {
    console.log("--- [TARGETED 100 HIGH-VALUE GEN] ---");
    let leads = [];
    try {
        leads = JSON.parse(fs.readFileSync('negocios_benidorm_completo.json', 'utf8')).filter(b => b.website && b.website.startsWith('http'));
    } catch (e) { return; }

    // Smart Filtering: High Value + Potential Old Site
    const targets = leads.sort((a, b) => {
        const aVal = HIGH_VALUE_PRIORITY.indexOf(a.category.toLowerCase());
        const bVal = HIGH_VALUE_PRIORITY.indexOf(b.category.toLowerCase());
        const aSort = aVal === -1 ? 999 : aVal;
        const bSort = bVal === -1 ? 999 : bVal;
        return aSort - bSort;
    }).slice(0, MAX_SITES);

    console.log(`Generando los 100 mejores prospectos de Benidorm...`);
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    let results = [];

    const processSite = async (business) => {
        const slug = business.name.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 50);
        const folder = path.join(OUTPUT_DIR, slug);
        if (!fs.existsSync(folder)) fs.mkdirSync(folder);

        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });

        try {
            await page.goto(business.website, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await page.screenshot({ path: path.join(folder, 'old.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });

            const scraped = await page.evaluate(() => ({ heroImage: Array.from(document.querySelectorAll('img')).find(i => i.naturalWidth > 600)?.src }));
            const demoHtml = generateDemoHTML({ ...business, ...scraped });
            fs.writeFileSync(path.join(folder, 'index.html'), demoHtml);

            await page.goto(`file://${path.join(folder, 'index.html')}`, { waitUntil: 'networkidle2' });
            await page.evaluate(() => { document.querySelector('section').style.display = 'none'; document.querySelector('nav').style.display = 'none'; });
            await page.screenshot({ path: path.join(folder, 'new_preview.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });

            process.stdout.write('🔥');
            return { ...business, category: business.category || 'general' };
        } catch (e) { process.stdout.write('x'); return null; } finally { await page.close(); }
    };

    for (let i = 0; i < targets.length; i += CONCURRENCY) {
        const batch = await Promise.all(targets.slice(i, i + CONCURRENCY).map(processSite));
        results.push(...batch.filter(r => r !== null));
    }

    const categories = results.reduce((acc, current) => {
        const cat = current.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(current);
        return acc;
    }, {});

    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), generateAgencyLandingHTML());
    fs.writeFileSync(path.join(OUTPUT_DIR, 'proyectos.html'), generateDirectoryHTML(categories));
    console.log("\n--- [TOP 100 LISTO] ---");
    await browser.close();
}

run();
