import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// compute __dirname first so we can load the .env file before importing other modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import express from 'express';
import cors from 'cors';

// import routers after dotenv is loaded so any module that reads process.env
// (like pbAdminClient) can see the values. Use dynamic import to ensure ordering.
const { default: apiRouter } = await import('./routes/api.js');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/api', apiRouter);

app.get('/health', (_, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// start server with retry when port is already in use
function startServer(port, attemptsLeft = 5) {
	const server = app.listen(port, () => console.log(`API server listening on http://localhost:${port}`));
	server.on('error', (err) => {
		if (err && err.code === 'EADDRINUSE' && attemptsLeft > 0) {
			console.warn(`Port ${port} in use, trying ${port + 1} (attempts left: ${attemptsLeft - 1})`);
			// wait briefly then try next port
			setTimeout(() => startServer(port + 1, attemptsLeft - 1), 200);
			return;
		}
		console.error('Server error:', err);
		process.exit(1);
	});
}

startServer(Number(PORT));