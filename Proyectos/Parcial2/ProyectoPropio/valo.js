const API_AGENTS = 'https://valorant-api.com/v1/agents?isPlayableCharacter=true&language=es-MX';
const API_SKINS = 'https://valorant-api.com/v1/weapons/skins?language=es-MX';

const cargarTodo = async () => {
    try {
        const [resAgentes, resSkins] = await Promise.all([
            fetch(API_AGENTS).then(r => r.json()),
            fetch(API_SKINS).then(r => r.json())
        ]);

        const agentes = resAgentes.data;
        const skins = resSkins.data.filter(s => s.displayIcon).slice(0, 10);

        // 1. Carousel
        const randomAgentes = [...agentes].sort(() => 0.5 - Math.random()).slice(0, 4);
        renderCarousel(randomAgentes);

        // 2. Estandartes (TODOS los agentes)
        renderEstandartes(agentes);

        // 3. Skins
        renderSkins(skins);

    } catch (e) { 
        console.error("Error:", e); 
    }
};

const renderCarousel = (agentes) => {
    const container = document.getElementById('carousel-inner-agentes');
    if (!container) return;
    
    container.innerHTML = agentes.map((agente, i) => {
        const color = obtenerColorRol(agente.role?.displayName);
        return `
            <div class="carousel-item ${i === 0 ? 'active' : ''}">
                <div class="carousel-content" style="background: linear-gradient(135deg, ${color}11 0%, #0f1923 100%);">
                    <img src="${agente.fullPortrait}" class="carousel-agent-img" alt="${agente.displayName}">
                    <div class="carousel-info">
                        <h2 style="color: ${color}; font-size: 3rem;">${agente.displayName}</h2>
                        <span class="badge" style="background: ${color}">${agente.role?.displayName}</span>
                        <p class="mt-3" style="max-width: 400px;">${agente.description}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
};

const renderEstandartes = (agentes) => {
    const container = document.getElementById('estandartes-container');
    if (!container) return;

    container.innerHTML = agentes.map(agente => {
        const color = obtenerColorRol(agente.role?.displayName);
        return `
            <div class="estandarte-card" style="border-top-color: ${color}">
                <img src="${agente.fullPortrait}" class="estandarte-img">
                <div class="estandarte-info">
                    <h4 style="color:${color}">${agente.displayName}</h4>
                    <div class="detalle-oculto">
                        <strong>${agente.role?.displayName}</strong>
                        <p>${agente.description.substring(0, 40)}...</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
};

const renderSkins = (skins) => {
    const container = document.getElementById('skins-pila-container');
    if (!container) return;

    container.innerHTML = skins.map(skin => `
        <div class="skin-item">
            <div class="skin-img-container">
                <img src="${skin.displayIcon}">
            </div>
            <div class="skin-texto">
                <h3 style="color: #53b3cb;">${skin.displayName}</h3>
                <p>Colección Protocolo</p>
            </div>
        </div>
    `).join('');
};

const obtenerColorRol = (rol) => {
    const colores = {
        'Duelist': '#ff4655', 'Duelista': '#ff4655',
        'Initiator': '#5b3e96', 'Iniciador': '#5b3e96',
        'Controller': '#289609', 'Controlador': '#289609',
        'Sentinel': '#f0d848', 'Centinela': '#f0d848'
    };
    return colores[rol] || '#ffffff';
};

document.addEventListener('DOMContentLoaded', cargarTodo);