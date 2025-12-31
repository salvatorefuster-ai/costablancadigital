
const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const HIGH_VALUE_CATEGORIES = [
    'inmobiliarias',
    'hoteles',
    'abogados',
    'asesores',
    'reformas',
    'clinicas',
    'dentistas',
    'clubes nocturnos',
    'discotecas',
    'hostales',
    'academias'
];

async function runAuditor() {
    console.log('--- Iniciando Auditoría Estratégica de Leads (High-Value Focus) ---');

    let businesses = [];
    try {
        businesses = JSON.parse(fs.readFileSync('negocios_benidorm_completo.json', 'utf8'));
    } catch (e) {
        console.error('Error: No se encuentra negocios_benidorm_completo.json');
        return;
    }

    // 1. Filtrar solo los que tienen web
    let targets = businesses.filter(b => b.website && b.website.startsWith('http'));

    // 2. Priorizar categorías de alto valor monetario
    targets = targets.sort((a, b) => {
        const aVal = HIGH_VALUE_CATEGORIES.includes(a.category.toLowerCase()) ? 1 : 0;
        const bVal = HIGH_VALUE_CATEGORIES.includes(b.category.toLowerCase()) ? 1 : 0;
        return bVal - aVal;
    });

    // Solo auditaremos los primeros X para ser eficientes y encontrar los mejores 100
    // Tomamos 300 para asegurar que encontramos 100 buenos con diseños antiguos
    const auditPool = targets.slice(0, 300);

    console.log(`Auditoría priorizada en ${auditPool.length} negocios de alto valor...`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-features=site-per-process']
    });

    const CONCURRENCY = 8;
    let auditedLeads = [];

    const processTarget = async (target) => {
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(15000);

        try {
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (['image', 'media', 'font', 'stylesheet'].includes(req.resourceType())) req.abort();
                else req.continue();
            });

            await page.goto(target.website, { waitUntil: 'domcontentloaded' });

            const analysis = await page.evaluate(() => {
                const text = document.body.innerText;
                const html = document.documentElement.innerHTML;

                const yearMatch = text.match(/©.*?20([0-2][0-9])/);
                let copyrightYear = yearMatch ? parseInt('20' + yearMatch[1]) : null;
                const emailMatch = html.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
                const emails = emailMatch ? [...new Set(emailMatch)] : [];
                const hasViewport = !!document.querySelector('meta[name="viewport"]');
                const isFlash = html.includes('swfobject') || html.includes('.swf');

                return { copyrightYear, emails, hasViewport, isFlash };
            });

            let urgencyScore = 0;
            if (!analysis.hasViewport) urgencyScore += 50;
            if (analysis.isFlash) urgencyScore += 100;
            if (analysis.copyrightYear && analysis.copyrightYear < 2021) {
                urgencyScore += (2021 - analysis.copyrightYear) * 15;
            }
            if (!target.website.includes('https')) urgencyScore += 25;

            return {
                ...target,
                audit: {
                    emails: analysis.emails,
                    copyright: analysis.copyrightYear || 'Desconocido',
                    mobileFriendly: analysis.hasViewport,
                    score: urgencyScore
                }
            };

        } catch (err) {
            return null;
        } finally {
            await page.close();
        }
    };

    for (let i = 0; i < auditPool.length; i += CONCURRENCY) {
        const batch = auditPool.slice(i, i + CONCURRENCY);
        const results = await Promise.all(batch.map(t => processTarget(t)));
        auditedLeads.push(...results.filter(r => r !== null));
        process.stdout.write(`Auditados: ${auditedLeads.length} / ${auditPool.length}\r`);
    }

    // Ordenar por Urgencia (Score Mayor -> Menor)
    // Pero también dar un pequeño empuje extra si es Inmobiliaria o Hotel
    auditedLeads.sort((a, b) => {
        let scoreA = a.audit.score;
        let scoreB = b.audit.score;
        if (['inmobiliarias', 'hoteles'].includes(a.category.toLowerCase())) scoreA += 30;
        if (['inmobiliarias', 'hoteles'].includes(b.category.toLowerCase())) scoreB += 30;
        return scoreB - scoreA;
    });

    fs.writeFileSync('leads_calificados.json', JSON.stringify(auditedLeads, null, 2));

    console.log('\n\n--- Auditoría Estratégica Finalizada ---');
    console.log(`Guardados ${auditedLeads.length} leads calificados.`);
    await browser.close();
}

runAuditor();
