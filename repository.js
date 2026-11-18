// repository.js - the ONLY file that knows where the data lives.
// Today: dummy data kept in this browser (localStorage).
// Later: replace the bodies below with fetch("/api/items") calls to a real API / SQL backend.
// app.js never changes, because it only calls Repo.getAll / add / update / remove / reset.

const SEED = [
  { id: 1, name: "Brake pads, front", category: "Brakes", qty: 24, reorder: 10, price: 18.5 },
  { id: 2, name: "Brake pads, rear", category: "Brakes", qty: 8, reorder: 10, price: 16 },
  { id: 3, name: "Inner tube 700x25", category: "Tyres", qty: 52, reorder: 20, price: 5.25 },
  { id: 4, name: "Road tyre 700x28", category: "Tyres", qty: 0, reorder: 6, price: 32.9 },
  { id: 5, name: "Chain, 11-speed", category: "Drivetrain", qty: 14, reorder: 5, price: 27 },
  { id: 6, name: "Cassette 11-34", category: "Drivetrain", qty: 3, reorder: 4, price: 54.75 },
  { id: 7, name: "Bar tape, black", category: "Cockpit", qty: 31, reorder: 8, price: 12.4 },
  { id: 8, name: "Front light, USB", category: "Lighting", qty: 11, reorder: 6, price: 21.95 },
];

const KEY = "stockroom-items";
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };
const write = (list) => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage unavailable */ } };

const Repo = {
  async getAll() {
    return read() || (write(SEED), JSON.parse(JSON.stringify(SEED)));
  },
  async add(item) {
    const list = await this.getAll();
    item.id = Math.max(0, ...list.map((i) => i.id)) + 1;
    list.push(item);
    write(list);
  },
  async update(id, changes) {
    write((await this.getAll()).map((i) => (i.id === id ? { ...i, ...changes } : i)));
  },
  async remove(id) {
    write((await this.getAll()).filter((i) => i.id !== id));
  },
  async reset() {
    write(SEED);
  },
};
