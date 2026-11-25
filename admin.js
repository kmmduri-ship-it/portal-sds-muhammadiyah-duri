
/*
 * ADMIN PORTAL SDS MUHAMMADIYAH DURI
 * Penghubung halaman admin dengan backend.
 *
 * API akan diarahkan melalui Netlify Functions.
 */

const API_ENDPOINT = "/.netlify/functions/api";

let adminToken = sessionStorage.getItem("portalAdminToken") || "";
let adminData = null;

// Memanggil backend
async function callServer(action, args = {}) {
  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      action,
      token: adminToken,
      args
    })
  });

  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(result.message || "Terjadi kesalahan.");
  }

  return result.data !== undefined ? result.data : result;
}

// Elemen HTML
function el(id) {
  return document.getElementById(id);
}

function val(id) {
  return el(id)?.value?.trim() || "";
}

function setVal(id, value) {
  if (el(id)) el(id).value = value ?? "";
}

function showMessage(message, isError = false) {
  const box = el("adminMessage");
  if (!box) return;

  box.textContent = message;
  box.style.color = isError ? "#b42318" : "#087443";
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

// LOGIN
el("loginForm")?.addEventListener("submit", async function(event) {
  event.preventDefault();

  const button = el("loginButton");
  const message = el("loginMessage");

  button.disabled = true;
  button.textContent = "Memeriksa...";
  message.textContent = "";

  try {
    const result = await callServer("loginAdmin", {
      username: val("username"),
      password: val("password")
    });

    if (!result.token) {
      throw new Error("Token login tidak ditemukan.");
    }

    adminToken = result.token;
    sessionStorage.setItem("portalAdminToken", adminToken);

    await openDashboard();

  } catch (error) {
    message.textContent = error.message;
  } finally {
    button.disabled = false;
    button.textContent = "Masuk ke Dashboard";
  }
});

// BUKA DASHBOARD
async function openDashboard() {
  el("loginSection").hidden = true;
  el("dashboardSection").hidden = false;

  try {
    await refreshAdmin();
  } catch (error) {
    showMessage(error.message, true);
  }
}

// LOGOUT
el("logoutButton")?.addEventListener("click", async function() {
  try {
    await callServer("logoutAdmin", {});
  } catch (error) {
    console.warn(error);
  }

  adminToken = "";
  adminData = null;
  sessionStorage.removeItem("portalAdminToken");

  el("dashboardSection").hidden = true;
  el("loginSection").hidden = false;
  el("loginForm").reset();
});

// TAB MENU
document.querySelectorAll(".admin-tab").forEach(button => {
  button.addEventListener("click", function() {
    const tab = this.dataset.tab;

    document.querySelectorAll(".admin-tab").forEach(item => {
      item.classList.remove("active");
    });

    document.querySelectorAll(".admin-panel").forEach(panel => {
      panel.hidden = true;
    });

    this.classList.add("active");
    el("tab-" + tab).hidden = false;
  });
});

// MEMUAT DATA ADMIN
async function refreshAdmin() {
  showMessage("Memuat data...");

  const data = await callServer("adminGetData", {});
  adminData = data;

    renderNews();
  renderAgenda();
  renderContent();
  fillSettings();
  fillAppearance();

  showMessage("Data berhasil dimuat.");
}

// TAMPILKAN BERITA
function renderNews() {
  const list = el("newsList");
  if (!list) return;

  const items = adminData?.news || [];

  list.innerHTML = "<h3>Daftar Berita</h3>" +
    (items.length ? items.map(item => `
      <div class="admin-record">
        <strong>${escapeHTML(item.judul || item.title)}</strong>
        <div>${escapeHTML(item.tanggal || item.date || "")}</div>
        <div class="record-actions">
          <button type="button" onclick="editNews('${escapeHTML(item.id)}')">Edit</button>
          <button type="button" onclick="removeNews('${escapeHTML(item.id)}')">Hapus</button>
        </div>
      </div>
    `).join("") : "<p>Belum ada berita.</p>");
}

// TAMPILKAN AGENDA
function renderAgenda() {
  const list = el("agendaList");
  if (!list) return;

  const items = adminData?.agenda || [];

  list.innerHTML = "<h3>Daftar Agenda</h3>" +
    (items.length ? items.map(item => `
      <div class="admin-record">
        <strong>${escapeHTML(item.judul || item.title)}</strong>
        <div>${escapeHTML(item.tanggal || item.date || "")}</div>
        <div class="record-actions">
          <button type="button" onclick="editAgenda('${escapeHTML(item.id)}')">Edit</button>
          <button type="button" onclick="removeAgenda('${escapeHTML(item.id)}')">Hapus</button>
        </div>
      </div>
    `).join("") : "<p>Belum ada agenda.</p>");
}

// TAMPILKAN KONTEN
function renderContent() {
  const list = el("contentList");
  if (!list) return;

  const items = adminData?.content || [];

  list.innerHTML = "<h3>Daftar Konten</h3>" +
    (items.length ? items.map(item => `
      <div class="admin-record">
        <strong>${escapeHTML(item.judul || item.title)}</strong>
        <div>${escapeHTML(item.kategori || item.category || "")}</div>
        <div class="record-actions">
          <button type="button" onclick="editContent('${escapeHTML(item.id)}')">Edit</button>
          <button type="button" onclick="removeContent('${escapeHTML(item.id)}')">Hapus</button>
        </div>
      </div>
    `).join("") : "<p>Belum ada konten.</p>");
}

// ISI IDENTITAS SEKOLAH
function fillSettings() {
  const settings = adminData?.settings || {};

  Object.keys(settings).forEach(key => {
    setVal(key, settings[key]);
  });
}

// EDIT BERITA
function editNews(id) {
  const item = (adminData?.news || []).find(x => String(x.id) === String(id));
  if (!item) return;

  setVal("newsId", item.id);
  setVal("newsTitle", item.judul || item.title);
  setVal("newsDate", item.tanggal || item.date);
  setVal("newsSummary", item.ringkasan || item.summary);
  setVal("newsBody", item.isi || item.body);
  setVal("newsSource", item.sumber || item.source);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// EDIT AGENDA
function editAgenda(id) {
  const item = (adminData?.agenda || []).find(x => String(x.id) === String(id));
  if (!item) return;

  setVal("agendaId", item.id);
  setVal("agendaTitle", item.judul || item.title);
  setVal("agendaDate", item.tanggal || item.date);
  setVal("agendaTime", item.waktu || item.time);
  setVal("agendaLocation", item.lokasi || item.location);
  setVal("agendaCategory", item.kategori || item.category);
  setVal("agendaDescription", item.deskripsi || item.description);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// EDIT KONTEN
function editContent(id) {
  const item = (adminData?.content || []).find(x => String(x.id) === String(id));
  if (!item) return;

  setVal("contentId", item.id);
  setVal("contentCategory", item.kategori || item.category);
  setVal("contentTitle", item.judul || item.title);
  setVal("contentSummary", item.ringkasan || item.summary);
  setVal("contentBody", item.isi || item.body);
  setVal("contentOrder", item.urutan || item.order);
  setVal("contentSource", item.sumber || item.source);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// HAPUS DATA
async function deleteRecord(action, id) {
  if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

  try {
    await callServer(action, { id });
    await refreshAdmin();
    showMessage("Data berhasil dihapus.");
  } catch (error) {
    showMessage(error.message, true);
  }
}

function removeNews(id) {
  deleteRecord("deleteNews", id);
}

function removeAgenda(id) {
  deleteRecord("deleteAgenda", id);
}

function removeContent(id) {
  deleteRecord("deleteContent", id);
}

// SIMPAN FORM
async function saveForm(formId, action, getData) {
  el(formId)?.addEventListener("submit", async function(event) {
    event.preventDefault();

    try {
      showMessage("Menyimpan data...");

      await callServer(action, getData());

      this.reset();
      await refreshAdmin();

      showMessage("Data berhasil disimpan.");
    } catch (error) {
      showMessage(error.message, true);
    }
  });
}

// FORM BERITA
saveForm("newsForm", "saveNews", () => ({
  id: val("newsId"),
  judul: val("newsTitle"),
  tanggal: val("newsDate"),
  ringkasan: val("newsSummary"),
  isi: val("newsBody"),
  sumber: val("newsSource")
}));

// FORM AGENDA
saveForm("agendaForm", "saveAgenda", () => ({
  id: val("agendaId"),
  judul: val("agendaTitle"),
  tanggal: val("agendaDate"),
  waktu: val("agendaTime"),
  lokasi: val("agendaLocation"),
  kategori: val("agendaCategory"),
  deskripsi: val("agendaDescription")
}));

// FORM KONTEN
saveForm("contentForm", "saveContent", () => ({
  id: val("contentId"),
  kategori: val("contentCategory"),
  judul: val("contentTitle"),
  ringkasan: val("contentSummary"),
  isi: val("contentBody"),
  urutan: val("contentOrder"),
  sumber: val("contentSource")
}));

// FORM IDENTITAS SEKOLAH
el("settingsForm")?.addEventListener("submit", async function(event) {
  event.preventDefault();

  const data = {};
  this.querySelectorAll("input, textarea, select").forEach(input => {
    if (input.id) data[input.id] = input.value.trim();
  });

  try {
    showMessage("Menyimpan identitas sekolah...");
    await callServer("saveSchoolSettings", data);
    await refreshAdmin();
    showMessage("Identitas sekolah berhasil disimpan.");
  } catch (error) {
    showMessage(error.message, true);
  }
});

// TOMBOL BATAL
el("resetNews")?.addEventListener("click", () => el("newsForm").reset());
el("resetAgenda")?.addEventListener("click", () => el("agendaForm").reset());
el("resetContent")?.addEventListener("click", () => el("contentForm").reset());

// CEK TOKEN LOGIN YANG MASIH TERSIMPAN
if (adminToken) {
  openDashboard();
}
// MENGISI PENGATURAN TAMPILAN
function fillAppearance() {
  const data = adminData?.appearance || {};

  setVal("themeColor", data.themeColor || "#087443");
  setVal("themeAccent", data.themeAccent || "#d4a72c");
  setVal("homeBanner", data.homeBanner || "");
  setVal("holidayMode", data.holidayMode || "automatic");
  setVal("holidayTitle", data.holidayTitle || "");
  setVal("holidayMessage", data.holidayMessage || "");
  setVal("holidayImage", data.holidayImage || "");
}
