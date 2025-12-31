
const fs = require('fs');

function createDeploymentPackage() {
    console.log('--- Generando Paquete de Ventas (Emails + Demos) ---');

    let leads = [];
    try {
        // En un caso real usaríamos el output del auditor completo. 
        // Como hemos interrumpido el proceso grande, usaremos los datos parciales o el listado existente simulado.
        if (fs.existsSync('leads_calificados.json')) {
            leads = JSON.parse(fs.readFileSync('leads_calificados.json', 'utf8'));
        } else {
            // Fallback a los datos brutos si no terminó el auditor, asumiendo todos como leads
            const raw = JSON.parse(fs.readFileSync('negocios_benidorm_completo.json', 'utf8'));
            leads = raw.filter(b => b.website && b.website.startsWith('http')).map(b => ({
                ...b,
                audit: { email: [], score: 10 } // Score default
            }));
        }
    } catch (e) {
        console.error('Error cargando leads.');
        return;
    }

    // Top 200 (o los que tengamos)
    const topLeads = leads.slice(0, 200);
    console.log(`Procesando Top ${topLeads.length} leads...`);

    const outputBase = 'campana_ventas';
    if (!fs.existsSync(outputBase)) fs.mkdirSync(outputBase);

    let csvContent = "Nombre,Website,Email,Score,Link_Demo_Local\n";

    topLeads.forEach(lead => {
        // 1. Limpieza de nombre
        const safeName = lead.name.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40);

        // 2. Determinar Email (Simulado si no encontró el auditor)
        const email = (lead.audit && lead.audit.emails && lead.audit.emails.length > 0)
            ? lead.audit.emails[0]
            : "info@" + new URL(lead.website).hostname.replace('www.', '');

        // 3. Redactar Email Personalizado
        const emailBody = `
Asunto: Propuesta de modernización para ${lead.name}

Hola,

Le escribo porque hemos analizado su sitio web (${lead.website}) y hemos detectado que tiene un gran potencial no explotado.

Actualmente, su web tiene algunas tecnologías que podrían estar afectando su visibilidad en Google y la experiencia de sus clientes en móviles.

Hemos tomado la iniciativa de diseñar una DEMO PRELIMINAR de cómo podría verse su negocio con una tecnología moderna (versión 2025).

Puede ver su demo aquí: [INSERTAR LINK DE RENDER AQUÍ TRAS DESPLIEGUE]

Nos encantaría comentarle cómo esto puede aumentar sus reservas/ventas.

Un saludo,
Salvatore Fuster AI
        `;

        // 4. Guardar en carpeta del cliente
        const clientDir = `${outputBase}/${safeName}`;
        if (!fs.existsSync(clientDir)) fs.mkdirSync(clientDir);

        fs.writeFileSync(`${clientDir}/borrador_email.txt`, emailBody);

        // Agregar a CSV resumen
        csvContent += `"${lead.name}","${lead.website}","${email}",${lead.audit ? lead.audit.score : 'N/A'},"./${safeName}/index.html"\n`;
    });

    fs.writeFileSync('resumen_ventas.csv', csvContent);
    console.log('Generado resumen_ventas.csv y borradores de email.');
}

createDeploymentPackage();
