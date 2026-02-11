// Usuario de GitHub
const GITHUB_USER = 'A-20-fpsATF15';

// Función para cargar estadísticas del perfil
const cargarEstadisticas = () => {
    const loading = document.getElementById('loading-stats');
    const statsContent = document.getElementById('stats-content');
    
    fetch(`https://api.github.com/users/${GITHUB_USER}`)
        .then(res => res.json())
        .then(data => {
            console.log('Datos del perfil recibidos:', data);
            
            loading.style.display = 'none';
            statsContent.style.display = 'grid';
            
            document.getElementById('repos-count').textContent = data.public_repos;
            document.getElementById('followers-count').textContent = data.followers;
            document.getElementById('following-count').textContent = data.following;
            
            // Calcular total de estrellas
            calcularEstrellas();
        })
        .catch(error => {
            console.error('Error al cargar estadísticas:', error);
            loading.textContent = '❌ Error al cargar estadísticas';
        });
};

// Función para calcular total de estrellas
const calcularEstrellas = () => {
    fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`)
        .then(res => res.json())
        .then(repos => {
            const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
            document.getElementById('stars-count').textContent = totalStars;
        })
        .catch(error => {
            console.error('Error al calcular estrellas:', error);
            document.getElementById('stars-count').textContent = '0';
        });
};

// Función para cargar repositorios
const cargarRepositorios = () => {
    const contenedorProyectos = document.getElementById('projects-grid');
    const loading = document.getElementById('loading-repos');
    
    loading.style.display = 'block';
    contenedorProyectos.innerHTML = '';
    
    const url = `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&direction=desc&per_page=6&type=owner`;
    
    fetch(url)
        .then(respuesta => respuesta.json())
        .then(repos => {
            console.log('Repositorios recibidos:', repos);
            
            loading.style.display = 'none';
            
            if (repos.length === 0) {
                contenedorProyectos.innerHTML = '<p class="no-results">❌ No se encontraron repositorios</p>';
                return;
            }
            
            mostrarRepositorios(repos);
        })
        .catch(error => {
            console.error('Error al cargar repositorios:', error);
            loading.textContent = '❌ Error al cargar proyectos';
        });
};

// Función para mostrar repositorios en el DOM
const mostrarRepositorios = (repos) => {
    const contenedorProyectos = document.getElementById('projects-grid');
    contenedorProyectos.innerHTML = '';
    
    repos.forEach(repo => {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('project-card');
        tarjeta.onclick = () => window.open(repo.html_url, '_blank');
        
        // Obtener color del lenguaje
        const languageColor = obtenerColorLenguaje(repo.language);
        
        // Badge de estrellas si tiene más de 0
        const starsBadge = repo.stargazers_count > 0 ? 
            `<span class="stars-badge">⭐ ${repo.stargazers_count} estrellas</span>` : '';
        
        // Formatear fecha de última actualización
        const fechaActualizacion = new Date(repo.updated_at).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        tarjeta.innerHTML = `
            ${starsBadge}
            <div class="project-header">
                <span class="project-icon">📁</span>
                <h3 class="project-title">${repo.name}</h3>
            </div>
            
            <p class="project-description">${repo.description || 'Sin descripción disponible'}</p>
            
            <div class="project-meta">
                ${repo.language ? `
                    <span class="language-badge">
                        <span class="language-dot" style="background-color: ${languageColor}"></span>
                        ${repo.language}
                    </span>
                ` : ''}
                
                <span class="update-date">📅 ${fechaActualizacion}</span>
            </div>
            
            <div class="project-stats">
                <span class="stat-item">⭐ ${repo.stargazers_count}</span>
                <span class="stat-item">🔱 ${repo.forks_count}</span>
                <span class="stat-item">👁️ ${repo.watchers_count}</span>
            </div>
        `;
        
        contenedorProyectos.appendChild(tarjeta);
    });
};

// Función para cargar seguidores
const cargarSeguidores = () => {
    const loading = document.getElementById('loading-followers');
    const lista = document.getElementById('followers-list');
    
    fetch(`https://api.github.com/users/${GITHUB_USER}/followers?per_page=5`)
        .then(respuesta => respuesta.json())
        .then(seguidores => {
            console.log('Seguidores recibidos:', seguidores);
            
            loading.style.display = 'none';
            
            if (seguidores.length === 0) {
                lista.innerHTML = '<p style="color: #888;">Sin seguidores aún</p>';
                return;
            }
            
            mostrarSeguidores(seguidores);
        })
        .catch(error => {
            console.error('Error al cargar seguidores:', error);
            loading.textContent = '❌ Error';
        });
};

// Función para mostrar seguidores en el DOM
const mostrarSeguidores = (seguidores) => {
    const lista = document.getElementById('followers-list');
    lista.innerHTML = '';
    
    seguidores.forEach(seguidor => {
        const followerDiv = document.createElement('div');
        followerDiv.classList.add('follower');
        
        followerDiv.innerHTML = `
            <a href="${seguidor.html_url}" target="_blank">
                <img src="${seguidor.avatar_url}" alt="${seguidor.login}">
            </a>
            <span class="follower-tooltip">${seguidor.login}</span>
        `;
        
        lista.appendChild(followerDiv);
    });
};

// Función para obtener colores de lenguajes de programación
const obtenerColorLenguaje = (lenguaje) => {
    const colores = {
        'JavaScript': '#f1e05a',
        'Python': '#3572A5',
        'Java': '#b07219',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'TypeScript': '#2b7489',
        'C++': '#f34b7d',
        'C': '#555555',
        'PHP': '#4F5D95',
        'Ruby': '#701516',
        'Go': '#00ADD8',
        'Swift': '#ffac45',
        'Kotlin': '#F18E33',
        'Rust': '#dea584'
    };
    
    return colores[lenguaje] || '#888';
};

// Iniciar cuando carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando carga de datos...');
    cargarEstadisticas();
    cargarRepositorios();
    cargarSeguidores();
});