
const fs = require('fs');
const path = require('path');

const VIP_DIR = path.join(__dirname, 'proyectos_vip');

const generateDashboard = () => {
    const folders = fs.readdirSync(VIP_DIR).filter(f => fs.lstatSync(path.join(VIP_DIR, f)).isDirectory());

    const projects = folders.map(f => {
        const dataPath = path.join(VIP_DIR, f, 'data.json');
        if (fs.existsSync(dataPath)) {
            return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }
        return { name: f.replace(/_/g, ' '), slug: f };
    });

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>VIP Hub | Agencia Costa Digital</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;700&display=swap" rel="stylesheet">
    <style>
        body { background: #020202; color: white; font-family: 'Outfit', sans-serif; }
        .vip-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .vip-card:hover { border-color: #d5a150; transform: translateY(-10px); background: rgba(213, 161, 80, 0.05); }
        .gold-glow { box-shadow: 0 0 50px rgba(213, 161, 80, 0.1); }
    </style>
</head>
<body class="p-10 md:p-20">
    <header class="max-w-7xl mx-auto mb-20 text-center">
        <div class="inline-block px-4 py-1 rounded-full border border-gold-400/20 text-gold-400 text-[10px] uppercase font-bold tracking-[0.3em] mb-6">Selección Elite</div>
        <h1 class="text-6xl md:text-8xl font-bold tracking-tighter mb-6">The <span class="text-gold-400">Chosen</span> 20.</h1>
        <p class="text-gray-500 text-xl max-w-2xl mx-auto font-light">Hemos seleccionado a los 20 líderes del mercado para una transformación total. Webs completas listas para despliegue inmediato.</p>
    </header>

    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${projects.map(p => {
        const slug = p.name.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 50);
        return `
            <div class="vip-card rounded-[40px] p-10 flex flex-col justify-between group">
                <div>
                   <div class="w-12 h-12 rounded-full bg-gold-400 flex items-center justify-center text-black font-black mb-8 group-hover:scale-110 transition">V</div>
                   <h2 class="text-3xl font-bold mb-4 tracking-tight">${p.name}</h2>
                   <div class="text-xs text-gold-400/50 uppercase font-black tracking-widest mb-6">${p.category || 'Lead Premium'}</div>
                   <p class="text-gray-500 text-sm mb-10 font-light line-clamp-3 italic">"${p.description || 'Elevando el estándar digital de Benidorm.'}"</p>
                </div>
                <a href="./${slug}/index.html" class="inline-block w-full text-center py-5 rounded-full bg-white text-black font-bold uppercase tracking-widest text-[10px] hover:bg-gold-400 transition transform">
                    Ver Web Completa
                </a>
            </div>
            `;
    }).join('')}
    </div>

    <footer class="mt-40 text-center border-t border-white/5 pt-20">
        <div class="text-[10px] text-gray-700 uppercase font-bold tracking-[0.5em]">Agencia Costa Digital &bull; Proyecto Scout 2025</div>
    </footer>
</body>
</html>
    `;
    fs.writeFileSync(path.join(VIP_DIR, 'index.html'), html);
    console.log('Dashboard VIP generado en proyectos_vip/index.html');
};

generateDashboard();
