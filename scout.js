
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

async function scrollFeed(page, scrollableSelector) {
    try {
        await page.evaluate(async (selector) => {
            const wrapper = document.querySelector(selector);
            if (!wrapper) return;

            await new Promise((resolve) => {
                var totalHeight = 0;
                var distance = 2000; // Scroll rápido
                var noChangeCount = 0;
                var previousHeight = 0;

                var timer = setInterval(async () => {
                    var scrollHeight = wrapper.scrollHeight;
                    wrapper.scrollBy(0, distance);
                    totalHeight += distance;

                    if (scrollHeight === previousHeight) {
                        noChangeCount++;
                    } else {
                        noChangeCount = 0;
                        previousHeight = scrollHeight;
                    }

                    if (noChangeCount >= 5) {
                        clearInterval(timer);
                        resolve();
                    }
                    if (totalHeight > 50000) {
                        clearInterval(timer);
                        resolve();
                    }

                }, 800); // Frecuencia alta
            });
        }, scrollableSelector);
    } catch (e) {
        console.error("Error durante el scroll:", e.message);
    }
}

async function run() {
    console.log('Iniciando el explorador de negocios OPTIMIZADO ...');

    // Check for existing results to resume
    let allResults = [];
    if (fs.existsSync('negocios_benidorm_completo.json')) {
        try {
            allResults = JSON.parse(fs.readFileSync('negocios_benidorm_completo.json'));
            console.log(`Resumiendo sesión: ${allResults.length} negocios ya guardados.`);
        } catch (e) { }
    }

    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: null,
        args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox']
    });

    const queries = [
        // Hostelería y Turismo
        'hoteles en Benidorm', 'hostales en Benidorm', 'apartamentos turísticos en Benidorm', 'campings en Benidorm',
        'agencias de viajes en Benidorm',

        // Restauración y Ocio
        'restaurantes en Benidorm', 'cafeterías en Benidorm', 'bares en Benidorm', 'pubs en Benidorm',
        'discotecas en Benidorm', 'clubes nocturnos en Benidorm', 'heladerías en Benidorm', 'panaderías en Benidorm',
        'comida rápida en Benidorm', 'pizzerías en Benidorm',

        // Servicios Profesionales
        'asesorías en Benidorm', 'gestorías en Benidorm', 'abogados en Benidorm', 'notarios en Benidorm',
        'arquitectos en Benidorm', 'seguros en Benidorm', 'inmobiliarias en Benidorm', 'administradores de fincas en Benidorm',
        'publicidad y marketing en Benidorm', 'imprentas en Benidorm', 'coworking en Benidorm',

        // Salud y Belleza
        'peluquerías en Benidorm', 'barberías en Benidorm', 'centros de estética en Benidorm', 'salones de uñas en Benidorm',
        'tatuadores en Benidorm', 'gimnasios en Benidorm', 'centros de yoga en Benidorm', 'spas en Benidorm',
        'dentistas en Benidorm', 'clínicas dentales en Benidorm', 'fisioterapeutas en Benidorm', 'centros médicos en Benidorm',
        'farmacias en Benidorm', 'veterinarios en Benidorm', 'psicólogos en Benidorm',

        // Comercios y Tiendas
        'tiendas de ropa en Benidorm', 'zapaterías en Benidorm', 'joyerías en Benidorm', 'tiendas de deportes en Benidorm',
        'tiendas de electrónica en Benidorm', 'tiendas de informática en Benidorm', 'tiendas de móviles en Benidorm',
        'supermercados en Benidorm', 'fruterías en Benidorm', 'carnicerías en Benidorm', 'estancos en Benidorm',
        'tiendas de souvenirs en Benidorm', 'floristerías en Benidorm', 'mueblerías en Benidorm', 'ferreterías en Benidorm',
        'tiendas de animales en Benidorm',

        // Oficios y Reparaciones
        'talleres mecánicos en Benidorm', 'alquiler de coches en Benidorm', 'lavaderos de coches en Benidorm',
        'fontaneros en Benidorm', 'electricistas en Benidorm', 'cerrajeros en Benidorm', 'reformas en Benidorm',
        'pintores en Benidorm', 'carpinteros en Benidorm', 'empresas de limpieza en Benidorm',

        // Otros
        'academias en Benidorm', 'guarderías en Benidorm', 'bingos en Benidorm', 'casinos en Benidorm'
    ];

    const page = await browser.newPage();

    for (const query of queries) {
        console.log(`\n>>> Buscando categoría: ${query} <<<`);

        try {
            await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, { waitUntil: 'networkidle2', timeout: 60000 });

            try {
                const acceptCookiesSelector = 'form[action*="consent"] button, button[aria-label="Aceptar todo"]';
                const button = await page.$(acceptCookiesSelector);
                if (button) {
                    await button.click();
                    await new Promise(r => setTimeout(r, 2000));
                }
            } catch (e) { }

            const feedSelector = 'div[role="feed"]';
            try {
                await page.waitForSelector(feedSelector, { timeout: 5000 });
            } catch (e) {
                console.log(`[!] No se encontró lista para "${query}".`);
                continue;
            }

            console.log('   -> Cargando resultados (Fast Scroll)...');
            await scrollFeed(page, feedSelector);

            console.log('   -> Extrayendo lista básica...');
            const places = await page.evaluate(() => {
                const items = Array.from(document.querySelectorAll('div[role="article"]'));
                return items.map(item => {
                    const link = item.querySelector('a');
                    const url = link ? link.href : '';
                    const textContent = item.innerText.split('\n');
                    const name = item.ariaLabel || textContent[0] || 'Sin nombre';
                    return { name, googleMapsUrl: url };
                });
            });

            const newPlaces = places.filter(p => !allResults.some(existing => existing.googleMapsUrl === p.googleMapsUrl));
            console.log(`   -> Encontrados ${places.length} totales. ${newPlaces.length} son nuevos.`);

            if (newPlaces.length === 0) continue;

            console.log(`   -> Analizando webs con TURBO (5x concurrencia, sin imágenes)...`);

            const CONCURRENCY = 5;
            const processBatch = async (batch) => {
                const promises = batch.map(async (place) => {
                    if (!place.googleMapsUrl) return null;
                    const detailPage = await browser.newPage();
                    try {
                        await detailPage.setRequestInterception(true);
                        detailPage.on('request', (req) => {
                            const type = req.resourceType();
                            if (['image', 'stylesheet', 'font', 'media'].includes(type)) req.abort();
                            else req.continue();
                        });

                        await detailPage.goto(place.googleMapsUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

                        const websiteSelector = 'a[data-item-id="authority"]';
                        let website = 'No detectada';
                        try {
                            await detailPage.waitForSelector(websiteSelector, { timeout: 1000 }); // Timeout corto
                            website = await detailPage.$eval(websiteSelector, el => el.href);
                        } catch (e) { }

                        return {
                            category: query.replace(' en Benidorm', ''),
                            name: place.name,
                            googleMapsUrl: place.googleMapsUrl,
                            website: website
                        };
                    } catch (err) {
                        return null;
                    } finally {
                        await detailPage.close();
                    }
                });
                return Promise.all(promises);
            };

            for (let i = 0; i < newPlaces.length; i += CONCURRENCY) {
                const batch = newPlaces.slice(i, i + CONCURRENCY);
                const batchResults = await processBatch(batch);
                const validResults = batchResults.filter(r => r !== null);

                allResults.push(...validResults);
                fs.writeFileSync('negocios_benidorm_completo.json', JSON.stringify(allResults, null, 2));

                process.stdout.write(`+${validResults.length} `);
            }
            console.log('\n   -> Categoría finalizada.');

        } catch (err) {
            console.error(`Status: ${err.message}`);
        }
    }

    const sinWeb = allResults.filter(r => r.website === 'No detectada');
    console.log('\n===========================================');
    console.log(`ANÁLISIS COMPLETADO`);
    console.log(`Total negocios: ${allResults.length}`);
    console.log(`Sin web: ${sinWeb.length}`);
    console.log('===========================================');

    await browser.close();
}

run();
