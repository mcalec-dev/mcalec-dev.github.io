const config = {
  name: 'mcalec-dev', // GitHub username or organization name
  type: 'org'        // 'org' for organization, 'user' for user
};
let allRepos = [];
async function fetchData() {
  try {
    const endpoint = config.type === 'org' 
      ? `https://api.github.com/orgs/${config.name}`
      : `https://api.github.com/users/${config.name}`;
      
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('Failed to fetch data');
    const data = await response.json();
    document.getElementById('profile-img').src = data.avatar_url;
    document.getElementById('username').textContent = data.name || data.login;
    if (config.type === 'org') {
      const orgDesc = `
        <p>
          ${data.description || 'No description available'}
        </p>
      `;
      document.getElementById('org-desc').innerHTML = orgDesc;
      const statsHtml = `
        <div class="org-stat">
          <span>👥 ${data.followers || 0} Followers</span>
        </div>
        <div class="org-stat">
          <span></span>
        </div>
        <div class="org-stat">
          <span>📦 ${data.public_repos || 0} Repositories</span>
        </div>
      `;
      document.getElementById('org-stats').innerHTML = statsHtml;
    }
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    document.getElementById('repos').innerHTML = '<div class="error">Failed to load data</div>';
  }
}
async function fetchRepos() {
  try {
    const endpoint = config.type === 'org'
      ? `https://api.github.com/orgs/${config.name}/repos?sort=updated&per_page=100`
      : `https://api.github.com/users/${config.name}/repos?sort=updated&per_page=100`;
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('Failed to fetch repositories');
    allRepos = await response.json();
    displayRepos(allRepos);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    document.getElementById('repos').innerHTML = '<div class="error">Failed to load repositories</div>';
  }
}
function displayRepos(repos) {
  document.getElementById('repos').innerHTML = repos
    .map(repo => `
      <div class="repo-card">
        <a href="${repo.html_url}" class="repo-name" target="_blank">
          ${repo.name}
        </a>
        <p class="repo-desc">
          ${repo.description || 'No description available'}
        </p>
        <div class="repo-stats">
          <span>⭐ ${repo.stargazers_count}</span>
          <span>🔄 ${repo.forks_count}</span>
          <span>💻 ${repo.language || 'No language'}</span>
          <span>📅 ${new Date(repo.updated_at).toLocaleDateString()}</span>
        </div>
      </div>
    `)
    .join('');
}

function filterAndSortRepos() {
  const searchTerm = document.getElementById('search').value.toLowerCase();
  const sortBy = document.getElementById('sort').value;
  let filteredRepos = allRepos.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm))
  );
  filteredRepos.sort((a, b) => {
    switch (sortBy) {
      case 'stars':
        return b.stargazers_count - a.stargazers_count;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'updated':
        return new Date(b.updated_at) - new Date(a.updated_at);
      default:
        return 0;
    }
  });
  displayRepos(filteredRepos);
}
document.getElementById('search').addEventListener('input', filterAndSortRepos);
document.getElementById('sort').addEventListener('change', filterAndSortRepos);
fetchData().then(() => fetchRepos());