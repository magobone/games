const games = Array.isArray(window.PLAYSTATION_GAMES) ? window.PLAYSTATION_GAMES : [];

const state = {
  query: "",
  localPlayers: "",
  genre: ""
};

const elements = {
  search: document.querySelector("#searchInput"),
  localPlayers: document.querySelector("#playersFilter"),
  genre: document.querySelector("#genreFilter"),
  clear: document.querySelector("#clearFilters"),
  grid: document.querySelector("#gamesGrid"),
  empty: document.querySelector("#emptyState"),
  summary: document.querySelector("#resultSummary"),
  visibleCount: document.querySelector("#visibleCount"),
  modal: document.querySelector("#imageModal"),
  modalImage: document.querySelector("#modalImage"),
  modalCaption: document.querySelector("#modalCaption"),
  modalClose: document.querySelector("#modalClose")
};

function normalize(value) {
  return String(value || "")
    .toLocaleLowerCase("it")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function createOption(value) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  return option;
}

function populateGenres() {
  const genres = [...new Set(games.map((game) => game.genre || "N.A."))]
    .sort((a, b) => a.localeCompare(b, "it", { sensitivity: "base" }));

  genres.forEach((genre) => {
    elements.genre.appendChild(createOption(genre));
  });
}

function matchesFilters(game) {
  const query = normalize(state.query);
  const title = normalize(game.title);
  const matchesName = !query || title.includes(query);
  const matchesPlayers = !state.localPlayers || game.localPlayers === state.localPlayers;
  const matchesGenre = !state.genre || game.genre === state.genre;

  return matchesName && matchesPlayers && matchesGenre;
}

function localClass(value) {
  if (value === "SI") return "local-si";
  if (value === "NO") return "local-no";
  return "";
}

function imageMarkup(game) {
  if (!game.cover) {
    return `<div class="cover-fallback">${escapeHtml(game.title)}</div>`;
  }

  return `
    <button class="image-button" type="button" data-image-src="${escapeAttribute(game.cover)}" data-image-title="${escapeAttribute(game.title)}">
      <img src="${escapeAttribute(game.cover)}" alt="${escapeAttribute(game.title)}" loading="lazy">
    </button>
  `;
}

function screenshotsMarkup(game) {
  if (!Array.isArray(game.screenshots) || game.screenshots.length === 0) {
    return "";
  }

  return `
    <div class="screenshot-strip" aria-label="Immagini dal gioco">
      ${game.screenshots
        .slice(0, 3)
        .map((src, index) => {
          const title = `${game.title} screenshot ${index + 1}`;
          return `
            <button class="image-button" type="button" data-image-src="${escapeAttribute(src)}" data-image-title="${escapeAttribute(title)}">
              <img src="${escapeAttribute(src)}" alt="${escapeAttribute(title)}" loading="lazy">
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function linksMarkup(game) {
  const gameplay = game.gameplay
    ? `<a href="${escapeAttribute(game.gameplay.url)}" target="_blank" rel="noopener">Gameplay</a>`
    : `<span>Gameplay N.A.</span>`;
  const store = game.storeUrl
    ? `<a class="secondary" href="${escapeAttribute(game.storeUrl)}" target="_blank" rel="noopener">Store</a>`
    : "";

  return `<div class="links">${gameplay}${store}</div>`;
}

function cardMarkup(game) {
  return `
    <article class="game-card">
      <div class="cover-wrap">
        ${imageMarkup(game)}
      </div>
      <div class="card-body">
        <h2>${escapeHtml(game.title)}</h2>
        <div class="meta-row">
          <span class="pill">${escapeHtml(game.genre || "N.A.")}</span>
          <span class="pill ${localClass(game.localPlayers)}">Locale 2: ${escapeHtml(game.localPlayers || "N.A.")}</span>
        </div>
        <p class="description">${escapeHtml(game.description || "Descrizione non disponibile.")}</p>
        ${screenshotsMarkup(game)}
        ${linksMarkup(game)}
      </div>
    </article>
  `;
}

function render() {
  const filtered = games.filter(matchesFilters);
  elements.visibleCount.textContent = String(filtered.length);
  elements.summary.textContent = `${filtered.length} risultati su ${games.length} giochi`;
  elements.empty.hidden = filtered.length !== 0;
  elements.grid.innerHTML = filtered.map(cardMarkup).join("");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function openImageModal(src, title) {
  elements.modalImage.src = src;
  elements.modalImage.alt = title || "Immagine gioco";
  elements.modalCaption.textContent = title || "";
  elements.modal.classList.add("is-open");
  elements.modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  elements.modalClose.focus();
}

function closeImageModal() {
  elements.modal.classList.remove("is-open");
  elements.modal.setAttribute("aria-hidden", "true");
  elements.modalImage.removeAttribute("src");
  document.body.style.overflow = "";
}

function bindEvents() {
  elements.search.addEventListener("input", (event) => {
    state.query = event.target.value;
    render();
  });

  elements.localPlayers.addEventListener("change", (event) => {
    state.localPlayers = event.target.value;
    render();
  });

  elements.genre.addEventListener("change", (event) => {
    state.genre = event.target.value;
    render();
  });

  elements.clear.addEventListener("click", () => {
    state.query = "";
    state.localPlayers = "";
    state.genre = "";
    elements.search.value = "";
    elements.localPlayers.value = "";
    elements.genre.value = "";
    render();
  });

  elements.grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-image-src]");
    if (!button) return;
    openImageModal(button.dataset.imageSrc, button.dataset.imageTitle);
  });

  elements.modalClose.addEventListener("click", closeImageModal);

  elements.modal.addEventListener("click", (event) => {
    if (event.target === elements.modal) {
      closeImageModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.modal.classList.contains("is-open")) {
      closeImageModal();
    }
  });
}

populateGenres();
bindEvents();
render();
