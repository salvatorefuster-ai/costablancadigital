
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const DEMOS_DIR = path.join(__dirname, 'demo');

const getFullFunctionalTemplate = (data) => `
<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name} | Web Oficial</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Outfit', 'sans-serif'], serif: ['Playfair Display', 'serif'] },
                    colors: { primary: '${data.color || '#d4af37'}', bg: '#050505' }
                }
            }
        }
    </script>
    <style>
        .glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); }
        .hero-gradient { background: radial-gradient(circle at 0% 0%, ${data.color}22 0%, transparent 50%); }
    </style>
</head>
<body class="bg-bg text-white font-sans">
    <nav class="fixed w-full z-50 px-10 py-6 flex justify-between items-center glass">
        <div class="text-xl font-bold tracking-tighter uppercase">${data.name}</div>
        <div class="hidden md:flex space-x-10 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <a href="#inicio" class="hover:text-primary transition">Inicio</a>
            <a href="#servicios" class="hover:text-primary transition">Servicios</a>
            <a href="#contacto" class="hover:text-primary transition">Contacto</a>
        </div>
        <a href="#contacto" class="bg-primary text-black px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition">Reservar</a>
    </nav>

    <header id="inicio" class="min-h-screen flex flex-col items-center justify-center text-center px-6 hero-gradient pt-20">
        <h1 class="text-6xl md:text-8xl font-serif italic mb-8 leading-tight animate-fade-in">${data.name}</h1>
        <p class="text-xl text-gray-400 max-w-2xl mb-12 font-light">${data.description || 'Líderes en Benidorm. Excelencia y compromiso con cada cliente.'}</p>
        <div class="flex gap-6">
            <a href="#servicios" class="bg-primary text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs">Descubrir Servicios</a>
            <a href="#contacto" class="glass px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition">Hablar con nosotros</a>
        </div>
    </header>

    <section id="servicios" class="py-32 px-10">
        <div class="max-w-7xl mx-auto">
            <h2 class="text-4xl font-serif mb-20 text-center">Especialidades <span class="text-primary italic">Premium</span></h2>
            <div class="grid md:grid-cols-3 gap-8">
                ${data.headings.slice(0, 6).map((h, i) => `
                <div class="glass p-12 rounded-[40px] hover:border-primary/50 transition-all duration-500">
                    <div class="text-primary text-4xl mb-6 font-serif italic">${i + 1}.</div>
                    <h3 class="text-2xl font-bold mb-4">${h}</h3>
                    <p class="text-gray-500 text-sm leading-relaxed">Ofrecemos soluciones personalizadas enfocadas en maximizar su seguridad y satisfacción.</p>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <section id="about" class="py-32 bg-[#080808]">
        <div class="max-w-7xl mx-auto px-10 grid md:grid-cols-2 gap-20 items-center">
            <div class="rounded-3xl overflow-hidden glass h-[500px]">
                ${data.heroImage ? `<img src="${data.heroImage}" class="w-full h-full object-cover">` : '<div class="w-full h-full bg-zinc-900"></div>'}
            </div>
            <div>
                <h2 class="text-4xl font-serif mb-8">Nuestra <span class="text-primary italic">Misión</span></h2>
                <div class="space-y-6 text-gray-400 font-light text-lg">
                    ${data.paragraphs.slice(0, 3).map(p => `<p>${p}</p>`).join('')}
                </div>
            </div>
        </div>
    </section>

    <section id="contacto" class="py-32 px-10 text-center">
        <div class="max-w-3xl mx-auto">
            <h2 class="text-5xl font-bold mb-10">¿Hablamos de su <span class="text-primary">Proyecto?</span></h2>
            <p class="text-gray-400 mb-12">Estamos en Benidorm para ofrecerle la atención que su negocio merece.</p>
            <form class="glass p-12 rounded-[50px] space-y-6 text-left">
                <div class="grid md:grid-cols-2 gap-6">
                    <input type="text" placeholder="Nombre" class="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-primary outline-none">
                    <input type="email" placeholder="Email" class="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-primary outline-none">
                </div>
                <textarea placeholder="Mensaje" rows="5" class="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-primary outline-none"></textarea>
                <button type="submit" class="w-full bg-primary text-black py-5 rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-[1.02] transition">Enviar Solicitud</button>
            </form>
        </div>
    </section>

    <footer class="py-10 border-t border-white/5 text-center text-[10px] text-gray-600 uppercase tracking-[0.5em]">
        © 2025 ${data.name} &bull; Benidorm, Costa Blanca
    </footer>
</body>
</html>
`;

async function produceDemos() {
    console.log('--- PRODUCCIÓN DE WEBS FUNCIONALES (TOP 20) ---');

    const csvPath = path.join(__dirname, 'resumen_ventas.csv');
    if (!fs.existsSync(csvPath)) return;

    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').slice(1);

    const top20 = lines
        .filter(l => l.trim() !== '')
        .map(l => {
            const matches = l.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            if (!matches) return null;
            return {
                name: matches[0].replace(/"/g, ''),
                website: matches[1].replace(/"/g, ''),
                email: matches[2].replace(/"/g, ''),
                score: matches[3]
            };
        })
        .filter(b => b && b.score === "10")
        .slice(0, 20);

    if (!fs.existsSync(DEMOS_DIR)) fs.mkdirSync(DEMOS_DIR);

    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });

    for (const biz of top20) {
        const slug = biz.name.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 50);
        const bizDir = path.join(DEMOS_DIR, slug);
        if (!fs.existsSync(bizDir)) fs.mkdirSync(bizDir);

        console.log(`[DEMO FULL] Creando web para: ${biz.name}`);
        const page = await browser.newPage();
        try {
            await page.goto(biz.website, { waitUntil: 'domcontentloaded', timeout: 30000 });

            const scraped = await page.evaluate(() => {
                const getMeta = (nm) => (document.querySelector(`meta[name="${nm}"]`) || document.querySelector(`meta[property="${nm}"]`))?.content || '';
                const paragraphs = Array.from(document.querySelectorAll('p')).map(p => p.innerText.trim()).filter(t => t.length > 50).slice(0, 5);
                const headings = Array.from(document.querySelectorAll('h2, h3')).map(h => h.innerText.trim()).filter(t => t.length > 5 && t.length < 50).slice(0, 8);
                const images = Array.from(document.querySelectorAll('img')).map(i => i.src).filter(s => s.startsWith('http')).slice(0, 10);
                return { description: getMeta('description'), paragraphs, headings, images };
            });

            // Asignar color según nicho
            let color = '#d4af37'; // Gold default
            const n = biz.name.toLowerCase();
            if (n.includes('abogado') || n.includes('legal')) color = '#c5a358';
            if (n.includes('inmobiliaria') || n.includes('fincas')) color = '#38bdf8';
            if (n.includes('hotel') || n.includes('club')) color = '#f472b6';

            const siteData = {
                name: biz.name,
                originalUrl: biz.website,
                color,
                ...scraped,
                heroImage: scraped.images.find(i => i.includes('hero') || i.includes('banner')) || scraped.images[0] || null
            };

            // Heurística de Fallback
            if (siteData.paragraphs.length < 2) siteData.paragraphs = ["Especialistas altamente cualificados con años de experiencia en el sector.", "Nuestra prioridad es ofrecer una atención exclusiva y personalizada a cada uno de nuestros clientes en Benidorm."];
            if (siteData.headings.length < 3) siteData.headings = ["Atención Directa", "Gestión Integral", "Resultados Garantizados"];

            const html = getFullFunctionalTemplate(siteData);
            fs.writeFileSync(path.join(bizDir, 'index.html'), html);

            // Creamos el archivo de metadatos para Render (simulado)
            fs.writeFileSync(path.join(bizDir, 'render.yaml'), `services:\n  - type: web\n    name: ${slug}\n    runtime: static`);

            console.log(`✅ [PRODUCIDA] -> /demo/${slug}/index.html`);
        } catch (e) {
            console.log(`❌ [ERROR] ${biz.name}: ${e.message}`);
        } finally {
            await page.close();
        }
    }

    await browser.close();
    console.log('--- WEBS COMPLETAMENTE FUNCIONALES LISTAS EN /demo ---');
}

produceDemos();
