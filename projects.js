async function loadProjects() {
  const response = await fetch("data/projects.json");
  if (!response.ok) throw new Error("Could not load projects");
  return response.json();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

function projectCard(project) {
  const image = project.media
    ? `<img class="project-cover-image" src="${escapeHtml(project.media)}" alt="${escapeHtml(project.title)}">`
    : `<span class="visual-note">MEDIA PLACEHOLDER</span>`;
  return `<a class="project-card" href="project.html?project=${encodeURIComponent(project.slug)}">
    <div class="project-visual">${image}</div>
    <div class="card-meta"><span>${escapeHtml(project.category)}</span><span>${escapeHtml(project.timeline)}</span></div>
    <h3>${escapeHtml(project.title)} <span>↗</span></h3>
    <p>${escapeHtml(project.description)}</p>
  </a>`;
}

async function renderProjectLists() {
  const projects = await loadProjects();
  const list = document.querySelector("#project-list");
  const featured = document.querySelector("#featured-project-list");
  if (list) list.innerHTML = projects.map(project => projectCard(project)).join("");
  if (featured) featured.innerHTML = projects.filter(project => project.featured).map(project => projectCard(project)).join("");
}

async function renderProjectDetail() {
  const detail = document.querySelector("#project-detail");
  if (!detail) return;
  const slug = new URLSearchParams(location.search).get("project");
  const projects = await loadProjects();
  const project = projects.find(item => item.slug === slug) || projects[0];
  if (!project) return;

  document.title = `${project.title} | Joseph B. Evans`;
  detail.innerHTML = `
    <section class="case-header project-case-header">
      <a class="text-link" href="projects.html">← Back to projects</a>
      <p class="page-label" style="margin-top:45px">${escapeHtml(project.category)}</p>
      <h1>${escapeHtml(project.title)}</h1>
      <p class="lede">${escapeHtml(project.overview)}</p>
      <div class="case-meta">
        <div><strong>Status</strong><span>${escapeHtml(project.status)}</span></div>
        <div><strong>Role</strong><span>${escapeHtml(project.role)}</span></div>
        <div><strong>Timeline</strong><span>${escapeHtml(project.timeline)}</span></div>
        <div><strong>Tools</strong><span>${escapeHtml(project.tools)}</span></div>
      </div>
    </section>
    ${project.media ? `<section class="project-case-media"><img class="project-cover-image" src="${escapeHtml(project.media)}" alt="${escapeHtml(project.title)}"></section>` : ""}
    ${renderGallery(project.gallery)}
    <section class="project-case-content"><div class="project-case-body">
      <section><h2>Technical details</h2><p>${escapeHtml(project.technical)}</p></section>
      <section><h2>Design decisions</h2><p>${escapeHtml(project.decisions)}</p></section>
      <section><h2>Challenges &amp; results</h2><p>${escapeHtml(project.challenges)}</p></section>
    </div></section>`;
}

function renderGallery(photos) {
  if (!Array.isArray(photos) || photos.length === 0) return "";
  const items = photos.map(photo => {
    const media = photo.type === "video"
      ? `<video controls preload="metadata" src="${escapeHtml(photo.src)}"${photo.poster ? ` poster="${escapeHtml(photo.poster)}"` : ""}></video>`
      : `<img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt || "")}" loading="lazy">`;
    return `
      <figure class="project-gallery-item">
        ${media}
        ${photo.caption ? `<figcaption>${escapeHtml(photo.caption)}</figcaption>` : ""}
      </figure>
    `;
  }).join("");
  return `<section class="project-gallery" aria-label="Project photo gallery">${items}</section>`;
}

renderProjectLists().catch(() => {
  const list = document.querySelector("#project-list");
  if (list) list.innerHTML = "<p>Projects could not be loaded.</p>";
});
renderProjectDetail().catch(() => {});
