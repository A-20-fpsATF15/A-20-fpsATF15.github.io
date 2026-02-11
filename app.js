const GITHUB_USER = 'A-20-fpsATF15';

// Cargar estadísticas del perfil
const cargarEstadisticas = () => {
    const loading = document.getElementById('loading-stats');
    const statsContent = document.getElementById('stats-content');
    
    fetch(`https://api.github.com/users/${GITHUB_USER}`)
        .then(res => res.json())
        .then(data => {
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

// Calcular total de estrellas en todos los repos
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

// Cargar repositorios (los 6 más recientes)
const cargarRepositorios = () => {
    const loading = document.getElementById('loading-repos');
    const grid = document.getElementById('projects-grid');
    const noRepos = document.getElementById('no-repos');
    
    const url = `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&direction=desc&per_page=6&type=owner`;
    
    fetch(url)
        .then(res => res.json())
        .then(repos => {
            loading.style.display = 'none';
            
            if (repos.length === 0) {
                noRepos.style.display = 'block';
                return;
            }
            
            repos.forEach(repo => {
                const card = document.createElement('div');
                card.className = 'project-card';
                card.onclick = () => window.open(repo.html_url, '_blank');
                
                const languageColor = getLanguageColor(repo.language);
                
                card.innerHTML = `
                    <div class="project-header">
                        <span class="project-icon">📁</span>
                        <a href="${repo.html_url}" target="_blank" class="project-name" onclick="event.stopPropagation()">
                            ${repo.name}
                        </a>
                    </div>
                    <p class="project-description">
                        ${repo.description || 'Sin descripción disponible'}
                    </p>
                    <div class="project-footer">
                        ${repo.language ? `
                            <span class="language">
                                <span class="language-dot" style="background-color: ${languageColor}"></span>
                                ${repo.language}
                            </span>
                        ` : ''}
                        <span>⭐ ${repo.stargazers_count}</span>
                        <span>🔱 ${repo.forks_count}</span>
                    </div>
                `;
                
                grid.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error al cargar repositorios:', error);
            loading.textContent = '❌ Error al cargar proyectos';
        });
};

// Cargar primeros 5 seguidores
const cargarSeguidores = () => {
    const loading = document.getElementById('loading-followers');
    const list = document.getElementById('followers-list');
    
    fetch(`https://api.github.com/users/${GITHUB_USER}/followers?per_page=5`)
        .then(res => res.json())
        .then(followers => {
            loading.style.display = 'none';
            
            if (followers.length === 0) {
                list.innerHTML = '<p style="color: #888;">Sin seguidores aún</p>';
                return;
            }
            
            followers.forEach(follower => {
                const followerDiv = document.createElement('div');
                followerDiv.className = 'follower';
                
                followerDiv.innerHTML = `
                    <a href="${follower.html_url}" target="_blank">
                        <img src="${follower.avatar_url}" alt="${follower.login}">
                    </a>
                    <span class="follower-tooltip">${follower.login}</span>
                `;
                
                list.appendChild(followerDiv);
            });
        })
        .catch(error => {
            console.error('Error al cargar seguidores:', error);
            loading.textContent = '❌ Error';
        });
};

// Colores para lenguajes de programación
const getLanguageColor = (language) => {
    const colors = {
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
    
    return colors[language] || '#888';
};

// Iniciar cuando carga la página
document.addEventListener('DOMContentLoaded', () => {
    cargarEstadisticas();
    cargarRepositorios();
    cargarSeguidores();
});