
/* ==========================================
   PORTAL SDS MUHAMMADIYAH DURI
   CLIENT WEBSITE
========================================== */

// Nanti dihubungkan dengan API Apps Script
const API_URL ="/.netlify/functions/api";";

const esc = value =>
  String(value == null ? "" : value).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);

function fmtDate(value) {
  if (!value) return "";
  const d = new Date(value + "T00:00:00");
  return isNaN(d)
    ? esc(value)
    : d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || "";
}

function imageStyle(url) {
  if (!url) return "";
  return ' style="background-image:linear-gradient(0deg,#052f20aa,transparent 70%),url(&quot;' +
    esc(url) + '&quot;)"';
}

function card(item, fallbackIcon) {
  return `
    <article class="info-card">
      <div class="info-card-image" ${imageStyle(item.gambar)}>
        ${item.gambar ? "" : `<span>${fallbackIcon}</span>`}
      </div>
      <div class="info-card-body">
        <h3>${esc(item.judul)}</h3>
        <p>${esc(item.ringkasan || item.isi || "")}</p>
        ${item.sumber
          ? `<a href="${esc(item.sumber)}" target="_blank" rel="noopener">Sumber / detail →</a>`
          : ""}
      </div>
    </article>`;
}

function renderPortal(data) {
  const s = data.settings || {};

  // LOGO SEKOLAH
  ["logoTop", "heroLogo", "profileLogo", "footerLogo"].forEach(id => {
    const el = document.getElementById(id);
    if (el && s.logo) el.src = s.logo;
  });

  // IDENTITAS
  setText("navSchool", s.nama_sekolah);
  setText("heroSchool", s.nama_sekolah);
  setText("heroDesc", s.slogan || s.deskripsi);
  setText("heroAkreditasi", s.akreditasi);
  setText("heroNpsn", s.npsn);
  setText("statNpsn", s.npsn);
  setText("statAccreditation", s.akreditasi);
  setText("statYear", (s.tmt_operasional || "").match(/\d{4}/)?.[0] || "1978");
  setText("statLand", s.luas_tanah);

  // FOOTER
  setText("footerName", s.nama_sekolah);
  setText("footerAddress", [
    s.alamat, s.kelurahan, s.kecamatan, s.kabupaten, s.provinsi
  ].filter(Boolean).join(", "));

  setText("footerEmail", s.email);
  setText("footerPhone", s.telepon);
  setText("yearNow", new Date().getFullYear());

  // PPDB
  setText("ppdbStatus", s.ppdb_status);

  const ppdb = document.getElementById("ppdbButton");
  if (ppdb && s.ppdb_url) {
    ppdb.href = s.ppdb_url;
    ppdb.target = "_blank";
    ppdb.rel = "noopener";
    ppdb.textContent = "Buka Pendaftaran →";
  }

  // INSTAGRAM
  const insta = document.getElementById("instagramLink");
  if (insta && s.instagram) insta.href = s.instagram;

  // GOOGLE MAPS
  const map = document.getElementById("mapLink");
  if (map) {
    map.href = "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent([
        s.alamat, s.kelurahan, s.kecamatan, s.kabupaten, s.provinsi
      ].filter(Boolean).join(", "));
  }

  // BANNER
  if (s.banner) {
    const hero = document.getElementById("heroPhoto");
    hero.style.backgroundImage =
      'linear-gradient(90deg,#06452f22,#06452f22),url("' +
      String(s.banner).replace(/"/g, "%22") + '")';
    hero.classList.add("has-photo");
  }

  // PROFIL
  const profile = (data.content || []).filter(x => x.kategori === "profil");

  if (profile.length) {
    setText("profileTitle", profile[0].judul);
    setText("profileText", profile[0].isi || profile[0].ringkasan);
  }

  // IDENTITAS GRID
  const identity = [
    ["Status", s.status_sekolah],
    ["Jenjang", s.jenjang],
    ["Naungan", s.naungan || "PDM Kabupaten Bengkalis"],
    ["Nomor Pokok Sekolah", s.npsn],
    ["Akreditasi", s.akreditasi],
    ["Operasional", s.tmt_operasional]
  ].filter(x => x[1]);

  document.getElementById("identityGrid").innerHTML =
    identity.map(x => `
      <div>
        <small>${esc(x[0])}</small>
        <b>${esc(x[1])}</b>
      </div>`).join("");

  // AKADEMIK DAN PROGRAM
  const academics = (data.content || []).filter(x =>
    ["akademik", "program"].includes(x.kategori)
  );

  document.getElementById("academicCards").innerHTML =
    academics.length
      ? academics.map(x => card(x, "📚")).join("")
      : '<div class="empty-card">Informasi akademik akan diperbarui oleh admin.</div>';

  // PRESTASI
  const achievements = (data.content || []).filter(
    x => x.kategori === "prestasi"
  );

  document.getElementById("achievementCards").innerHTML =
    achievements.length
      ? achievements.map(x => card(x, "🏆")).join("")
      : '<div class="empty-card">Informasi prestasi akan ditampilkan setelah diperbarui oleh admin.</div>';

  // WISUDA
  const grads = (data.content || []).filter(
    x => x.kategori === "wisuda"
  );

  document.getElementById("graduationCards").innerHTML =
    grads.length
      ? grads.map(x => card(x, "🎓")).join("")
      : '<div class="empty-card">Dokumentasi wisuda akan ditambahkan oleh admin sekolah.</div>';

  // BERITA
  document.getElementById("newsList").innerHTML =
    (data.news || []).length
      ? data.news.map(n => `
        <article class="news-card">
          <div class="news-image" ${imageStyle(n.gambar)}>
            ${n.gambar ? "" : "<span>📰</span>"}
          </div>
          <div class="news-body">
            <small>${fmtDate(n.tanggal)}</small>
            <h3>${esc(n.judul)}</h3>
            <p>${esc(n.ringkasan)}</p>
            ${n.sumber
              ? `<a href="${esc(n.sumber)}" target="_blank" rel="noopener">Baca sumber →</a>`
              : ""}
          </div>
        </article>`).join("")
      : '<p class="empty-card">Belum ada berita yang dipublikasikan.</p>';

  // AGENDA
  document.getElementById("agendaList").innerHTML =
    (data.agenda || []).length
      ? data.agenda.map(a => `
        <div class="agenda-item">
          <div class="agenda-date">${fmtDate(a.tanggal)}</div>
          <div>
            <b>${esc(a.judul)}</b>
            <small>${esc(a.waktu || "")} ${esc(a.lokasi || "")}</small>
          </div>
        </div>`).join("")
      : '<p class="empty-card">Belum ada agenda mendatang.</p>';

  // GALERI
  const gallery = (data.gallery || []).concat(
    (data.content || []).filter(x => x.kategori === "galeri")
  );

  document.getElementById("galleryGrid").innerHTML =
    gallery.length
      ? gallery.map(g => `
        <article class="gallery-item" ${imageStyle(g.gambar)}>
          <b>${esc(g.judul)}</b>
        </article>`).join("")
      : '<div class="empty-card">Foto kegiatan sekolah akan ditambahkan oleh admin.</div>';
}

// AMBIL DATA PORTAL
async function loadPortal() {
  const newsList = document.getElementById("newsList");

  try {
    /*
      API akan kita buat pada tahap berikutnya.
      Jangan mengganti API_URL sebelum saya pandu.
    */

    const response = 
const response = await fetch(API_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    action: "getPortalData",
    args: {}
  })
});

if (!response.ok) {
  throw new Error("Gagal mengambil data portal.");
}

const result = await response.json();

if (!result.success) {
  throw new Error(result.message || "Data portal tidak tersedia.");
}

    renderPortal(result.data);

  } catch (error) {
    console.error(error);
    newsList.innerHTML =
      '<p class="empty-card">Portal belum terhubung ke database. Silakan coba beberapa saat lagi.</p>';
  }
}

// MENU HP
document.getElementById("menuButton").addEventListener("click", () => {
  document.body.classList.toggle("menu-open");
});

// PENCARIAN
document.getElementById("searchBox").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    const q = this.value.toLowerCase();

    document.querySelectorAll(
      ".news-card,.info-card,.gallery-item"
    ).forEach(el => {
      el.hidden = !el.innerText.toLowerCase().includes(q);
    });
  }
});

// JALANKAN
loadPortal();
