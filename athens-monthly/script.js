const eventsEl = document.getElementById("events");
const countEl = document.getElementById("count");
const sortEl = document.getElementById("sort");
const musicParent = document.getElementById("music-parent");
const genreBoxes = document.querySelectorAll('input[name="genre"]');

const labels = { solo: "Solo / Friends", friends: "Solo / Friends", date: "Date Night", family: "Family" };

// Solo and friends events share one filter box.
const audienceKey = a => (a === "friends" ? "solo" : a);

const modal = document.getElementById("modal");
const photoEl = document.getElementById("modal-photo");
const bodyEl = document.getElementById("modal-body");

// Optional per-event fields: image (path/URL), description, price.
function openModal(e, tags) {
    photoEl.replaceChildren();
    photoEl.className = "";
    if (e.image) {
        const img = document.createElement("img");
        img.src = e.image;
        img.alt = e.title;
        photoEl.appendChild(img);
    } else {
        photoEl.className = `placeholder ${e.category}`;
        photoEl.textContent = e.title;
    }

    const h2 = document.createElement("h2");
    h2.textContent = e.title;
    const rows = [
        ["When", `${formatDate(e.date)} at ${e.time}`],
        ["Where", `${e.venue}, Athens, GA`],
        ["Price", e.price || "See venue for ticket info"]
    ];
    const dl = document.createElement("dl");
    for (const [k, v] of rows) {
        const dt = document.createElement("dt");
        dt.textContent = k;
        const dd = document.createElement("dd");
        dd.textContent = v;
        dl.append(dt, dd);
    }
    const desc = document.createElement("p");
    desc.textContent = e.description ||
        `${e.local ? "A local Athens event" : "A visiting event"} at ${e.venue}. Details coming soon.`;
    const tagBox = document.createElement("div");
    for (const [text, group] of tags) {
        const s = document.createElement("span");
        s.className = group;
        s.textContent = text;
        tagBox.appendChild(s);
    }
    bodyEl.replaceChildren(h2, dl, desc, tagBox);
    modal.showModal();
}

document.getElementById("modal-close").addEventListener("click", () => modal.close());
// Clicking the backdrop closes the dialog.
modal.addEventListener("click", ev => {
    if (ev.target === modal) modal.close();
});

function checked(name) {
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(i => i.value);
}

function searchText(e) {
    const d = new Date(e.date + "T00:00:00");
    const long = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    const short = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const numeric = `${d.getMonth() + 1}/${d.getDate()}`;
    return `${e.title} ${e.venue} ${long} ${short} ${numeric} ${e.date} ${e.time}`.toLowerCase();
}

function matches(e, f) {
    if (f.query && !searchText(e).includes(f.query)) return false;
    if (f.local.length && !f.local.includes(e.local ? "local" : "visiting")) return false;
    if (f.audience.length && !f.audience.includes(audienceKey(e.audience))) return false;

    // Category filter: a checked genre narrows music; other categories match directly.
    const picked = new Set(f.category);
    if (f.genre.length) picked.add("music");
    if (picked.size && !picked.has(e.category)) return false;
    if (e.category === "music" && f.genre.length && !f.genre.includes(e.genre)) return false;
    return true;
}

function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function render() {
    const f = {
        local: checked("local"),
        audience: checked("audience"),
        category: checked("category"),
        genre: checked("genre"),
        query: document.getElementById("search").value.trim().toLowerCase()
    };

    const list = events.filter(e => matches(e, f));
    const key = sortEl.value;
    list.sort((a, b) => key === "date"
        ? a.date.localeCompare(b.date) || a.title.localeCompare(b.title)
        : a[key].localeCompare(b[key]));

    countEl.textContent = `${list.length} of ${events.length} events`;
    eventsEl.innerHTML = list.length ? "" : "<p>No events match these filters.</p>";

    for (const e of list) {
        const card = document.createElement("article");
        card.className = "card";

        const tags = [
            [e.local ? "Athens Local" : "Visiting", "locals"],
            [labels[e.audience], "type"],
            [e.category, "event"]
        ];
        if (e.genre) tags.push([e.genre, "event"]);

        const h3 = document.createElement("h3");
        h3.textContent = e.title;
        const when = document.createElement("p");
        when.className = "when";
        const [day, time] = [formatDate(e.date).replace(",", ""), e.time];
        const dayEl = document.createElement("span");
        dayEl.textContent = day;
        const timeEl = document.createElement("span");
        timeEl.textContent = time;
        when.append(dayEl, timeEl);
        const where = document.createElement("p");
        where.className = "where";
        where.textContent = e.venue;

        // Three boxes: locals, type of event, event (with genre).
        const chips = [tags[0], tags[1], [e.genre ? `${e.category} · ${e.genre}` : e.category, "event"]];
        const tagBox = document.createElement("div");
        tagBox.className = "chips";
        for (const [text, group] of chips) {
            const s = document.createElement("div");
            s.className = `chip ${group}`;
            s.textContent = text;
            tagBox.appendChild(s);
        }
        const inner = document.createElement("div");
        inner.className = "card-inner";
        inner.append(h3, when, where, tagBox);
        card.append(inner);
        card.tabIndex = 0;
        card.addEventListener("click", () => openModal(e, tags));
        card.addEventListener("keydown", ev => {
            if (ev.key === "Enter") openModal(e, tags);
        });
        eventsEl.appendChild(card);
    }
}

// Genres are only shown while Music is checked; hiding them also clears them.
function syncGenres() {
    document.getElementById("genres").classList.toggle("open", musicParent.checked);
    if (!musicParent.checked) genreBoxes.forEach(g => (g.checked = false));
}

musicParent.addEventListener("change", syncGenres);

document.getElementById("filters").addEventListener("change", render);
document.getElementById("search").addEventListener("input", render);

document.getElementById("clear").addEventListener("click", () => {
    document.querySelectorAll('#filters input[type="checkbox"]').forEach(i => (i.checked = false));
    syncGenres();
    render();
});

render();
