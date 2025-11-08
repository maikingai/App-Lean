import express from 'express';
import fs from 'fs';
import path from 'path';
import pbAdmin from '../pbAdminClient.js';
import pbAuth from '../middlewares/pbAuth.js';

const router = express.Router();

const dataDir = path.join(process.cwd(), 'backend', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const filePath = path.join(dataDir, 'events.json');

function readFile() {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]'); } catch { return []; }
}
function writeFile(arr) { fs.writeFileSync(filePath, JSON.stringify(arr, null, 2)); }

// list events
router.get('/', async (req, res) => {
  try {
    // try PocketBase first
    try {
      const list = await pbAdmin.collection('events').getFullList();
      return res.json({ success: true, items: list });
    } catch {
      const arr = readFile();
      return res.json({ success: true, items: arr });
    }
  } catch (e) { res.status(500).json({ success: false, message: e?.message || String(e) }); }
});

// create
router.post('/', pbAuth, async (req, res) => {
  try {
    const data = req.body || {};
    try {
      const r = await pbAdmin.collection('events').create(data);
      return res.status(201).json({ success: true, event: r });
    } catch {
      const arr = readFile();
      arr.push(data);
      writeFile(arr);
      return res.status(201).json({ success: true, event: data });
    }
  } catch (e) { res.status(500).json({ success: false, message: e?.message || String(e) }); }
});

// update
router.put('/:id', pbAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body || {};
    try {
      const r = await pbAdmin.collection('events').update(id, data);
      return res.json({ success: true, event: r });
    } catch {
      const arr = readFile();
      const i = arr.findIndex(x => x.id === id);
      if (i === -1) return res.status(404).json({ success: false, message: 'Not found' });
      arr[i] = { ...arr[i], ...data };
      writeFile(arr);
      return res.json({ success: true, event: arr[i] });
    }
  } catch (e) { res.status(500).json({ success: false, message: e?.message || String(e) }); }
});

// delete
router.delete('/:id', pbAuth, async (req, res) => {
  try {
    const id = req.params.id;
    try {
      await pbAdmin.collection('events').delete(id);
      return res.json({ success: true });
    } catch {
      const arr = readFile();
      const i = arr.findIndex(x => x.id === id);
      if (i === -1) return res.status(404).json({ success: false, message: 'Not found' });
      arr.splice(i, 1);
      writeFile(arr);
      return res.json({ success: true });
    }
  } catch (e) { res.status(500).json({ success: false, message: e?.message || String(e) }); }
});

export default router;
