const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");

if (menuBtn && drawer) {
  menuBtn.addEventListener("click", () => {
    const isOpen = drawer.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    drawer.setAttribute("aria-hidden", String(!isOpen));
  });

  drawer.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      drawer.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      drawer.setAttribute("aria-hidden", "true");
    });
  });
}

document.getElementById("year").textContent = new Date().getFullYear();

// Pull GitHub profile stats + latest repos
const GH_USER = "1DownLabs";

async function loadGitHub() {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GH_USER}`),
      fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=updated`)
    ]);

    if (!userRes.ok || !reposRes.ok) throw new Error("GitHub API error");

    const user = await userRes.json();
    const repos = await reposRes.json();

    // Stats
    document.getElementById("repoCount").textContent = user.public_repos ?? "—";
    document.getElementById("followerCount").textContent = user.followers ?? "—";

    // Sum stars
    const stars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    document.getElementById("starCount").textContent = stars;

    // Latest repos list (exclude the website repo)
    const filtered = repos
      .filter(r => r.name.toLowerCase() !== "1downlabs.com")
      .slice(0, 6);

    const repoList = document.getElementById("repoList");
    repoList.innerHTML = "";

    filtered.forEach(r => {
      const el = document.createElement("div");
      el.className = "repoItem";
      el.innerHTML = `
        <a href="${r.html_url}" target="_blank" rel="noreferrer">${r.name}</a>
        <div class="repoMeta">
          <span>★ ${r.stargazers_count || 0}</span>
          <span>Updated ${new Date(r.updated_at).toLocaleDateString()}</span>
          ${r.language ? `<span>${r.language}</span>` : ""}
        </div>
      `;
      repoList.appendChild(el);
    });

  } catch (e) {
    // Fail gracefully
    const repoList = document.getElementById("repoList");
    if (repoList) repoList.innerHTML = `<p class="muted">Could not load repos right now.</p>`;
  }
}

loadGitHub();
