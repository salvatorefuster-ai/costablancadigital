
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

// --- PLANTILLA HTML MODERNA ---
// Esta plantilla usa Tailwind vía CDN para no requerir build steps complejos.
// Se inyectarán los datos escrapeados.
const generateHTML = (data) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title} - Renovado</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#0f172a',
                        secondary: '#334155',
                        accent: '#3b82f6',
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .glass { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); }
    </style>
</head>
<body class="bg-gray-50 text-gray-800 antialiased">
    <!-- Navigation -->
    <nav class="fixed w-full z-50 transition-all duration-300 glass border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div class="text-2xl font-bold text-accent tracking-tighter">
                ${data.name}
            </div>
            <div class="hidden md:flex space-x-8 text-sm font-medium text-gray-600">
                <a href="#hero" class="hover:text-accent transition">Inicio</a>
                <a href="#about" class="hover:text-accent transition">Nosotros</a>
                <a href="#services" class="hover:text-accent transition">Servicios</a>
                <a href="#contact" class="hover:text-accent transition">Contacto</a>
            </div>
            <a href="#contact" class="px-5 py-2.5 bg-accent text-white rounded-full font-semibold shadow-lg hover:shadow-accent/50 transition transform hover:-translate-y-0.5">
                Contactar Ahora
            </a>
        </div>
    </nav>

    <!-- Hero Section -->
    <header id="hero" class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div class="absolute inset-0 z-0">
            ${data.heroImage ? `<img src="${data.heroImage}" alt="Cover" class="w-full h-full object-cover opacity-20">` : '<div class="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 opacity-20"></div>'}
            <div class="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent"></div>
        </div>
        
        <div class="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <span class="inline-block py-1 px-3 rounded-full bg-accent/10 text-accent font-semibold text-sm mb-6">
                Rediseño Propuesto &bull; Versión 2.0
            </span>
            <h1 class="text-5xl md:text-7xl font-bold text-primary mb-8 tracking-tight leading-tight">
                ${data.h1 || data.name}
            </h1>
            <p class="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto mb-10 leading-relaxed">
                ${data.description || 'Elevando la experiencia de sus clientes con una presencia digital moderna y optimizada.'}
            </p>
            <div class="flex flex-col sm:flex-row justify-center gap-4">
                <a href="#" class="px-8 py-4 bg-primary text-white rounded-xl font-bold shadow-xl hover:shadow-2xl hover:bg-gray-900 transition transform hover:-translate-y-1">
                    Ver Demo Completa
                </a>
                <a href="${data.originalUrl}" target="_blank" class="px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-bold hover:border-gray-300 hover:bg-gray-50 transition">
                    Ver Sitio Original
                </a>
            </div>
        </div>
    </header>

    <!-- Content Analysis Section -->
    <section id="about" class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div class="relative">
                <div class="absolute -inset-4 bg-accent/20 rounded-2xl blur-xl transform -rotate-3"></div>
                ${data.images[1] ? `<img src="${data.images[1]}" class="relative rounded-2xl shadow-2xl w-full object-cover h-96">` : '<div class="relative rounded-2xl shadow-2xl w-full h-96 bg-gray-200 flex items-center justify-center text-gray-400">Imagen no disponible</div>'}
            </div>
            <div>
                <h2 class="text-3xl font-bold text-primary mb-6">Sobre ${data.name}</h2>
                <div class="prose prose-lg text-gray-600">
                    ${data.paragraphs.slice(0, 3).map(p => `<p class="mb-4">${p}</p>`).join('')}
                </div>
                
                <div class="mt-8 flex gap-4">
                    <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div class="text-2xl font-bold text-accent mb-1">100%</div>
                        <div class="text-sm text-gray-500 font-medium">Optimizado</div>
                    </div>
                    <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div class="text-2xl font-bold text-accent mb-1">24/7</div>
                        <div class="text-sm text-gray-500 font-medium">Disponible</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Services / Highlights -->
    <section id="services" class="py-20 bg-gray-50">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-3xl font-bold text-primary mb-4">Servicios Destacados</h2>
                <p class="text-gray-500 max-w-2xl mx-auto">Información extraída y reestructurada para mayor impacto visual.</p>
            </div>
            
            <div class="grid md:grid-cols-3 gap-8">
                <!-- Tarjetas generadas dinámicamente con los H2 o H3 encontrados -->
                ${data.headings.slice(0, 6).map((heading, i) => `
                <div class="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 border border-gray-100 group">
                    <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition">
                        <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-3">${heading}</h3>
                    <p class="text-gray-500 text-sm leading-relaxed">
                        Este es un servicio destacado que ofrece ${data.name}. Hemos modernizado la presentación para captar más atención.
                    </p>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- Gallery / Visuals -->
    <section class="py-20 overflow-hidden">
        <div class="max-w-7xl mx-auto px-6">
            <h2 class="text-3xl font-bold text-primary mb-10 text-center">Galería Visual</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                ${data.images.slice(0, 8).map(img => `
                <div class="aspect-square rounded-xl overflow-hidden group">
                    <img src="${img}" class="w-full h-full object-cover transform group-hover:scale-110 transition duration-500" alt="Gallery">
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- CTA Contact -->
    <section id="contact" class="py-20 bg-primary text-white text-center">
        <div class="max-w-4xl mx-auto px-6">
            <h2 class="text-4xl font-bold mb-6">¿Listo para actualizar su imagen?</h2>
            <p class="text-xl text-blue-200 mb-10">Esta es una demostración de lo que podemos hacer por ${data.name}.</p>
            <div class="flex flex-col sm:flex-row justify-center gap-6">
                <button class="bg-white text-primary px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg">
                    Agendar Reunión
                </button>
                <button class="bg-transparent border border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition">
                    Ver Más Diseños
                </button>
            </div>
        </div>
    </section>

    <footer class="py-10 bg-gray-900 border-t border-gray-800 text-center text-gray-500">
        <p>&copy; 2024 ${data.name} - Concepto de Rediseño. Todos los derechos reservados.</p>
    </footer>
</body>
</html>
`;


// --- SCRIPT PRINCIPAL ---

async function runGenerator() {
    console.log('--- Iniciando Generador de Sitios Modernos ---');

    // 1. Cargar datos
    const jsonPath = path.join(__dirname, 'negocios_benidorm_completo.json');
    if (!fs.existsSync(jsonPath)) {
        console.error('ERROR: No se encuentra negocios_benidorm_completo.json');
        return;
    }

    const rawData = fs.readFileSync(jsonPath, 'utf8');
    let businesses = [];
    try {
        businesses = JSON.parse(rawData);
    } catch (e) {
        // Handle json lines or partial json if needed
        console.error('Error parseando JSON. Asegúrate de que es un JSON válido.');
        return;
    }

    // Filtrar los que tienen web
    const targets = businesses.filter(b => b.website && b.website.startsWith('http'));

    console.log(`\nTotal negocios encontrados: ${businesses.length}`);
    console.log(`Negocios con web a renovar: ${targets.length}`);

    // Crear carpeta base de proyectos
    const outputDir = path.join(__dirname, 'proyectos_renovados');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    // Iniciar browser
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });

    // Limitar para prueba (o quitar límite para full)
    // Procesaremos por lotes de 10 o todos
    const concurrency = 3;

    // Helper de limpieza de nombres para carpetas
    const sanitizeName = (name) => {
        return name.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 50);
    };

    const processBusiness = async (business) => {
        const folderName = sanitizeName(business.name);
        const businessDir = path.join(outputDir, business.category || 'varios', folderName);

        // Crear estructura de carpetas
        if (!fs.existsSync(path.join(outputDir, business.category || 'varios'))) {
            fs.mkdirSync(path.join(outputDir, business.category || 'varios'), { recursive: true });
        }
        if (!fs.existsSync(businessDir)) {
            fs.mkdirSync(businessDir, { recursive: true });
        }

        // Si ya existe index.html, saltar (resume capability)
        if (fs.existsSync(path.join(businessDir, 'index.html'))) {
            return `[SKIP] ${business.name} (Ya existe)`;
        }

        const page = await browser.newPage();
        try {
            console.log(`[ANALIZANDO] ${business.name} -> ${business.website}`);

            // Configurar timeout y abortar recursos pesados
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (['font', 'media'].includes(req.resourceType())) req.abort();
                else req.continue();
            });

            await page.goto(business.website, { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Scrape Content
            const scrapedData = await page.evaluate(() => {
                const getMeta = (name) => {
                    const el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
                    return el ? el.content : null;
                };

                const title = document.title;
                const description = getMeta('description') || getMeta('og:description') || '';
                const h1 = document.querySelector('h1') ? document.querySelector('h1').innerText : '';

                // Textos (P)
                const paragraphs = Array.from(document.querySelectorAll('p'))
                    .map(p => p.innerText.trim())
                    .filter(t => t.length > 50) // Solo párrafos sustanciales
                    .slice(0, 5); // Top 5

                // Headings para servicios (H2, H3)
                const headings = Array.from(document.querySelectorAll('h2, h3'))
                    .map(h => h.innerText.trim())
                    .filter(t => t.length > 5 && t.length < 50)
                    .slice(0, 8);

                // Imágenes
                const images = Array.from(document.querySelectorAll('img'))
                    .map(img => img.src)
                    .filter(src => src.startsWith('http'))
                    .filter(src => !src.includes('icon') && !src.includes('logo')) // Intentar evitar iconos pequeños
                    .slice(0, 10);

                return { title, description, h1, paragraphs, headings, images };
            });

            // Combinar datos
            const siteData = {
                name: business.name,
                originalUrl: business.website,
                category: business.category,
                ...scrapedData
            };

            // Fallback datos si el scraping falló parcialmente
            if (!siteData.h1) siteData.h1 = business.name;
            if (siteData.paragraphs.length === 0) siteData.paragraphs = ['Información detallada sobre nuestros servicios y compromiso con la calidad. Contáctenos para más detalles.'];
            if (siteData.headings.length === 0) siteData.headings = ['Calidad Garantizada', 'Atención Personalizada', 'Experiencia Profesional'];
            if (siteData.images.length === 0) siteData.images = []; // Usará placeholder

            // Hero Image Heurística: La primera imagen grande o una de fondo
            const heroImage = siteData.images.find(url => url.includes('unsplash') || url.includes('hero') || url.includes('banner')) || siteData.images[0] || null;
            siteData.heroImage = heroImage;

            // Generar HTML
            const htmlContent = generateHTML(siteData);
            fs.writeFileSync(path.join(businessDir, 'index.html'), htmlContent);

            // Guardar JSON de metadatos extraídos
            fs.writeFileSync(path.join(businessDir, 'data.json'), JSON.stringify(siteData, null, 2));

            return `[OK] ${business.name} -> Generada`;

        } catch (err) {
            return `[ERROR] ${business.name}: ${err.message}`;
        } finally {
            await page.close();
        }
    };

    // Loop con concurrencia
    for (let i = 0; i < targets.length; i += concurrency) {
        const batch = targets.slice(i, i + concurrency);
        const results = await Promise.all(batch.map(b => processBusiness(b)));
        results.forEach(r => console.log(r));
    }

    console.log('\n--- Generación completada. Revisa la carpeta "proyectos_renovados" ---');
    await browser.close();
}

runGenerator();
