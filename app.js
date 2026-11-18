// app.js - screen logic. Talks to data only through Repo (see repository.js).
const $ = (id) => document.getElementById(id);
const LABEL = { ok: "In stock", low: "Low stock", out: "Out of stock" };
let items = [];

const level = (i) => (i.qty === 0 ? "out" : i.qty <= i.reorder ? "low" : "ok");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function render() {
  const q = $("search").value.trim().toLowerCase();
  const f = $("status").value;
  const shown = items.filter((i) => {
    const l = level(i);
    const matchesLevel = f === "all" || (f === "low" ? l !== "ok" : l === "out");
    return matchesLevel && (i.name + " " + i.category).toLowerCase().includes(q);
  });

  $("rows").innerHTML = shown.map((i) => {
    const l = level(i);
    const w = Math.min(100, Math.round((i.qty / ((i.reorder * 3) || 1)) * 100));
    const n = esc(i.name);
    return `<tr>
      <td>${n}</td>
      <td>${esc(i.category)}</td>
      <td><div class="level ${l}">
        <div class="bar"><span style="width:${w}%"></span></div>
        <strong>${i.qty}</strong> <span class="tag">${LABEL[l]}</span>
      </div></td>
      <td class="num">${i.price.toFixed(2)}</td>
      <td class="actions">
        <button data-act="dec" data-id="${i.id}" aria-label="Remove one ${n}">-</button>
        <button data-act="inc" data-id="${i.id}" aria-label="Add one ${n}">+</button>
        <button data-act="del" data-id="${i.id}" aria-label="Delete ${n}">Delete</button>
      </td></tr>`;
  }).join("");

  $("empty").hidden = shown.length > 0;
  const needs = items.filter((i) => level(i) !== "ok").length;
  const value = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  $("summary").textContent = `${items.length} items. ${needs} need reordering. Stock value ${value.toFixed(2)}.`;
}

async function load() {
  items = await Repo.getAll();
  render();
}

$("search").addEventListener("input", render);
$("status").addEventListener("change", render);

$("rows").addEventListener("click", async (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  const id = Number(b.dataset.id);
  const it = items.find((x) => x.id === id);
  if (b.dataset.act === "inc") await Repo.update(id, { qty: it.qty + 1 });
  if (b.dataset.act === "dec") await Repo.update(id, { qty: Math.max(0, it.qty - 1) });
  if (b.dataset.act === "del" && confirm(`Delete ${it.name}?`)) await Repo.remove(id);
  load();
});

$("add").addEventListener("click", () => $("dlg").showModal());
$("cancel").addEventListener("click", () => $("dlg").close());

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const d = new FormData(e.target);
  await Repo.add({
    name: d.get("name").trim(),
    category: d.get("category").trim(),
    qty: Number(d.get("qty")),
    reorder: Number(d.get("reorder")),
    price: Number(d.get("price")),
  });
  e.target.reset();
  $("dlg").close();
  load();
});

$("reset").addEventListener("click", async () => {
  if (confirm("Replace all items with the original demo data?")) {
    await Repo.reset();
    load();
  }
});

load();
