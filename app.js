// app.js — lógica. Para agregar campos o estados NO hace falta tocar este archivo (ver config.js).
const K = { t: "panol_tablets", h: "panol_historial" };
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const load = k => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
let scanner = null, actual = null;

// ---------- datos ----------
function log(serie, accion, detalle) { const h = load(K.h); h.unshift({ f: new Date().toLocaleString("es-AR"), serie, accion, detalle }); save(K.h, h.slice(0, 300)); }
function buscar(serie) { return load(K.t).find(t => t.serie.toLowerCase() === String(serie).trim().toLowerCase()); }
function guardar(t) { const l = load(K.t), i = l.findIndex(x => x.serie === t.serie); i >= 0 ? l[i] = t : l.push(t); save(K.t, l); }
const datosQR = t => { const o = {}; CAMPOS.forEach(c => o[c.k] = t[c.k] ?? ""); return o; };

// ---------- navegación ----------
document.querySelectorAll("#nav button").forEach(b => b.onclick = () => {
  document.querySelectorAll("#nav button").forEach(x => x.classList.toggle("on", x === b));
  ["scan", "alta", "lista", "hist"].forEach(v => $(v).classList.toggle("hide", v !== b.dataset.v));
  if (b.dataset.v === "lista") renderLista(); if (b.dataset.v === "hist") renderHist();
  if (b.dataset.v !== "scan") detener();
});

// ---------- CU-01 alta ----------
$("altaForm").innerHTML = CAMPOS.map(c => `<input id="a_${c.k}" placeholder="${esc(c.l)}${c.req ? " *" : ""}">`).join("");
$("btnAlta").onclick = () => {
  const t = { estado: "PANOL", legajo: null, tarea: null };
  CAMPOS.forEach(c => t[c.k] = $("a_" + c.k).value.trim());
  const falta = CAMPOS.find(c => c.req && !t[c.k]);
  if (falta) return alert("Falta: " + falta.l);
  if (buscar(t.serie)) return alert("Ya existe una tablet con ese número de serie");
  guardar(t); log(t.serie, "ALTA", "Ingresada al pañol");
  try {
    const q = qrcode(0, "M"); q.addData(JSON.stringify(datosQR(t))); q.make();
    $("qrOut").innerHTML = q.createImgTag(6) + `<p class="lbl">QR de ${esc(t.serie)} · imprimir y pegar en el reverso</p>`;
  } catch (e) { $("qrOut").innerHTML = '<div class="alert wa">Tablet registrada, pero no se pudo generar el QR (falta la librería qrcode.js).</div>'; }
};

// ---------- lectura QR (Sprint 1) ----------
$("btnCam").onclick = async () => {
  $("camMsg").innerHTML = "";
  try {
    scanner = new Html5Qrcode("reader");
    await scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: 240 }, txt => { detener(); procesarQR(txt); }, () => { });
    $("btnCam").style.display = "none"; $("btnStop").style.display = "block";
  } catch (e) {
    scanner = null;
    $("camMsg").innerHTML = '<div class="alert wa">No hay cámara o falta el permiso. Operá con el número de serie (arriba) o desde el Inventario.</div>';
  }
};
async function detener() {
  if (scanner) { try { await scanner.stop(); scanner.clear(); } catch (e) { } scanner = null; }
  $("btnCam").style.display = "block"; $("btnStop").style.display = "none";
}
$("btnStop").onclick = detener;
$("btnManual").onclick = () => {
  const t = buscar($("manual").value);
  if (!t) return $("ficha").innerHTML = '<div class="alert er">Serie no registrada. Podés darla de alta en la pestaña Alta.</div>';
  log(t.serie, "CONSULTA", "Ingreso manual"); mostrar(t);
};

// Devuelve el objeto tablet o null si el QR no corresponde a una tablet corporativa.
function parsearQR(txt) {
  try {
    let d = null;
    try { d = JSON.parse(txt); }
    catch (e) { // texto delimitado con ";" en el orden de CAMPOS
      const p = String(txt).split(";");
      if (!/^https?:/i.test(txt) && p.length === CAMPOS.length) { d = {}; CAMPOS.forEach((c, i) => d[c.k] = p[i].trim()); }
    }
    if (d && typeof d === "object" && !Array.isArray(d) && (typeof d.serie === "string" || typeof d.serie === "number") && String(d.serie).trim()) {
      const t = {}; CAMPOS.forEach(c => t[c.k] = String(d[c.k] ?? "").trim()); return t;
    }
  } catch (e) { }
  return null;
}
function procesarQR(txt) {
  const d = parsearQR(txt);
  if (!d) return $("ficha").innerHTML = '<div class="alert er">⚠ Este QR no corresponde a una tablet corporativa (formato inválido). Probá con otro o ingresá la serie a mano.</div>';
  let t = buscar(d.serie);
  if (!t) { t = { ...d, estado: "PANOL", legajo: null, tarea: null }; guardar(t); log(t.serie, "ALTA", "Alta automática por lectura de QR"); }
  mostrar(t);
}

// ---------- ficha + préstamo/devolución (Sprint 2) ----------
function mostrar(t) {
  actual = t.serie; let acc = "";
  if (t.estado === "PANOL") acc = `
    <h4>CU-02 · Despachar</h4>
    <input id="legajo" placeholder="Legajo del empleado *">
    <select id="modo"><option value="LOCAL">Uso local (oficina)</option><option value="EXTERNO">Home Office</option></select>
    <textarea id="tarea" rows="2" placeholder="Tarea asignada (obligatoria para Home Office)"></textarea>
    <button class="b" onclick="despachar()">Confirmar préstamo</button>
    <button class="b s" onclick="cambiar('SERVICIO')">Enviar a servicio técnico</button>`;
  else if (t.estado === "SERVICIO") acc = `
    <div class="alert wa">Fuera de circulación: no se puede prestar hasta que sea reparada.</div>
    <button class="b s" onclick="cambiar('PANOL')">Reparada: reingresar al pañol</button>`;
  else acc = `
    <h4>CU-03 · Recibir devolución</h4>
    <label class="sw"><input type="checkbox" id="rotura"> Devuelta con rotura o pantalla golpeada</label>
    <textarea id="obs" rows="2" placeholder="Observaciones"></textarea>
    <button class="b" onclick="devolver()">Registrar devolución</button>`;
  const filas = CAMPOS.filter(c => c.k !== "serie").map(c => `<tr><td class="lbl">${esc(c.l)}</td><td>${esc(t[c.k]) || "-"}</td></tr>`).join("");
  $("ficha").innerHTML = `<div class="card"><h3>${esc(t.serie)} <span class="badge" style="background:${COLOR[t.estado]}">${ESTADOS[t.estado]}</span></h3>
  <table>${filas}${t.legajo ? `<tr><td class="lbl">Legajo</td><td>${esc(t.legajo)}</td></tr><tr><td class="lbl">Tarea</td><td>${esc(t.tarea || "-")}</td></tr>` : ""}</table>
  <div id="msg"></div>${acc}
  <button class="b s" onclick="verQR()">Ver QR de esta tablet</button><div id="qrFicha" style="text-align:center;margin-top:10px"></div></div>`;
}
const msg = (c, t) => $("msg").innerHTML = `<div class="alert ${c}">${t}</div>`;
window.despachar = () => {
  const t = buscar(actual), leg = $("legajo").value.trim(), modo = $("modo").value, tarea = $("tarea").value.trim();
  if (!leg) return msg("er", "Falta el legajo del empleado.");
  if (modo === "EXTERNO" && !tarea) return msg("er", "⚠ BLOQUEADO: no se puede autorizar Home Office sin una tarea asignada que lo justifique.");
  Object.assign(t, { estado: modo, legajo: leg, tarea: tarea || null }); guardar(t);
  log(t.serie, "DESPACHO", `${ESTADOS[modo]} · legajo ${leg}${tarea ? " · tarea: " + tarea : ""}`); mostrar(t); msg("ok", "Préstamo registrado.");
};
window.devolver = () => {
  const t = buscar(actual), rota = $("rotura").checked, o = $("obs").value;
  log(t.serie, "DEVOLUCION", `legajo ${t.legajo} · ${rota ? "con rotura" : "buen estado"}${o ? " · " + o : ""}`);
  Object.assign(t, { estado: rota ? "SERVICIO" : "PANOL", legajo: null, tarea: null }); guardar(t); mostrar(t);
  msg(rota ? "wa" : "ok", rota ? "Devuelta con rotura: derivada a Servicio Técnico (préstamos bloqueados)." : "Devolución registrada: reingresó al pañol.");
};
window.cambiar = e => { const t = buscar(actual); Object.assign(t, { estado: e, legajo: null, tarea: null }); guardar(t); log(t.serie, "CAMBIO ESTADO", ESTADOS[e]); mostrar(t); };

// ---------- inventario (funciona sin cámara) e historial ----------
$("filtro").oninput = renderLista;
function renderLista() {
  const f = $("filtro").value.trim().toLowerCase();
  const l = load(K.t).filter(t => !f || t.serie.toLowerCase().includes(f) || String(t.legajo || "").toLowerCase().includes(f));
  $("listaOut").innerHTML = l.length ? l.map(t => `<div class="card" onclick="irFicha('${esc(t.serie)}')"><b>${esc(t.serie)}</b> <span class="badge" style="background:${COLOR[t.estado]}">${ESTADOS[t.estado]}</span>${t.legajo ? `<br><span class="lbl">Legajo ${esc(t.legajo)}</span>` : ""}</div>`).join("") : '<div class="card">Sin resultados.</div>';
}
window.irFicha = s => { document.querySelector("[data-v=scan]").click(); mostrar(buscar(s)); };
function renderHist() {
  const h = load(K.h);
  $("histOut").innerHTML = h.length ? h.map(x => `<div class="card"><b>${esc(x.accion)}</b> · ${esc(x.serie)}<br><span class="lbl">${esc(x.f)}</span><br>${esc(x.detalle)}</div>`).join("") : '<div class="card">Sin movimientos.</div>';
}

// Vuelve a generar el QR de la tablet abierta (a partir de sus datos guardados).
window.verQR = () => {
  const t = buscar(actual);
  try {
    const q = qrcode(0, "M"); q.addData(JSON.stringify(datosQR(t))); q.make();
    $("qrFicha").innerHTML = q.createImgTag(6) + `<p class="lbl">QR de ${esc(t.serie)} · mantené presionada la imagen para guardarla o sacale captura para imprimir</p>`;
  } catch (e) { $("qrFicha").innerHTML = '<div class="alert wa">No se pudo generar el QR.</div>'; }
};
