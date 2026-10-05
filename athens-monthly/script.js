const eventsEl = document.getElementById("events");
const countEl = document.getElementById("count");
const sortEl = document.getElementById("sort");
const musicParent = document.getElementById("music-parent");
const genreBoxes = document.querySelectorAll('input[name="genre"]');

const labels = { solo: "Solo / Friends", friends: "Solo / Friends", date: "Date Night", family: "Family", all: "All Audiences" };


const audienceKey = a => (a === "friends" ? "solo" : a);

const toList = v => (Array.isArray(v) ? v : v ? [v] : []);
const longDateFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" });
const shortDateFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });
const displayDateCache = new Map();
const searchIndex = new Map();

const hits = (value, picks) => {
    const l = toList(value);
    return l.includes("all") || l.some(x => picks.includes(x));
};

const modal = document.getElementById("modal");
const photoEl = document.getElementById("modal-photo");
const bodyEl = document.getElementById("modal-body");


const venueImages = {
    "40 Watt Club": "images/40watt.jpg",
    "Allgood Lounge": "images/allgoodlounge.jpeg",
    "Athens Community Theatre": "images/athenscommunitytheatre.jpeg",
    "Athens Creative Hub": "images/creativehub.jpeg",
    "Athens Downtown Library": "images/downtownlibrary.jpeg",
    "Athens-Clarke County Library": "images/clarkecountylibrary.jpeg",
    "Bishop Park": "images/bishoppark.png",
    "Buvez": "images/buvez.jpeg",
    "Ciné Barcafé": "images/cine.jpeg",
    "Classic Center": "images/classiccenter.jpeg",
    "Farm 255": "images/farm255.jpeg",
    "Five & Ten": "images/five%20and%20ten.jpeg",
    "Flicker Theatre & Bar": "images/flicker.jpg",
    "Georgia Theatre": "images/georgiatheattre.jpg",
    "Georgia Theatre Rooftop": "images/georgiatheatrerooftop.jpeg",
    "Hendershot's": "images/hendershots.jpeg",
    "Hot Corner": "images/hotcorner.jpeg",
    "Little Italy": "images/littleitaly.jpg",
    "Mama's Boy": "images/mamasboy.jpg",
    "Neighborhood porches": "images/porchfestneighborhood.jpeg",
    "Normaltown Comedy Room": "images/normaltowncomedyroom.jpg",
    "State Botanical Garden": "images/statebotanicalgarden.jpeg",
    "Taqueria del Sol": "images/taqueriadelsol.jpeg",
    "The National": "images/thenational.jpeg",
    "The Place": "images/theplace.jpeg",
    "Trappeze Pub": "images/trappezepub.jpeg",
    "UGA Career Center": "images/uga%20career%20center.jpeg",
    "UGA Georgia Center": "images/ugageorgiacenter.jpeg"
};

const venueWebsites = {
    "40 Watt Club": "https://www.40watt.com/",
    "Allgood Lounge": "https://www.allgoodlounge.com/",
    "Athens-Clarke County Library": "https://www.accgov.com/library",
    "Bishop Park": "https://www.accgov.com/Facilities/Facility/Details/Bishop-Park-19",
    "Ciné Barcafé": "https://www.cineathens.com/",
    "Classic Center": "https://www.classiccenter.com/",
    "Five & Ten": "https://www.fiveandten.com/",
    "Georgia Theatre": "https://www.georgiatheatre.com/",
    "Georgia Theatre Rooftop": "https://www.georgiatheatre.com/",
    "Mama's Boy": "https://www.mamasboyathens.com/",
    "State Botanical Garden": "https://botgarden.uga.edu/",
    "The National": "https://www.thenationalrestaurant.com/",
    "Trappeze Pub": "https://www.trappezepub.com/",
    "UGA Career Center": "https://career.uga.edu/",
    "UGA Georgia Center": "https://www.georgiacenter.uga.edu/"
};


function openModal(e, tags) {
    photoEl.replaceChildren();
    photoEl.className = "";
    const photo = e.image || venueImages[e.venue];
    if (photo) {
        const img = document.createElement("img");
        img.src = photo;
        img.alt = e.venue;
        img.loading = "eager";
        img.decoding = "async";
        photoEl.appendChild(img);
    } else {
        photoEl.className = `placeholder ${toList(e.category)[0]}`;
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
        if (k === "Where" && (e.website || venueWebsites[e.venue])) {
            const link = document.createElement("a");
            link.href = e.website || venueWebsites[e.venue];
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Venue website";
            dd.append(document.createTextNode(`${v} · `), link);
        } else {
            dd.textContent = v;
        }
        dl.append(dt, dd);
    }
    const desc = document.createElement("p");
    desc.textContent = e.description || "";
    const tagBox = document.createElement("div");
    for (const [text, group] of tags) {
        const s = document.createElement("span");
        s.className = group;
        s.textContent = text;
        tagBox.appendChild(s);
    }
    bodyEl.replaceChildren(h2, dl, ...(e.description ? [desc] : []), tagBox);
    modal.showModal();
}

document.getElementById("modal-close").addEventListener("click", () => modal.close());
modal.addEventListener("click", ev => {
    if (ev.target === modal) modal.close();
});

function checked(name) {
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(i => i.value);
}

function searchText(e) {
    if (searchIndex.has(e)) return searchIndex.get(e);
    const d = new Date(e.date + "T00:00:00");
    const long = longDateFormatter.format(d);
    const short = shortDateFormatter.format(d);
    const numeric = `${d.getMonth() + 1}/${d.getDate()}`;
    const text = `${e.title} ${e.venue} ${long} ${short} ${numeric} ${e.date} ${e.time} ${toList(e.category).join(" ")} ${toList(e.genre).join(" ")}`.toLowerCase();
    searchIndex.set(e, text);
    return text;
}

function matches(e, f) {
    if (f.query && !searchText(e).includes(f.query)) return false;
    if (f.local.length && !f.local.includes(e.local ? "local" : "visiting")) return false;
    if (f.audience.length && !hits(toList(e.audience).map(audienceKey), f.audience)) return false;

    const cats = toList(e.category);
    const picked = new Set(f.category);
    if (f.genre.length) picked.add("music");
    if (picked.size && !cats.some(c => picked.has(c))) return false;
    if (cats.includes("music") && f.genre.length && !hits(e.genre, f.genre)) return false;
    return true;
}

function formatDate(iso) {
    if (displayDateCache.has(iso)) return displayDateCache.get(iso);
    const d = new Date(iso + "T00:00:00");
    const formatted = shortDateFormatter.format(d);
    displayDateCache.set(iso, formatted);
    return formatted;
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
    const fragment = document.createDocumentFragment();

    if (!list.length) {
        const empty = document.createElement("p");
        empty.textContent = "No events match these filters.";
        fragment.appendChild(empty);
    }

    for (const e of list) {
        const card = document.createElement("article");
        card.className = "card";

        const audiences = [...new Set(toList(e.audience).map(a => labels[a]))];
        const genres = toList(e.genre).filter(g => g !== "all");
        const tags = [
            [e.local ? "Athens Local" : "Visiting", "locals"],
            ...audiences.map(a => [a, "type"]),
            ...toList(e.category).map(c => [c, "event"]),
            ...genres.map(g => [g, "event"])
        ];

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

        const venuePhoto = e.image || venueImages[e.venue];
        if (venuePhoto) {
            const thumbnail = document.createElement("img");
            thumbnail.className = "venue-thumb";
            thumbnail.src = venuePhoto;
            thumbnail.alt = `Photo of ${e.venue}`;
            thumbnail.loading = "lazy";
            thumbnail.decoding = "async";
            where.appendChild(thumbnail);
        }

        if (e.date === "2026-10-31") {
            for (const el of [h3, where]) {
                const g = document.createElement("img");
                g.className = "date-ghost";
                g.src = "images/ghost.svg";
                g.alt = "";
                el.append(g);
            }
        }
        const chips = [
            tags[0],
            [audiences.join(", "), "type"],
            [[...toList(e.category), ...genres].join(" · "), "event"]
        ];
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
        fragment.appendChild(card);
    }

    eventsEl.replaceChildren(fragment);
}


function syncGenres() {
    document.getElementById("genres").classList.toggle("open", musicParent.checked);
    if (!musicParent.checked) genreBoxes.forEach(g => (g.checked = false));
}

musicParent.addEventListener("change", syncGenres);

document.getElementById("filters").addEventListener("change", render);
let searchFrame = 0;
document.getElementById("search").addEventListener("input", () => {
    if (searchFrame) cancelAnimationFrame(searchFrame);
    searchFrame = requestAnimationFrame(() => {
        searchFrame = 0;
        render();
    });
});

const headerEl = document.querySelector("header");
new ResizeObserver(() => {
    document.documentElement.style.setProperty("--header-h", `${headerEl.offsetHeight}px`);
}).observe(headerEl);

render();
