import { n as LEAD_NOT_PROOF, t as HEURISTIC_DISCLAIMER } from "./types-CPbO9eBB.mjs";
import { a as validateAddress, i as sanitizeCaseId, r as normalizeAddress, t as clampHopCap } from "./validate-D-Y1YbRZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/engine-DrGiGNUQ.js
var _0002_vasptrace_default = "-- VASPTrace schema. Unowned demo data (auth off). Case IDs are\n-- investigation reference numbers, not personal identifiers.\n\ncreate table if not exists vasps (\n  id text primary key,\n  name text not null,\n  category text not null default 'exchange',\n  jurisdiction text,\n  website text,\n  notes text\n);\n\ncreate table if not exists vasp_addresses (\n  id serial primary key,\n  vasp_id text not null references vasps(id),\n  chain text not null,\n  address text not null,\n  address_norm text not null,\n  label text not null,\n  source text not null,\n  source_url text,\n  verification_status text not null default 'public_label',\n  verified_at date,\n  reliability text not null default 'medium',\n  unique (chain, address_norm)\n);\n\ncreate index if not exists vasp_addresses_norm_idx on vasp_addresses (chain, address_norm);\ncreate index if not exists vasp_addresses_vasp_idx on vasp_addresses (vasp_id);\n\ncreate table if not exists risk_entities (\n  id serial primary key,\n  chain text not null,\n  address text not null,\n  address_norm text not null,\n  entity_type text not null,\n  name text not null,\n  source text not null,\n  source_url text,\n  notes text,\n  unique (chain, address_norm)\n);\n\ncreate index if not exists risk_entities_norm_idx on risk_entities (chain, address_norm);\n\ncreate table if not exists dataset_meta (\n  id text primary key,\n  version text not null,\n  updated_at timestamptz not null default now(),\n  notes text\n);\n\ncreate table if not exists cases (\n  id text primary key,\n  title text,\n  status text not null default 'open',\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists traces (\n  id text primary key,\n  case_id text,\n  wallet_address text not null,\n  wallet_norm text not null,\n  chain text not null,\n  hop_cap integer not null default 3,\n  status text not null default 'complete',\n  dataset_version text,\n  data_source text not null,\n  completeness text not null default 'full',\n  attributed_vasp_id text,\n  confidence_score integer,\n  confidence_band text,\n  review_decision text not null default 'pending',\n  review_note text,\n  result_json text not null,\n  created_at timestamptz not null default now(),\n  reviewed_at timestamptz\n);\n\ncreate index if not exists traces_created_idx on traces (created_at desc);\ncreate index if not exists traces_case_idx on traces (case_id);\n\ncreate table if not exists trace_nodes (\n  id serial primary key,\n  trace_id text not null references traces(id) on delete cascade,\n  address text not null,\n  address_norm text not null,\n  hop integer not null,\n  role text not null,\n  label text,\n  vasp_id text,\n  tx_count integer not null default 0\n);\n\ncreate index if not exists trace_nodes_trace_idx on trace_nodes (trace_id);\n\ncreate table if not exists trace_edges (\n  id serial primary key,\n  trace_id text not null references traces(id) on delete cascade,\n  from_address text not null,\n  to_address text not null,\n  tx_hash text not null,\n  amount_display text,\n  symbol text,\n  timestamp_unix bigint,\n  is_token boolean not null default false\n);\n\ncreate index if not exists trace_edges_trace_idx on trace_edges (trace_id);\n\ncreate table if not exists predictions (\n  id serial primary key,\n  trace_id text not null references traces(id) on delete cascade,\n  vasp_id text not null,\n  vasp_name text not null,\n  score integer not null,\n  hop_distance integer not null,\n  ranked integer not null,\n  breakdown_json text not null\n);\n\ncreate table if not exists reports (\n  id serial primary key,\n  trace_id text not null references traces(id) on delete cascade,\n  kind text not null,\n  payload_json text not null,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists audit_logs (\n  id serial primary key,\n  action text not null,\n  target_id text,\n  detail text,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists tx_cache (\n  id serial primary key,\n  chain text not null,\n  address_norm text not null,\n  payload_json text not null,\n  source text not null,\n  fetched_at timestamptz not null default now(),\n  unique (chain, address_norm)\n);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({ "/migrations/0002_vasptrace.sql": _0002_vasptrace_default });
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
var UA = "VASPTrace/1.0 (SIH26182 investigative MVP)";
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
/** Public explorer fetch with one retry on 429/503. Does not retry 4xx validation errors. */
async function fetchExplorerJson(url, timeoutMs = 8e3) {
	let last = null;
	for (let attempt = 0; attempt < 2; attempt += 1) {
		const ctrl = new AbortController();
		const timer = setTimeout(() => ctrl.abort(), timeoutMs);
		try {
			const res = await fetch(url, {
				signal: ctrl.signal,
				headers: {
					Accept: "application/json",
					"User-Agent": UA
				}
			});
			if (res.status === 429 || res.status === 503) {
				last = /* @__PURE__ */ new Error(`HTTP ${res.status}`);
				await sleep(400 * 2 ** attempt);
				continue;
			}
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return await res.json();
		} catch (err) {
			last = err instanceof Error ? err : /* @__PURE__ */ new Error("fetch failed");
			const msg = last.message;
			if (msg.includes("HTTP 4") && !msg.includes("HTTP 429")) throw last;
		} finally {
			clearTimeout(timer);
		}
	}
	throw last ?? /* @__PURE__ */ new Error("fetch failed");
}
var ZERO = "0x0000000000000000000000000000000000000000";
var ETHPLORER = "https://api.ethplorer.io";
var BLOCKSCOUT = "https://eth.blockscout.com/api/v2";
function formatUnits$1(raw, decimals) {
	try {
		const negative = raw.startsWith("-");
		const digits = (negative ? raw.slice(1) : raw).replace(/^0+/, "") || "0";
		if (decimals <= 0) return `${negative ? "-" : ""}${digits}`;
		const padded = digits.padStart(decimals + 1, "0");
		const i = padded.length - decimals;
		const whole = padded.slice(0, i);
		const frac = padded.slice(i).replace(/0+$/, "");
		const body = frac ? `${whole}.${frac.slice(0, 8)}` : whole;
		return `${negative ? "-" : ""}${body}`;
	} catch {
		return raw;
	}
}
function toUnix$1(ts) {
	if (!ts) return 0;
	return ts > 0xe8d4a51000 ? Math.floor(ts / 1e3) : ts;
}
function fromEthplorerNative(rows, limit) {
	if (!Array.isArray(rows)) return [];
	const out = [];
	for (const row of rows.slice(0, limit)) {
		if (!row || typeof row !== "object") continue;
		const r = row;
		const from = String(r.from ?? "");
		const to = String(r.to ?? "");
		const hash = String(r.hash ?? "");
		if (!from || !to || !hash) continue;
		const rawValue = String(r.rawValue ?? "0");
		const amount = formatUnits$1(rawValue, 18);
		out.push({
			hash,
			from,
			fromNorm: from.toLowerCase(),
			to,
			toNorm: to.toLowerCase(),
			valueAtomic: rawValue,
			decimals: 18,
			symbol: "ETH",
			amountDisplay: `${amount} ETH`,
			timestamp: toUnix$1(Number(r.timestamp ?? 0)),
			isToken: false,
			explorerUrl: `https://etherscan.io/tx/${hash}`
		});
	}
	return out;
}
function fromEthplorerTokens(payload, limit) {
	const ops = payload && typeof payload === "object" && "operations" in payload ? payload.operations : payload;
	if (!Array.isArray(ops)) return [];
	const out = [];
	for (const row of ops.slice(0, limit)) {
		if (!row || typeof row !== "object") continue;
		const r = row;
		const from = String(r.from ?? "");
		const to = String(r.to ?? "");
		const hash = String(r.transactionHash ?? r.hash ?? "");
		if (!from || !to || !hash) continue;
		const token = r.tokenInfo ?? {};
		const decimals = Number(token.decimals ?? 18) || 18;
		const symbol = String(token.symbol ?? "TOKEN").slice(0, 12);
		const raw = String(r.value ?? "0");
		const amount = formatUnits$1(raw, decimals);
		out.push({
			hash,
			from,
			fromNorm: from.toLowerCase(),
			to,
			toNorm: to.toLowerCase(),
			valueAtomic: raw,
			decimals,
			symbol,
			amountDisplay: `${amount} ${symbol}`,
			timestamp: toUnix$1(Number(r.timestamp ?? 0)),
			isToken: true,
			tokenAddress: String(token.address ?? ""),
			explorerUrl: `https://etherscan.io/tx/${hash}`
		});
	}
	return out;
}
function fromBlockscout(payload, limit) {
	const items = payload && typeof payload === "object" && "items" in payload ? payload.items : null;
	if (!Array.isArray(items)) return [];
	const out = [];
	for (const row of items.slice(0, limit)) {
		if (!row || typeof row !== "object") continue;
		const r = row;
		const fromObj = r.from;
		const toObj = r.to;
		const from = String(fromObj?.hash ?? "");
		const to = String(toObj?.hash ?? "");
		const hash = String(r.hash ?? "");
		if (!from || !to || !hash) continue;
		const value = String(r.value ?? "0");
		const amount = formatUnits$1(value, 18);
		const ts = String(r.timestamp ?? "");
		const unix = ts ? Math.floor(new Date(ts).getTime() / 1e3) : 0;
		out.push({
			hash,
			from,
			fromNorm: from.toLowerCase(),
			to,
			toNorm: to.toLowerCase(),
			valueAtomic: value,
			decimals: 18,
			symbol: "ETH",
			amountDisplay: `${amount} ETH`,
			timestamp: unix,
			isToken: false,
			explorerUrl: `https://etherscan.io/tx/${hash}`
		});
	}
	return out;
}
function fromBlockscoutTokens(payload, limit) {
	const items = payload && typeof payload === "object" && "items" in payload ? payload.items : null;
	if (!Array.isArray(items)) return [];
	const out = [];
	for (const row of items.slice(0, limit)) {
		if (!row || typeof row !== "object") continue;
		const r = row;
		const fromObj = r.from;
		const toObj = r.to;
		const from = String(fromObj?.hash ?? "");
		const to = String(toObj?.hash ?? "");
		const hash = String(r.transaction_hash ?? r.tx_hash ?? "");
		if (!from || !to || !hash) continue;
		const token = r.token ?? {};
		const decimals = Number(token.decimals ?? 18) || 18;
		const symbol = String(token.symbol ?? "TOKEN").slice(0, 12);
		const total = r.total && typeof r.total === "object" ? r.total : null;
		const raw = String(total?.value ?? r.value ?? "0");
		const amount = formatUnits$1(raw, decimals);
		const ts = String(r.timestamp ?? "");
		const unix = ts ? Math.floor(new Date(ts).getTime() / 1e3) : 0;
		out.push({
			hash,
			from,
			fromNorm: from.toLowerCase(),
			to,
			toNorm: to.toLowerCase(),
			valueAtomic: raw,
			decimals,
			symbol,
			amountDisplay: `${amount} ${symbol}`,
			timestamp: unix,
			isToken: true,
			tokenAddress: String(token.address ?? ""),
			explorerUrl: `https://etherscan.io/tx/${hash}`
		});
	}
	return out;
}
function mergeTxs(lists) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const list of lists) for (const tx of list) {
		const key = `${tx.hash}:${tx.fromNorm}:${tx.toNorm}:${tx.symbol}:${tx.valueAtomic}`;
		if (seen.has(key)) continue;
		seen.add(key);
		if (tx.fromNorm === ZERO || tx.toNorm === ZERO) continue;
		out.push(tx);
	}
	out.sort((a, b) => b.timestamp - a.timestamp);
	return out;
}
var ethereumAdapter = {
	chain: "ethereum",
	displayName: "Ethereum",
	nativeSymbol: "ETH",
	validate: (address) => !validateAddress("ethereum", address),
	normalize: (address) => normalizeAddress("ethereum", address),
	display: (address) => address,
	async fetchHistory(address, limit) {
		const sources = [];
		const native = [];
		const tokens = [];
		const errors = [];
		const [nativeRes, tokenRes] = await Promise.allSettled([fetchExplorerJson(`${ETHPLORER}/getAddressTransactions/${address}?apiKey=freekey&limit=${limit}`), fetchExplorerJson(`${ETHPLORER}/getAddressHistory/${address}?apiKey=freekey&type=transfer&limit=${limit}`)]);
		if (nativeRes.status === "fulfilled") {
			native.push(...fromEthplorerNative(nativeRes.value, limit));
			sources.push("Ethplorer");
		} else errors.push(`Ethplorer native: ${nativeRes.reason instanceof Error ? nativeRes.reason.message : "fail"}`);
		if (tokenRes.status === "fulfilled") {
			tokens.push(...fromEthplorerTokens(tokenRes.value, limit));
			if (!sources.includes("Ethplorer")) sources.push("Ethplorer");
		} else errors.push(`Ethplorer tokens: ${tokenRes.reason instanceof Error ? tokenRes.reason.message : "fail"}`);
		if (native.length === 0 || tokens.length === 0) {
			const fallbacks = [];
			if (native.length === 0) fallbacks.push(fetchExplorerJson(`${BLOCKSCOUT}/addresses/${address}/transactions?limit=${Math.min(limit, 50)}`).then((payload) => {
				native.push(...fromBlockscout(payload, limit));
				sources.push("Blockscout");
			}).catch((err) => {
				errors.push(`Blockscout native: ${err instanceof Error ? err.message : "fail"}`);
			}));
			if (tokens.length === 0) fallbacks.push(fetchExplorerJson(`${BLOCKSCOUT}/addresses/${address}/token-transfers?limit=${Math.min(limit, 50)}`).then((payload) => {
				tokens.push(...fromBlockscoutTokens(payload, limit));
				if (!sources.includes("Blockscout")) sources.push("Blockscout");
			}).catch((err) => {
				errors.push(`Blockscout tokens: ${err instanceof Error ? err.message : "fail"}`);
			}));
			await Promise.all(fallbacks);
		}
		const txs = mergeTxs([native, tokens]).slice(0, limit * 2);
		if (txs.length === 0 && errors.length) throw new Error(`Ethereum APIs returned no usable transfers (${errors.join("; ")})`);
		return {
			txs,
			source: sources.join(" + ") || "ethereum-public-api",
			truncated: native.length + tokens.length >= limit
		};
	}
};
var TRONGRID = "https://api.trongrid.io";
function formatUnits(raw, decimals) {
	try {
		const digits = String(raw).replace(/^0+/, "") || "0";
		if (decimals <= 0) return digits;
		const padded = digits.padStart(decimals + 1, "0");
		const i = padded.length - decimals;
		const whole = padded.slice(0, i);
		const frac = padded.slice(i).replace(/0+$/, "");
		return frac ? `${whole}.${frac.slice(0, 8)}` : whole;
	} catch {
		return String(raw);
	}
}
function toUnix(ts) {
	if (!ts) return 0;
	return ts > 0xe8d4a51000 ? Math.floor(ts / 1e3) : ts;
}
function ownerAddress(obj) {
	if (!obj) return "";
	if (typeof obj === "string") return obj;
	if (typeof obj === "object" && obj && "address" in obj) return String(obj.address ?? "");
	return "";
}
function fromTrc20(payload, limit) {
	const data = payload && typeof payload === "object" && "data" in payload ? payload.data : null;
	if (!Array.isArray(data)) return [];
	const out = [];
	for (const row of data.slice(0, limit)) {
		if (!row || typeof row !== "object") continue;
		const r = row;
		const from = String(r.from ?? "");
		const to = String(r.to ?? "");
		const hash = String(r.transaction_id ?? r.hash ?? "");
		if (!from || !to || !hash) continue;
		const token = r.token_info ?? {};
		const decimals = Number(token.decimals ?? 6) || 6;
		const symbol = String(token.symbol ?? "TRC20").slice(0, 12);
		const raw = String(r.value ?? "0");
		const amount = formatUnits(raw, decimals);
		out.push({
			hash,
			from,
			fromNorm: from,
			to,
			toNorm: to,
			valueAtomic: raw,
			decimals,
			symbol,
			amountDisplay: `${amount} ${symbol}`,
			timestamp: toUnix(Number(r.block_timestamp ?? 0)),
			isToken: true,
			tokenAddress: String(token.address ?? ""),
			explorerUrl: `https://tronscan.org/#/transaction/${hash}`
		});
	}
	return out;
}
function fromTrx(payload, limit) {
	const data = payload && typeof payload === "object" && "data" in payload ? payload.data : null;
	if (!Array.isArray(data)) return [];
	const out = [];
	for (const row of data.slice(0, limit)) {
		if (!row || typeof row !== "object") continue;
		const r = row;
		const hash = String(r.txID ?? r.transaction_id ?? "");
		const rawData = r.raw_data ?? {};
		const first = (Array.isArray(rawData.contract) ? rawData.contract : [])[0] ?? {};
		const value = (first.parameter ?? {}).value ?? {};
		const from = ownerAddress(value.owner_address) || String(value.owner_address ?? "");
		const to = ownerAddress(value.to_address) || String(value.to_address ?? "");
		const amountSun = String(value.amount ?? "0");
		if (!from || !to || !hash) continue;
		if (String(first.type ?? "") && !String(first.type).includes("Transfer")) continue;
		const amount = formatUnits(amountSun, 6);
		out.push({
			hash,
			from,
			fromNorm: from,
			to,
			toNorm: to,
			valueAtomic: amountSun,
			decimals: 6,
			symbol: "TRX",
			amountDisplay: `${amount} TRX`,
			timestamp: toUnix(Number(rawData.timestamp ?? r.block_timestamp ?? 0)),
			isToken: false,
			explorerUrl: `https://tronscan.org/#/transaction/${hash}`
		});
	}
	return out;
}
var adapters = {
	ethereum: ethereumAdapter,
	tron: {
		chain: "tron",
		displayName: "Tron",
		nativeSymbol: "TRX",
		validate: (address) => !validateAddress("tron", address),
		normalize: (address) => normalizeAddress("tron", address),
		display: (address) => address,
		async fetchHistory(address, limit) {
			const sources = [];
			const txs = [];
			const errors = [];
			const [trc20, trx] = await Promise.allSettled([fetchExplorerJson(`${TRONGRID}/v1/accounts/${address}/transactions/trc20?limit=${Math.min(limit, 50)}&only_confirmed=true`), fetchExplorerJson(`${TRONGRID}/v1/accounts/${address}/transactions?limit=${Math.min(limit, 30)}&only_confirmed=true`)]);
			if (trc20.status === "fulfilled") {
				txs.push(...fromTrc20(trc20.value, limit));
				sources.push("TronGrid TRC-20");
			} else errors.push(`TronGrid TRC20: ${trc20.reason instanceof Error ? trc20.reason.message : "fail"}`);
			if (trx.status === "fulfilled") {
				txs.push(...fromTrx(trx.value, limit));
				sources.push("TronGrid TRX");
			} else errors.push(`TronGrid TRX: ${trx.reason instanceof Error ? trx.reason.message : "fail"}`);
			const seen = /* @__PURE__ */ new Set();
			const unique = [];
			for (const tx of txs) {
				const key = `${tx.hash}:${tx.fromNorm}:${tx.toNorm}:${tx.symbol}`;
				if (seen.has(key)) continue;
				seen.add(key);
				unique.push(tx);
			}
			unique.sort((a, b) => b.timestamp - a.timestamp);
			if (unique.length === 0 && errors.length) throw new Error(`Tron APIs returned no usable transfers (${errors.join("; ")})`);
			return {
				txs: unique.slice(0, limit * 2),
				source: sources.join(" + ") || "tron-public-api",
				truncated: unique.length >= limit
			};
		}
	}
};
function getAdapter(chain) {
	const adapter = adapters[chain];
	if (!adapter) throw new Error(`No chain adapter registered for ${chain}`);
	return adapter;
}
var REL_POINTS = {
	high: 25,
	medium: 18,
	low: 10
};
function hopPoints(hop) {
	return {
		awarded: {
			0: 40,
			1: 35,
			2: 28,
			3: 20,
			4: 12,
			5: 6,
			6: 3
		}[hop] ?? 2,
		note: hop === 0 ? "Investigated wallet is itself a labelled VASP address." : `Nearest labelled address reached in ${hop} hop${hop === 1 ? "" : "s"}.`
	};
}
function riskPenalty(flags, pathSet) {
	let penalty = 0;
	const reasons = [];
	for (const flag of flags) {
		if (!(!flag.address || pathSet.has(flag.address.toLowerCase()) || pathSet.has(flag.address)) && flag.kind !== "high_fan_out" && flag.kind !== "high_fan_in") continue;
		if (flag.kind === "mixer" || flag.kind === "sanctioned") {
			penalty += 15;
			reasons.push(flag.title);
		} else if (flag.kind === "bridge") {
			penalty += 8;
			reasons.push(flag.title);
		} else if (flag.kind === "high_fan_out" || flag.kind === "high_fan_in") {
			penalty += 4;
			reasons.push(flag.title);
		}
	}
	const awarded = -Math.min(30, penalty);
	return {
		awarded,
		note: awarded === 0 ? "No path-level risk penalty applied." : `Penalty for: ${reasons.join("; ")}.`
	};
}
function scoreCandidate(input) {
	const prox = hopPoints(input.hopDistance);
	const bestRel = input.matched.reduce((acc, m) => {
		if (m.reliability === "high") return "high";
		if (m.reliability === "medium" && acc === "low") return "medium";
		return acc;
	}, "low");
	const relAward = REL_POINTS[bestRel];
	let consistency = 0;
	const consNotes = [];
	if (input.timestampsOrdered) {
		consistency += 10;
		consNotes.push("timestamps are time-ordered");
	}
	if (input.amountPlausible) {
		consistency += 8;
		consNotes.push("amounts are internally consistent");
	}
	if (input.outbound) {
		consistency += 2;
		consNotes.push("primary flow is outbound toward the VASP");
	}
	consistency = Math.min(20, consistency);
	const rec = Math.min(10, input.interactionCount >= 5 ? 10 : input.interactionCount >= 3 ? 8 : input.interactionCount >= 2 ? 6 : 3);
	const cluster = Math.min(5, input.matched.length >= 3 ? 5 : input.matched.length === 2 ? 3 : 1);
	const pathSet = new Set(input.path.map((p) => p.toLowerCase()));
	const risk = riskPenalty(input.flags, pathSet);
	const breakdown = {
		graphProximity: {
			awarded: prox.awarded,
			max: 40,
			note: prox.note
		},
		labelReliability: {
			awarded: relAward,
			max: 25,
			note: `Best label reliability on this cluster is ${bestRel} (${input.matched[0]?.source ?? "public label"}).`
		},
		txConsistency: {
			awarded: consistency,
			max: 20,
			note: consNotes.length ? consNotes.join("; ") : "Insufficient consistency evidence."
		},
		recurringInteraction: {
			awarded: rec,
			max: 10,
			note: `${input.interactionCount} connecting transfer(s) to this VASP cluster.`
		},
		clusterEvidence: {
			awarded: cluster,
			max: 5,
			note: `${input.matched.length} labelled address(es) of ${input.vaspName} on the path.`
		},
		riskPenalty: {
			awarded: risk.awarded,
			max: 0,
			note: risk.note
		}
	};
	const score = Math.max(0, Math.min(100, prox.awarded + relAward + consistency + rec + cluster + risk.awarded));
	const why = [];
	if (input.hopDistance === 0) why.push(`The investigated wallet is itself a labelled ${input.vaspName} address (${input.matched[0]?.label}).`);
	else why.push(`A labelled ${input.vaspName} address (${input.matched[0]?.label}) was reached within ${input.hopDistance} hop${input.hopDistance === 1 ? "" : "s"}.`);
	why.push(`${input.interactionCount} transaction${input.interactionCount === 1 ? "" : "s"} connect the investigated wallet/path to this labelled cluster.`);
	if (input.timestampsOrdered) why.push("Transaction timing along the traced path is consistent with a directed flow.");
	why.push(`The address label comes from ${input.matched[0]?.source ?? "the labelled dataset"} (${bestRel} reliability).`);
	if (!input.outbound && input.hopDistance > 0) why.push("The strongest link observed is inbound (funds received from the VASP), which is weaker evidence of a cash-out than an outbound deposit.");
	if (risk.awarded < 0) why.push(`Confidence is reduced because ${risk.note.replace(/^Penalty for: /, "").toLowerCase()}`);
	return {
		vaspId: input.vaspId,
		vaspName: input.vaspName,
		score,
		hopDistance: input.hopDistance,
		matchedAddresses: input.matched,
		interactionCount: input.interactionCount,
		path: input.path,
		sampleTxs: input.sampleTxs.slice(0, 8),
		breakdown,
		why,
		outbound: input.outbound
	};
}
function bandForScore(score, hasCandidate) {
	if (!hasCandidate || score === null) return "none";
	if (score >= 80) return "high";
	if (score >= 60) return "moderate";
	if (score >= 40) return "low";
	return "insufficient";
}
var DATASET_VERSION = "2026-09-17.1";
var DATASET_NOTES = "Public Etherscan nametags (blockchainanalysis.io compilation), TronScan/community exchange labels, Tornado Cash official contracts, well-known L2/bridge contracts. Not an exhaustive or certified attribution set.";
var SEED_VASPS = [
	{
		id: "binance",
		name: "Binance",
		category: "exchange",
		jurisdiction: "Global / Cayman / Dubai",
		website: "https://www.binance.com",
		notes: "Dominant cash-out rail in many South/Southeast Asian scam cases."
	},
	{
		id: "coinbase",
		name: "Coinbase",
		category: "exchange",
		jurisdiction: "United States",
		website: "https://www.coinbase.com",
		notes: "US-regulated VASP. Does not support TRC-20 USDT deposits."
	},
	{
		id: "kraken",
		name: "Kraken",
		category: "exchange",
		jurisdiction: "United States",
		website: "https://www.kraken.com",
		notes: "US-regulated VASP."
	},
	{
		id: "okx",
		name: "OKX",
		category: "exchange",
		jurisdiction: "Seychelles / Hong Kong",
		website: "https://www.okx.com",
		notes: "Major USDT cash-out venue."
	},
	{
		id: "kucoin",
		name: "KuCoin",
		category: "exchange",
		jurisdiction: "Seychelles",
		website: "https://www.kucoin.com",
		notes: ""
	},
	{
		id: "crypto_com",
		name: "Crypto.com",
		category: "exchange",
		jurisdiction: "Singapore / global",
		website: "https://crypto.com",
		notes: ""
	},
	{
		id: "gate_io",
		name: "Gate.io",
		category: "exchange",
		jurisdiction: "Cayman / Hong Kong",
		website: "https://www.gate.io",
		notes: ""
	},
	{
		id: "bybit",
		name: "Bybit",
		category: "exchange",
		jurisdiction: "Dubai / Singapore",
		website: "https://www.bybit.com",
		notes: ""
	},
	{
		id: "bitfinex",
		name: "Bitfinex",
		category: "exchange",
		jurisdiction: "British Virgin Islands",
		website: "https://www.bitfinex.com",
		notes: ""
	},
	{
		id: "gemini",
		name: "Gemini",
		category: "exchange",
		jurisdiction: "United States",
		website: "https://www.gemini.com",
		notes: ""
	},
	{
		id: "htx",
		name: "HTX (Huobi)",
		category: "exchange",
		jurisdiction: "Seychelles",
		website: "https://www.htx.com",
		notes: "Hot wallets rotate frequently; labels can go stale."
	},
	{
		id: "mexc",
		name: "MEXC",
		category: "exchange",
		jurisdiction: "Seychelles",
		website: "https://www.mexc.com",
		notes: ""
	},
	{
		id: "bitget",
		name: "Bitget",
		category: "exchange",
		jurisdiction: "Seychelles / Singapore",
		website: "https://www.bitget.com",
		notes: ""
	},
	{
		id: "bitstamp",
		name: "Bitstamp",
		category: "exchange",
		jurisdiction: "Luxembourg / EU",
		website: "https://www.bitstamp.net",
		notes: ""
	},
	{
		id: "bithumb",
		name: "Bithumb",
		category: "exchange",
		jurisdiction: "South Korea",
		website: "https://www.bithumb.com",
		notes: ""
	},
	{
		id: "ftx",
		name: "FTX (defunct)",
		category: "exchange",
		jurisdiction: "Estate / historical",
		website: "https://www.ftx.com",
		notes: "Defunct exchange. Historical labels only."
	},
	{
		id: "robinhood",
		name: "Robinhood",
		category: "exchange",
		jurisdiction: "United States",
		website: "https://robinhood.com",
		notes: "US broker-dealer / VASP."
	},
	{
		id: "bingx",
		name: "BingX",
		category: "exchange",
		jurisdiction: "Global",
		website: "https://bingx.com",
		notes: ""
	}
];
var ES = (addr) => `https://etherscan.io/address/${addr}`;
var TS = (addr) => `https://tronscan.org/#/address/${addr}`;
var SEED_ADDRESSES = [
	{
		vaspId: "binance",
		chain: "ethereum",
		address: "0x5a52e96bacdabb82fd05763e25335261b270efcb",
		label: "Binance 28",
		source: "Etherscan nametag",
		sourceUrl: ES("0x5a52e96bacdabb82fd05763e25335261b270efcb"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "binance",
		chain: "ethereum",
		address: "0x21a31ee1afc51d94c2efccaa2092ad1028285549",
		label: "Binance 15",
		source: "Etherscan nametag",
		sourceUrl: ES("0x21a31ee1afc51d94c2efccaa2092ad1028285549"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "binance",
		chain: "ethereum",
		address: "0x28c6c06298d514db089934071355e5743bf21d60",
		label: "Binance 14",
		source: "Etherscan nametag",
		sourceUrl: ES("0x28c6c06298d514db089934071355e5743bf21d60"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "binance",
		chain: "ethereum",
		address: "0x56eddb7aa87536c09ccc2793473599fd21a8b17f",
		label: "Binance 17",
		source: "Etherscan nametag",
		sourceUrl: ES("0x56eddb7aa87536c09ccc2793473599fd21a8b17f"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "binance",
		chain: "ethereum",
		address: "0xdfd5293d8e347dfe59e90efd55b2956a1343963d",
		label: "Binance 16",
		source: "Etherscan nametag",
		sourceUrl: ES("0xdfd5293d8e347dfe59e90efd55b2956a1343963d"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "binance",
		chain: "ethereum",
		address: "0xbe0eb53f46cd790cd13851d5eff43d12404d33e8",
		label: "Binance 7",
		source: "Etherscan nametag",
		sourceUrl: ES("0xbe0eb53f46cd790cd13851d5eff43d12404d33e8"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "binance",
		chain: "ethereum",
		address: "0xf977814e90da44bfa03b6295a0616a897441acec",
		label: "Binance Hot Wallet 20",
		source: "Etherscan nametag",
		sourceUrl: ES("0xf977814e90da44bfa03b6295a0616a897441acec"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "binance",
		chain: "ethereum",
		address: "0xa344c7ada83113b3b56941f6e85bf2eb425949f3",
		label: "Binance 27",
		source: "Etherscan nametag",
		sourceUrl: ES("0xa344c7ada83113b3b56941f6e85bf2eb425949f3"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "binance",
		chain: "ethereum",
		address: "0x00799bbc833d5b168f0410312d2a8fd9e0e3079c",
		label: "Binance 31",
		source: "Etherscan nametag",
		sourceUrl: ES("0x00799bbc833d5b168f0410312d2a8fd9e0e3079c"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "binance",
		chain: "ethereum",
		address: "0x06a0048079ec6571cd1b537418869cde6191d42d",
		label: "Binance 29",
		source: "Etherscan nametag",
		sourceUrl: ES("0x06a0048079ec6571cd1b537418869cde6191d42d"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "binance",
		chain: "ethereum",
		address: "0x141fef8cd8397a390afe94846c8bd6f4ab981c48",
		label: "Binance 32",
		source: "Etherscan nametag",
		sourceUrl: ES("0x141fef8cd8397a390afe94846c8bd6f4ab981c48"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "binance",
		chain: "ethereum",
		address: "0x2e581a5ae722207aa59acd3939771e7c7052dd3d",
		label: "Binance 25",
		source: "Etherscan nametag",
		sourceUrl: ES("0x2e581a5ae722207aa59acd3939771e7c7052dd3d"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "coinbase",
		chain: "ethereum",
		address: "0x71660c4005ba85c37ccec55d0c4493e66fe775d3",
		label: "Coinbase 1",
		source: "Etherscan nametag",
		sourceUrl: ES("0x71660c4005ba85c37ccec55d0c4493e66fe775d3"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "coinbase",
		chain: "ethereum",
		address: "0x503828976d22510aad0201ac7ec88293211d23da",
		label: "Coinbase 2",
		source: "Etherscan nametag",
		sourceUrl: ES("0x503828976d22510aad0201ac7ec88293211d23da"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "coinbase",
		chain: "ethereum",
		address: "0xddfabcdc4d8ffc6d5beaf154f18b778f892a0740",
		label: "Coinbase 3",
		source: "Etherscan nametag",
		sourceUrl: ES("0xddfabcdc4d8ffc6d5beaf154f18b778f892a0740"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "coinbase",
		chain: "ethereum",
		address: "0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43",
		label: "Coinbase 10",
		source: "Etherscan nametag",
		sourceUrl: ES("0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "kraken",
		chain: "ethereum",
		address: "0x2910543af39aba0cd09dbb2d50200b3e800a63d2",
		label: "Kraken",
		source: "Etherscan nametag",
		sourceUrl: ES("0x2910543af39aba0cd09dbb2d50200b3e800a63d2"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "kraken",
		chain: "ethereum",
		address: "0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0",
		label: "Kraken 4",
		source: "Etherscan nametag",
		sourceUrl: ES("0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "kraken",
		chain: "ethereum",
		address: "0x29728d0efd284d85187362faa2d4d76c2cfc2612",
		label: "Kraken 9",
		source: "Etherscan nametag",
		sourceUrl: ES("0x29728d0efd284d85187362faa2d4d76c2cfc2612"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "okx",
		chain: "ethereum",
		address: "0x6cc5f688a315f3dc28a7781717a9a798a59fda7b",
		label: "OKX",
		source: "Etherscan nametag",
		sourceUrl: ES("0x6cc5f688a315f3dc28a7781717a9a798a59fda7b"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "okx",
		chain: "ethereum",
		address: "0x236f9f97e0e62388479bf9e5ba4889e46b0273c3",
		label: "OKX 2",
		source: "Etherscan nametag",
		sourceUrl: ES("0x236f9f97e0e62388479bf9e5ba4889e46b0273c3"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "okx",
		chain: "ethereum",
		address: "0xa7efae728d2936e78bda97dc267687568dd593f3",
		label: "OKX 3",
		source: "Etherscan nametag",
		sourceUrl: ES("0xa7efae728d2936e78bda97dc267687568dd593f3"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "okx",
		chain: "ethereum",
		address: "0x2c8fbb630289363ac80705a1a61273f76fd5a161",
		label: "OKX 4",
		source: "Etherscan nametag",
		sourceUrl: ES("0x2c8fbb630289363ac80705a1a61273f76fd5a161"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "okx",
		chain: "ethereum",
		address: "0x461249076b88189f8ac9418de28b365859e46bfd",
		label: "OKX 9",
		source: "Etherscan nametag",
		sourceUrl: ES("0x461249076b88189f8ac9418de28b365859e46bfd"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "okx",
		chain: "ethereum",
		address: "0x42436286a9c8d63aafc2eebbca193064d68068f2",
		label: "OKX 11",
		source: "Etherscan nametag",
		sourceUrl: ES("0x42436286a9c8d63aafc2eebbca193064d68068f2"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "kucoin",
		chain: "ethereum",
		address: "0xd6216fc19db775df9774a6e33526131da7d19a2c",
		label: "KuCoin 6",
		source: "Etherscan nametag",
		sourceUrl: ES("0xd6216fc19db775df9774a6e33526131da7d19a2c"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "kucoin",
		chain: "ethereum",
		address: "0xf16e9b0d03470827a95cdfd0cb8a8a3b46969b91",
		label: "KuCoin 9",
		source: "Etherscan nametag",
		sourceUrl: ES("0xf16e9b0d03470827a95cdfd0cb8a8a3b46969b91"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "kucoin",
		chain: "ethereum",
		address: "0x738cf6903e6c4e699d1c2dd9ab8b67fcdb3121ea",
		label: "KuCoin 12",
		source: "Etherscan nametag",
		sourceUrl: ES("0x738cf6903e6c4e699d1c2dd9ab8b67fcdb3121ea"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "kucoin",
		chain: "ethereum",
		address: "0xec30d02f10353f8efc9601371f56e808751f396f",
		label: "KuCoin 11",
		source: "Etherscan nametag",
		sourceUrl: ES("0xec30d02f10353f8efc9601371f56e808751f396f"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "crypto_com",
		chain: "ethereum",
		address: "0x6262998ced04146fa42253a5c0af90ca02dfd2a3",
		label: "Crypto.com",
		source: "Etherscan nametag",
		sourceUrl: ES("0x6262998ced04146fa42253a5c0af90ca02dfd2a3"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "crypto_com",
		chain: "ethereum",
		address: "0x46340b20830761efd32832a74d7169b29feb9758",
		label: "Crypto.com 2",
		source: "Etherscan nametag",
		sourceUrl: ES("0x46340b20830761efd32832a74d7169b29feb9758"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "crypto_com",
		chain: "ethereum",
		address: "0x72a53cdbbcc1b9efa39c834a540550e23463aacb",
		label: "Crypto.com 3",
		source: "Etherscan nametag",
		sourceUrl: ES("0x72a53cdbbcc1b9efa39c834a540550e23463aacb"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "gate_io",
		chain: "ethereum",
		address: "0x0d0707963952f2fba59dd06f2b425ace40b492fe",
		label: "Gate.io",
		source: "Etherscan nametag",
		sourceUrl: ES("0x0d0707963952f2fba59dd06f2b425ace40b492fe"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "gate_io",
		chain: "ethereum",
		address: "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c",
		label: "Gate.io 3",
		source: "Etherscan nametag",
		sourceUrl: ES("0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "bybit",
		chain: "ethereum",
		address: "0xf89d7b9c864f589bbf53a82105107622b35eaa40",
		label: "Bybit Hot Wallet",
		source: "Etherscan nametag",
		sourceUrl: ES("0xf89d7b9c864f589bbf53a82105107622b35eaa40"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "bybit",
		chain: "ethereum",
		address: "0x1db92e2eebc8e0c075a02bea49a2935bcd2dfcf4",
		label: "Bybit Cold Wallet",
		source: "Etherscan nametag",
		sourceUrl: ES("0x1db92e2eebc8e0c075a02bea49a2935bcd2dfcf4"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "bitfinex",
		chain: "ethereum",
		address: "0x876eabf441b2ee5b5b0554fd502a8e0600950cfa",
		label: "Bitfinex 3",
		source: "Etherscan nametag",
		sourceUrl: ES("0x876eabf441b2ee5b5b0554fd502a8e0600950cfa"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "bitfinex",
		chain: "ethereum",
		address: "0x77134cbc06cb00b66f4c7e623d5fdbf6777635ec",
		label: "Bitfinex Hot Wallet",
		source: "Etherscan nametag",
		sourceUrl: ES("0x77134cbc06cb00b66f4c7e623d5fdbf6777635ec"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "gemini",
		chain: "ethereum",
		address: "0xd24400ae8bfebb18ca49be86258a3c749cf46853",
		label: "Gemini",
		source: "Etherscan nametag",
		sourceUrl: ES("0xd24400ae8bfebb18ca49be86258a3c749cf46853"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "gemini",
		chain: "ethereum",
		address: "0x6fc82a5fe25a5cdb58bc74600a40a69c065263f8",
		label: "Gemini 2",
		source: "Etherscan nametag",
		sourceUrl: ES("0x6fc82a5fe25a5cdb58bc74600a40a69c065263f8"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "htx",
		chain: "ethereum",
		address: "0xab5c66752a9e8167967685f1450532fb96d5d24f",
		label: "Huobi 1",
		source: "Etherscan nametag",
		sourceUrl: ES("0xab5c66752a9e8167967685f1450532fb96d5d24f"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "medium"
	},
	{
		vaspId: "htx",
		chain: "ethereum",
		address: "0x6748f50f686bfbca6fe8ad62b22228b87f31ff2b",
		label: "Huobi 2",
		source: "Etherscan nametag",
		sourceUrl: ES("0x6748f50f686bfbca6fe8ad62b22228b87f31ff2b"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "medium"
	},
	{
		vaspId: "htx",
		chain: "ethereum",
		address: "0xfa4b5be3f2f84f56703c42eb22142744e95a2c58",
		label: "Huobi 11",
		source: "Etherscan nametag",
		sourceUrl: ES("0xfa4b5be3f2f84f56703c42eb22142744e95a2c58"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "medium"
	},
	{
		vaspId: "htx",
		chain: "ethereum",
		address: "0x18916e1a2933cb349145a280473a5de8eb6630cb",
		label: "Huobi Deposit Funder 2",
		source: "Etherscan nametag",
		sourceUrl: ES("0x18916e1a2933cb349145a280473a5de8eb6630cb"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "medium"
	},
	{
		vaspId: "mexc",
		chain: "ethereum",
		address: "0x75e89d5979e4f6fba9f97c104c2f0afb3f1dcb88",
		label: "MEXC Hot Wallet",
		source: "Etherscan nametag",
		sourceUrl: ES("0x75e89d5979e4f6fba9f97c104c2f0afb3f1dcb88"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "bitget",
		chain: "ethereum",
		address: "0x97b9d2102a9a65a26e1ee82d59e42d1b73b68689",
		label: "Bitget Hot Wallet",
		source: "Etherscan nametag",
		sourceUrl: ES("0x97b9d2102a9a65a26e1ee82d59e42d1b73b68689"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "bitstamp",
		chain: "ethereum",
		address: "0x00bdb5699745f5b860228c8f939abf1b9ae374ed",
		label: "Bitstamp 1",
		source: "Etherscan nametag",
		sourceUrl: ES("0x00bdb5699745f5b860228c8f939abf1b9ae374ed"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "bithumb",
		chain: "ethereum",
		address: "0x3052cd6bf951449a984fe4b5a38b46aef9455c8e",
		label: "Bithumb 2",
		source: "Etherscan nametag",
		sourceUrl: ES("0x3052cd6bf951449a984fe4b5a38b46aef9455c8e"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "ftx",
		chain: "ethereum",
		address: "0xc098b2a3aa256d2140208c3de6543aaef5cd3a94",
		label: "FTX Exchange 2",
		source: "Etherscan nametag",
		sourceUrl: ES("0xc098b2a3aa256d2140208c3de6543aaef5cd3a94"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "medium"
	},
	{
		vaspId: "ftx",
		chain: "ethereum",
		address: "0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2",
		label: "FTX Exchange",
		source: "Etherscan nametag",
		sourceUrl: ES("0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "medium"
	},
	{
		vaspId: "robinhood",
		chain: "ethereum",
		address: "0x40b38765696e3d5d8d9d834d8aad4bb6e418e489",
		label: "Robinhood",
		source: "Etherscan nametag",
		sourceUrl: ES("0x40b38765696e3d5d8d9d834d8aad4bb6e418e489"),
		verificationStatus: "public_nametag",
		verifiedAt: "2026-09-13",
		reliability: "high"
	},
	{
		vaspId: "binance",
		chain: "tron",
		address: "TDqSquXBgUCLYvYC4XZgrprLK589dkhSCf",
		label: "Binance-Hot",
		source: "Public Tron USDT flow labels (StableScan / TronScan tags)",
		sourceUrl: TS("TDqSquXBgUCLYvYC4XZgrprLK589dkhSCf"),
		verificationStatus: "public_label",
		verifiedAt: "2026-09-17",
		reliability: "high"
	},
	{
		vaspId: "okx",
		chain: "tron",
		address: "TLaGjwhvA8XQYSxFAcAXy7Dvuue9eGYitv",
		label: "OKX Hot Wallet",
		source: "Public Tron USDT flow labels (StableScan)",
		sourceUrl: TS("TLaGjwhvA8XQYSxFAcAXy7Dvuue9eGYitv"),
		verificationStatus: "public_label",
		verifiedAt: "2026-09-17",
		reliability: "high"
	},
	{
		vaspId: "kraken",
		chain: "tron",
		address: "TG2CMGxnTPgQ6V58kiKd7wbyN8ewtAmY76",
		label: "Kraken Hot Wallet",
		source: "Public Tron USDT flow labels (StableScan)",
		sourceUrl: TS("TG2CMGxnTPgQ6V58kiKd7wbyN8ewtAmY76"),
		verificationStatus: "public_label",
		verifiedAt: "2026-09-17",
		reliability: "high"
	},
	{
		vaspId: "bybit",
		chain: "tron",
		address: "TKFvdC4UC1vtCoHZgn8eviK34kormXaqJ7",
		label: "Bybit",
		source: "Community Tron exchange label list",
		sourceUrl: TS("TKFvdC4UC1vtCoHZgn8eviK34kormXaqJ7"),
		verificationStatus: "community_label",
		verifiedAt: "2026-09-17",
		reliability: "medium"
	},
	{
		vaspId: "bybit",
		chain: "tron",
		address: "TU4vEruvZwLLkSfV9bNw12EJTPvNr7Pvaa",
		label: "Bybit",
		source: "Community Tron exchange label list",
		sourceUrl: TS("TU4vEruvZwLLkSfV9bNw12EJTPvNr7Pvaa"),
		verificationStatus: "community_label",
		verifiedAt: "2026-09-17",
		reliability: "medium"
	},
	{
		vaspId: "htx",
		chain: "tron",
		address: "TNaRAoLUyYEV2uF7GUrzSjRQTU8v5ZJ5VR",
		label: "HTX 1",
		source: "Community Tron exchange label list",
		sourceUrl: TS("TNaRAoLUyYEV2uF7GUrzSjRQTU8v5ZJ5VR"),
		verificationStatus: "community_label",
		verifiedAt: "2026-09-17",
		reliability: "medium"
	},
	{
		vaspId: "htx",
		chain: "tron",
		address: "TDvf1dSBhR7dEskJs17HxGHheJrjXhiFyM",
		label: "HTX 2",
		source: "Community Tron exchange label list",
		sourceUrl: TS("TDvf1dSBhR7dEskJs17HxGHheJrjXhiFyM"),
		verificationStatus: "community_label",
		verifiedAt: "2026-09-17",
		reliability: "medium"
	},
	{
		vaspId: "htx",
		chain: "tron",
		address: "TYh6mgoMNZTCsgpYHBz7gttEfrQmDMABub",
		label: "HTX Exchange",
		source: "Community Tron exchange label list",
		sourceUrl: TS("TYh6mgoMNZTCsgpYHBz7gttEfrQmDMABub"),
		verificationStatus: "community_label",
		verifiedAt: "2026-09-17",
		reliability: "medium"
	},
	{
		vaspId: "bitget",
		chain: "tron",
		address: "TFrRVZFoHty7scd2a1q6BDxPU5fyqiB4iR",
		label: "Bitget 1",
		source: "Community Tron exchange label list",
		sourceUrl: TS("TFrRVZFoHty7scd2a1q6BDxPU5fyqiB4iR"),
		verificationStatus: "community_label",
		verifiedAt: "2026-09-17",
		reliability: "medium"
	},
	{
		vaspId: "bitget",
		chain: "tron",
		address: "TYiQTHtgLo6KX6hYgbKLJsTbWK5hu9X5MG",
		label: "Bitget 2",
		source: "Community Tron exchange label list",
		sourceUrl: TS("TYiQTHtgLo6KX6hYgbKLJsTbWK5hu9X5MG"),
		verificationStatus: "community_label",
		verifiedAt: "2026-09-17",
		reliability: "medium"
	},
	{
		vaspId: "bitfinex",
		chain: "tron",
		address: "TXFBqBbqJommqZf7BV8NNYzePh97UmJodJ",
		label: "Bitfinex",
		source: "Community Tron exchange label list",
		sourceUrl: TS("TXFBqBbqJommqZf7BV8NNYzePh97UmJodJ"),
		verificationStatus: "community_label",
		verifiedAt: "2026-09-17",
		reliability: "medium"
	},
	{
		vaspId: "bithumb",
		chain: "tron",
		address: "TAbcGmwrQVT4A8pwEExxQvkW8hYqtvkC1h",
		label: "Bithumb 1",
		source: "Community Tron exchange label list",
		sourceUrl: TS("TAbcGmwrQVT4A8pwEExxQvkW8hYqtvkC1h"),
		verificationStatus: "community_label",
		verifiedAt: "2026-09-17",
		reliability: "medium"
	},
	{
		vaspId: "bingx",
		chain: "tron",
		address: "TMmQat2hx5D4zcnnPAHYLy2A4o4otzf1sG",
		label: "BingX",
		source: "Community Tron exchange label list",
		sourceUrl: TS("TMmQat2hx5D4zcnnPAHYLy2A4o4otzf1sG"),
		verificationStatus: "community_label",
		verifiedAt: "2026-09-17",
		reliability: "medium"
	}
];
var SEED_RISK = [
	{
		chain: "ethereum",
		address: "0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc",
		entityType: "mixer",
		name: "Tornado Cash 0.1 ETH pool",
		source: "Tornado Cash official docs",
		sourceUrl: "https://docs.tornado.cash/general/tornado-cash-smart-contracts",
		notes: "Mixer contract. OFAC-designated 2022, delisted Mar 2025. Still treated as obfuscation infrastructure."
	},
	{
		chain: "ethereum",
		address: "0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2936",
		entityType: "mixer",
		name: "Tornado Cash 1 ETH pool",
		source: "Tornado Cash official docs",
		sourceUrl: "https://docs.tornado.cash/general/tornado-cash-smart-contracts",
		notes: "Mixer contract."
	},
	{
		chain: "ethereum",
		address: "0x910cbd523d972eb0a6f4cae4618ad62622b39dbf",
		entityType: "mixer",
		name: "Tornado Cash 10 ETH pool",
		source: "Tornado Cash official docs",
		sourceUrl: "https://docs.tornado.cash/general/tornado-cash-smart-contracts",
		notes: "Mixer contract."
	},
	{
		chain: "ethereum",
		address: "0xa160cdab225685da1d56aa342ad8841c3b53f291",
		entityType: "mixer",
		name: "Tornado Cash 100 ETH pool",
		source: "Tornado Cash official docs",
		sourceUrl: "https://docs.tornado.cash/general/tornado-cash-smart-contracts",
		notes: "Mixer contract."
	},
	{
		chain: "ethereum",
		address: "0xd90e2f925da726b50c4ed8d0fb90ad053324f31b",
		entityType: "mixer",
		name: "Tornado Cash router",
		source: "OFAC SDN identifier list (2022 designation)",
		sourceUrl: "https://www.chainalysis.com/blog/tornado-cash-ofac-designation-sanctions/",
		notes: "Router. Delisted from SDN Mar 2025; still a mixer risk flag."
	},
	{
		chain: "ethereum",
		address: "0x722122df12d4e14e13ac3b6895a86e84145b6967",
		entityType: "mixer",
		name: "Tornado Cash proxy",
		source: "OFAC SDN identifier list (2022 designation)",
		sourceUrl: "https://www.chainalysis.com/blog/tornado-cash-ofac-designation-sanctions/",
		notes: "Mixer-related contract."
	},
	{
		chain: "ethereum",
		address: "0xd4b88df4d29f5cedd6857912842cff3b20c8cfa3",
		entityType: "mixer",
		name: "Tornado Cash 100 DAI pool",
		source: "Tornado Cash official docs",
		sourceUrl: "https://docs.tornado.cash/general/tornado-cash-smart-contracts",
		notes: "Mixer contract."
	},
	{
		chain: "ethereum",
		address: "0xa0c68c638235ee32657e8f720a23cec1bfc77c77",
		entityType: "bridge",
		name: "Polygon PoS Bridge",
		source: "Etherscan nametag / Polygon docs",
		sourceUrl: ES("0xa0c68c638235ee32657e8f720a23cec1bfc77c77"),
		notes: "Cross-chain bridge. Path continuity across chains is not followed in MVP."
	},
	{
		chain: "ethereum",
		address: "0x99c9fc46f92e8a1c0dec1b1747d010903e884be1",
		entityType: "bridge",
		name: "Optimism Gateway",
		source: "Etherscan nametag / Optimism docs",
		sourceUrl: ES("0x99c9fc46f92e8a1c0dec1b1747d010903e884be1"),
		notes: "L2 bridge."
	},
	{
		chain: "ethereum",
		address: "0x4dbd4fc535ac27206064b68ffcf827b0a60bab3f",
		entityType: "bridge",
		name: "Arbitrum Delayed Inbox",
		source: "Arbitrum docs / Etherscan",
		sourceUrl: ES("0x4dbd4fc535ac27206064b68ffcf827b0a60bab3f"),
		notes: "L2 bridge inbox."
	},
	{
		chain: "ethereum",
		address: "0x3ee18b2214aff97000d974cf647e7c347e8fa585",
		entityType: "bridge",
		name: "Wormhole Token Bridge",
		source: "Wormhole docs / Etherscan",
		sourceUrl: ES("0x3ee18b2214aff97000d974cf647e7c347e8fa585"),
		notes: "Cross-chain token bridge."
	},
	{
		chain: "ethereum",
		address: "0x8731d54e9d02c286767d56ac03e8037c07e01e98",
		entityType: "bridge",
		name: "Stargate Router",
		source: "Stargate docs / Etherscan",
		sourceUrl: ES("0x8731d54e9d02c286767d56ac03e8037c07e01e98"),
		notes: "Cross-chain liquidity bridge."
	}
];
var CACHE_MS = 216e5;
var MAX_EXPAND = 22;
var MAX_TX_PER_NODE = 40;
var MAX_NEIGHBORS = 8;
var DEADLINE_MS = 22e3;
var FETCH_CONCURRENCY = 3;
var rateBucket = { stamps: [] };
async function mapPool(items, limit, fn) {
	if (!items.length) return [];
	const out = new Array(items.length);
	let cursor = 0;
	async function worker() {
		while (cursor < items.length) {
			const idx = cursor;
			cursor += 1;
			const item = items[idx];
			if (item === void 0) continue;
			out[idx] = await fn(item);
		}
	}
	const n = Math.min(limit, items.length);
	await Promise.all(Array.from({ length: n }, () => worker()));
	return out;
}
function classifyGap(err, address) {
	const message = err instanceof Error ? err.message : "error";
	const code = message.match(/HTTP (\d+)/)?.[1];
	const rateLimited = code === "429" || code === "503";
	return {
		provider: message.includes("TronGrid") ? "TronGrid" : message.includes("Blockscout") ? "Blockscout" : "Ethplorer / Blockscout",
		code,
		address,
		detail: rateLimited ? "The explorer rate-limited this request. Attribution used transfers already retrieved." : "Some transfer data could not be retrieved from the current provider."
	};
}
function rateLimitOk() {
	const now = Date.now();
	rateBucket.stamps = rateBucket.stamps.filter((t) => now - t < 6e5);
	if (rateBucket.stamps.length >= 10) return false;
	rateBucket.stamps.push(now);
	return true;
}
async function ensureSeed() {
	const sql = await getSql();
	if (((await sql`select count(*)::int as n from vasps`)[0]?.n ?? 0) > 0) return;
	for (const v of SEED_VASPS) await sql`
      insert into vasps (id, name, category, jurisdiction, website, notes)
      values (${v.id}, ${v.name}, ${v.category}, ${v.jurisdiction}, ${v.website}, ${v.notes})
      on conflict (id) do nothing
    `;
	for (const a of SEED_ADDRESSES) {
		const norm = a.chain === "ethereum" ? a.address.toLowerCase() : a.address;
		await sql`
      insert into vasp_addresses (
        vasp_id, chain, address, address_norm, label, source, source_url,
        verification_status, verified_at, reliability
      ) values (
        ${a.vaspId}, ${a.chain}, ${a.address}, ${norm}, ${a.label}, ${a.source}, ${a.sourceUrl},
        ${a.verificationStatus}, ${a.verifiedAt}, ${a.reliability}
      )
      on conflict (chain, address_norm) do nothing
    `;
	}
	for (const r of SEED_RISK) {
		const norm = r.chain === "ethereum" ? r.address.toLowerCase() : r.address;
		await sql`
      insert into risk_entities (
        chain, address, address_norm, entity_type, name, source, source_url, notes
      ) values (
        ${r.chain}, ${r.address}, ${norm}, ${r.entityType}, ${r.name}, ${r.source}, ${r.sourceUrl}, ${r.notes}
      )
      on conflict (chain, address_norm) do nothing
    `;
	}
	await sql`
    insert into dataset_meta (id, version, updated_at, notes)
    values ('labels', ${DATASET_VERSION}, now(), ${DATASET_NOTES})
    on conflict (id) do update set version = excluded.version, notes = excluded.notes, updated_at = now()
  `;
}
async function loadLabels(chain) {
	const rows = await (await getSql())`
    select a.vasp_id, v.name as vasp_name, a.chain, a.address, a.address_norm, a.label,
           a.source, a.source_url, a.verification_status, a.verified_at::text, a.reliability
    from vasp_addresses a
    join vasps v on v.id = a.vasp_id
    where a.chain = ${chain}
  `;
	const map = /* @__PURE__ */ new Map();
	for (const r of rows) map.set(r.address_norm, {
		vaspId: r.vasp_id,
		vaspName: r.vasp_name,
		chain: r.chain,
		address: r.address,
		addressNorm: r.address_norm,
		label: r.label,
		source: r.source,
		sourceUrl: r.source_url,
		verificationStatus: r.verification_status,
		verifiedAt: r.verified_at,
		reliability: r.reliability
	});
	return map;
}
async function loadRisk(chain) {
	const rows = await (await getSql())`
    select chain, address, address_norm, entity_type, name, source, source_url, notes
    from risk_entities where chain = ${chain}
  `;
	const map = /* @__PURE__ */ new Map();
	for (const r of rows) map.set(r.address_norm, {
		chain: r.chain,
		address: r.address,
		addressNorm: r.address_norm,
		entityType: r.entity_type,
		name: r.name,
		source: r.source,
		sourceUrl: r.source_url,
		notes: r.notes
	});
	return map;
}
async function cachedHistory(chain, addressNorm, fetcher) {
	const sql = await getSql();
	const row = (await sql`
    select payload_json, source, fetched_at::text from tx_cache
    where chain = ${chain} and address_norm = ${addressNorm}
  `)[0];
	if (row) {
		const age = Date.now() - new Date(row.fetched_at).getTime();
		if (age >= 0 && age < CACHE_MS) {
			const parsed = JSON.parse(row.payload_json);
			return {
				txs: parsed.txs,
				source: `${row.source} (cached)`,
				truncated: parsed.truncated,
				cached: true
			};
		}
	}
	const fresh = await fetcher();
	await sql`
    insert into tx_cache (chain, address_norm, payload_json, source, fetched_at)
    values (${chain}, ${addressNorm}, ${JSON.stringify({
		txs: fresh.txs,
		truncated: fresh.truncated
	})}, ${fresh.source}, now())
    on conflict (chain, address_norm) do update
      set payload_json = excluded.payload_json, source = excluded.source, fetched_at = now()
  `;
	return {
		...fresh,
		cached: false
	};
}
function counterpart(tx, self) {
	if (tx.fromNorm === self && tx.toNorm !== self) return {
		addr: tx.to,
		norm: tx.toNorm,
		outbound: true
	};
	if (tx.toNorm === self && tx.fromNorm !== self) return {
		addr: tx.from,
		norm: tx.fromNorm,
		outbound: false
	};
	return null;
}
function amountNumber(tx) {
	const n = Number(tx.amountDisplay.split(" ")[0]);
	return Number.isFinite(n) ? n : 0;
}
async function runAttribution(input) {
	const started = Date.now();
	await ensureSeed();
	const chain = input.chain;
	const hopCap = clampHopCap(input.hopCap);
	const caseId = sanitizeCaseId(input.caseId);
	const formatError = validateAddress(chain, input.wallet);
	if (formatError) return errorResult(input, hopCap, caseId, started, formatError, "empty");
	if (!rateLimitOk()) return errorResult(input, hopCap, caseId, started, "Analysis rate limit reached. Wait a few minutes and retry.", "empty");
	const adapter = getAdapter(chain);
	const wallet = adapter.display(input.wallet.trim());
	const walletNorm = adapter.normalize(wallet);
	const labels = await loadLabels(chain);
	const risks = await loadRisk(chain);
	const meta = await (await getSql())`
    select version, updated_at::text from dataset_meta where id = 'labels'
  `;
	const nodes = /* @__PURE__ */ new Map();
	const edges = [];
	const visited = /* @__PURE__ */ new Set();
	const hopOf = /* @__PURE__ */ new Map();
	const parent = /* @__PURE__ */ new Map();
	const sourcesUsed = /* @__PURE__ */ new Set();
	const flags = [];
	const dataGaps = [];
	let txsAnalyzed = 0;
	let completeness = "full";
	const completenessNotes = [];
	let expanded = 0;
	let rateLimitedStops = 0;
	function roleFor(norm) {
		const isVasp = labels.has(norm);
		const isRisk = risks.has(norm);
		if (isVasp && isRisk) return "both";
		if (isVasp) return "vasp";
		if (isRisk) return "risk";
		return "intermediate";
	}
	function upsertNode(address, norm, hop) {
		const existing = nodes.get(norm);
		if (existing) {
			existing.hop = Math.min(existing.hop, hop);
			return existing;
		}
		const lab = labels.get(norm);
		const risk = risks.get(norm);
		const node = {
			id: norm,
			address,
			addressNorm: norm,
			hop,
			role: hop === 0 && !lab && !risk ? "unknown_wallet" : roleFor(norm),
			label: lab?.label ?? risk?.name ?? null,
			vaspId: lab?.vaspId ?? null,
			vaspName: lab?.vaspName ?? null,
			reliability: lab?.reliability ?? null,
			source: lab?.source ?? risk?.source ?? null,
			sourceUrl: lab?.sourceUrl ?? risk?.sourceUrl ?? null,
			txCount: 0,
			fanOut: 0,
			fanIn: 0
		};
		nodes.set(norm, node);
		return node;
	}
	upsertNode(wallet, walletNorm, 0);
	hopOf.set(walletNorm, 0);
	parent.set(walletNorm, null);
	const queue = [walletNorm];
	const addressOf = /* @__PURE__ */ new Map([[walletNorm, wallet]]);
	async function expandNode(current) {
		const hop = hopOf.get(current) ?? 0;
		const addr = addressOf.get(current) ?? current;
		try {
			const hist = await cachedHistory(chain, current, () => adapter.fetchHistory(addr, MAX_TX_PER_NODE));
			sourcesUsed.add(hist.source.replace(" (cached)", ""));
			const node = nodes.get(current);
			if (node) node.txCount = hist.txs.length;
			txsAnalyzed += hist.txs.length;
			if (hist.truncated) {
				completeness = "partial";
				completenessNotes.push(`Transfer list for ${addr.slice(0, 8)}… was truncated by the explorer API.`);
			}
			const neighbors = [];
			const seenN = /* @__PURE__ */ new Set();
			let fanOut = 0;
			let fanIn = 0;
			for (const tx of hist.txs) {
				const c = counterpart(tx, current);
				if (!c) continue;
				if (c.outbound) fanOut += 1;
				else fanIn += 1;
				neighbors.push({
					...c,
					tx
				});
				if (!seenN.has(c.norm)) seenN.add(c.norm);
			}
			if (node) {
				node.fanOut = fanOut;
				node.fanIn = fanIn;
			}
			if (seenN.size >= 40) flags.push({
				kind: fanOut >= fanIn ? "high_fan_out" : "high_fan_in",
				severity: "medium",
				title: fanOut >= fanIn ? "High fan-out address" : "High fan-in address",
				detail: `${addr} interacted with ${seenN.size} counterparties in the retrieved window. This pattern is common for exchange hot wallets, mixers, or pass-through contracts.`,
				address: addr
			});
			const ranked = [...neighbors].sort((a, b) => {
				if (a.outbound !== b.outbound) return a.outbound ? -1 : 1;
				return amountNumber(b.tx) - amountNumber(a.tx);
			});
			const picked = [];
			const pickedNorm = /* @__PURE__ */ new Set();
			for (const n of ranked) {
				if (pickedNorm.has(n.norm)) continue;
				if (pickedNorm.size >= MAX_NEIGHBORS) continue;
				pickedNorm.add(n.norm);
				picked.push(n);
			}
			const edgeSeen = /* @__PURE__ */ new Set();
			for (const n of ranked) {
				const key = `${n.tx.hash}:${n.tx.fromNorm}:${n.tx.toNorm}`;
				if (edgeSeen.has(key)) continue;
				edgeSeen.add(key);
				if (!nodes.has(n.norm) && !pickedNorm.has(n.norm) && !labels.has(n.norm) && !risks.has(n.norm)) continue;
				if (!nodes.has(n.norm) && (labels.has(n.norm) || risks.has(n.norm))) upsertNode(n.addr, n.norm, hop + 1);
				if (!nodes.has(n.norm) && pickedNorm.has(n.norm)) upsertNode(n.addr, n.norm, hop + 1);
				if (!nodes.has(n.norm)) continue;
				edges.push({
					id: key,
					from: n.tx.from,
					to: n.tx.to,
					fromNorm: n.tx.fromNorm,
					toNorm: n.tx.toNorm,
					txHash: n.tx.hash,
					amountDisplay: n.tx.amountDisplay,
					symbol: n.tx.symbol,
					timestamp: n.tx.timestamp,
					isToken: n.tx.isToken,
					explorerUrl: n.tx.explorerUrl
				});
			}
			const next = [];
			for (const n of picked) {
				addressOf.set(n.norm, n.addr);
				const nextHop = hop + 1;
				if (!hopOf.has(n.norm) || (hopOf.get(n.norm) ?? 99) > nextHop) {
					hopOf.set(n.norm, nextHop);
					parent.set(n.norm, current);
					upsertNode(n.addr, n.norm, nextHop);
				}
				if (!visited.has(n.norm) && nextHop <= hopCap) next.push(n.norm);
			}
			return next;
		} catch (err) {
			completeness = nodes.size <= 1 ? "empty" : "partial";
			const gap = classifyGap(err, addr);
			dataGaps.push(gap);
			completenessNotes.push(`${gap.detail} Address ${addr.slice(0, 10)}…${gap.code ? ` (${gap.provider} HTTP ${gap.code})` : ""}.`);
			if (gap.code === "429" || gap.code === "503") rateLimitedStops += 1;
			return [];
		}
	}
	while (queue.length && expanded < MAX_EXPAND && Date.now() - started < DEADLINE_MS) {
		if (rateLimitedStops >= 3) {
			completeness = "partial";
			completenessNotes.push("Stopped expanding further because the explorer is rate-limiting. Attribution used the graph already retrieved.");
			break;
		}
		const batch = [];
		while (queue.length && batch.length < FETCH_CONCURRENCY && expanded + batch.length < MAX_EXPAND) {
			const current = queue.shift();
			if (!current || visited.has(current)) continue;
			const hop = hopOf.get(current) ?? 0;
			const lab = labels.get(current);
			const risk = risks.get(current);
			if (hop > 0 && lab) continue;
			if (risk && (risk.entityType === "mixer" || risk.entityType === "sanctioned")) continue;
			if (hop >= hopCap) continue;
			visited.add(current);
			batch.push(current);
		}
		if (!batch.length) break;
		expanded += batch.length;
		const nextLists = await mapPool(batch, FETCH_CONCURRENCY, expandNode);
		for (const next of nextLists) for (const n of next) if (!visited.has(n)) queue.push(n);
	}
	if (Date.now() - started >= DEADLINE_MS) {
		completeness = nodes.size <= 1 ? "empty" : "partial";
		completenessNotes.push("Traversal stopped at the time budget to stay within explorer rate limits.");
	}
	for (const [norm, node] of nodes) {
		const risk = risks.get(norm);
		if (!risk) continue;
		const kind = risk.entityType === "bridge" ? "bridge" : risk.entityType === "mixer" ? "mixer" : "sanctioned";
		flags.push({
			kind,
			severity: kind === "bridge" ? "medium" : "high",
			title: risk.name,
			detail: `${risk.name} (${risk.entityType}) labelled from ${risk.source}. ${risk.notes ?? ""}`.trim(),
			address: node.address
		});
	}
	const candidates = buildCandidates(walletNorm, nodes, edges, labels, flags, parent);
	candidates.sort((a, b) => b.score - a.score || a.hopDistance - b.hopDistance);
	const top = candidates[0] ?? null;
	const usable = top && top.score >= 40 ? top : null;
	const band = bandForScore(usable?.score ?? top?.score ?? null, Boolean(top));
	const status = completeness === "empty" && nodes.size <= 1 ? "error" : usable ? "complete" : "inconclusive";
	const limitations = [
		LEAD_NOT_PROOF,
		HEURISTIC_DISCLAIMER,
		"Label coverage is partial. A missing match does not prove the wallet is unhosted.",
		"MVP traces Ethereum and Tron only. Cross-chain hops after a bridge are not followed.",
		"Public explorer APIs may truncate history; deep or high-fan-out paths can be incomplete.",
		"The system does not identify a beneficial owner's real-world identity."
	];
	const result = {
		traceId: crypto.randomUUID(),
		caseId,
		wallet,
		walletNorm,
		chain,
		hopCap,
		status,
		dataSource: [...sourcesUsed].join(" · ") || "no-data",
		completeness,
		completenessNote: completenessNotes.join(" ") || "Retrieved transfer set used as-is.",
		dataGaps,
		datasetVersion: meta[0]?.version ?? "2026-09-17.1",
		datasetUpdatedAt: meta[0]?.updated_at ?? null,
		attributed: usable,
		candidates: candidates.slice(0, 6),
		confidenceBand: usable ? band : top ? "insufficient" : "none",
		heuristicDisclaimer: HEURISTIC_DISCLAIMER,
		nodes: [...nodes.values()].sort((a, b) => a.hop - b.hop),
		edges,
		riskFlags: dedupeFlags(flags),
		txsAnalyzed,
		addressesVisited: nodes.size,
		elapsedMs: Date.now() - started,
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		reviewDecision: "pending",
		limitations,
		error: status === "error" ? completenessNotes[0] || "No blockchain transfers could be retrieved for this wallet." : void 0
	};
	try {
		await persistTrace(result);
	} catch (err) {
		console.error("[vasptrace] persist failed", err);
	}
	return result;
}
function reconstructPath(norm, parent) {
	const path = [];
	let cur = norm;
	const guard = /* @__PURE__ */ new Set();
	while (cur && !guard.has(cur)) {
		guard.add(cur);
		path.push(cur);
		cur = parent.get(cur) ?? null;
	}
	return path.reverse();
}
function buildCandidates(seed, nodes, edges, labels, flags, parent) {
	const grouped = /* @__PURE__ */ new Map();
	for (const [norm, lab] of labels) {
		if (!nodes.has(norm)) continue;
		const list = grouped.get(lab.vaspId) ?? [];
		list.push(lab);
		grouped.set(lab.vaspId, list);
	}
	const out = [];
	for (const [vaspId, matched] of grouped) {
		const hops = matched.map((m) => nodes.get(m.addressNorm)?.hop ?? 99);
		const hopDistance = Math.min(...hops);
		const nearest = matched.filter((m) => (nodes.get(m.addressNorm)?.hop ?? 99) === hopDistance);
		const norms = new Set(matched.map((m) => m.addressNorm));
		const connecting = edges.filter((e) => norms.has(e.fromNorm) || norms.has(e.toNorm));
		const outbound = connecting.some((e) => norms.has(e.toNorm) && !norms.has(e.fromNorm));
		const path = reconstructPath(nearest[0]?.addressNorm ?? matched[0].addressNorm, parent);
		if (path[0] !== seed && hopDistance > 0) path.unshift(seed);
		const timestamps = connecting.map((e) => e.timestamp).filter(Boolean).sort((a, b) => a - b);
		const timestampsOrdered = timestamps.length < 2 || timestamps.every((t, i) => i === 0 || t >= timestamps[i - 1] - 120);
		out.push(scoreCandidate({
			vaspId,
			vaspName: matched[0].vaspName,
			hopDistance,
			matched,
			interactionCount: connecting.length,
			path,
			sampleTxs: connecting,
			outbound: outbound || hopDistance === 0,
			flags,
			timestampsOrdered,
			amountPlausible: connecting.length > 0
		}));
	}
	return out;
}
function dedupeFlags(flags) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const f of flags) {
		const key = `${f.kind}:${f.address ?? f.title}`;
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(f);
	}
	return out;
}
function errorResult(input, hopCap, caseId, started, message, completeness) {
	return {
		traceId: crypto.randomUUID(),
		caseId,
		wallet: input.wallet,
		walletNorm: input.wallet,
		chain: input.chain,
		hopCap,
		status: "error",
		dataSource: "none",
		completeness,
		completenessNote: message,
		dataGaps: [],
		datasetVersion: DATASET_VERSION,
		datasetUpdatedAt: null,
		attributed: null,
		candidates: [],
		confidenceBand: "none",
		heuristicDisclaimer: HEURISTIC_DISCLAIMER,
		nodes: [],
		edges: [],
		riskFlags: [],
		txsAnalyzed: 0,
		addressesVisited: 0,
		elapsedMs: Date.now() - started,
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		reviewDecision: "pending",
		limitations: [LEAD_NOT_PROOF],
		error: message
	};
}
async function persistTrace(result) {
	const sql = await getSql();
	if (result.caseId) await sql`
      insert into cases (id, title, status)
      values (${result.caseId}, ${"Case " + result.caseId}, 'open')
      on conflict (id) do nothing
    `;
	await sql`
    insert into traces (
      id, case_id, wallet_address, wallet_norm, chain, hop_cap, status, dataset_version,
      data_source, completeness, attributed_vasp_id, confidence_score, confidence_band,
      review_decision, result_json
    ) values (
      ${result.traceId}, ${result.caseId}, ${result.wallet}, ${result.walletNorm}, ${result.chain},
      ${result.hopCap}, ${result.status}, ${result.datasetVersion}, ${result.dataSource},
      ${result.completeness}, ${result.attributed?.vaspId ?? null}, ${result.attributed?.score ?? null},
      ${result.confidenceBand}, ${result.reviewDecision}, ${JSON.stringify(result)}
    )
  `;
	for (const n of result.nodes) await sql`
      insert into trace_nodes (trace_id, address, address_norm, hop, role, label, vasp_id, tx_count)
      values (${result.traceId}, ${n.address}, ${n.addressNorm}, ${n.hop}, ${n.role}, ${n.label}, ${n.vaspId}, ${n.txCount})
    `;
	const edgeSlice = result.edges.slice(0, 400);
	for (let i = 0; i < edgeSlice.length; i += 8) await Promise.all(edgeSlice.slice(i, i + 8).map((e) => sql`
      insert into trace_edges (trace_id, from_address, to_address, tx_hash, amount_display, symbol, timestamp_unix, is_token)
      values (${result.traceId}, ${e.from}, ${e.to}, ${e.txHash}, ${e.amountDisplay}, ${e.symbol}, ${e.timestamp}, ${e.isToken})
    `));
	for (let i = 0; i < result.candidates.length; i += 1) {
		const c = result.candidates[i];
		if (!c) continue;
		await sql`
      insert into predictions (trace_id, vasp_id, vasp_name, score, hop_distance, ranked, breakdown_json)
      values (${result.traceId}, ${c.vaspId}, ${c.vaspName}, ${c.score}, ${c.hopDistance}, ${i + 1}, ${JSON.stringify(c.breakdown)})
    `;
	}
	await sql`
    insert into audit_logs (action, target_id, detail)
    values (${"analyze"}, ${result.traceId}, ${`${result.chain} ${result.walletNorm} status=${result.status}`})
  `;
}
async function loadTrace(id) {
	await ensureSeed();
	const rows = await (await getSql())`
    select result_json, review_decision from traces where id = ${id}
  `;
	if (!rows[0]) return null;
	const result = JSON.parse(rows[0].result_json);
	result.reviewDecision = rows[0].review_decision;
	return result;
}
async function setReview(id, decision, note) {
	const sql = await getSql();
	await sql`
    update traces set review_decision = ${decision}, review_note = ${note ?? null}, reviewed_at = now()
    where id = ${id}
  `;
	const rows = await sql`select result_json from traces where id = ${id}`;
	if (rows[0]) {
		const parsed = JSON.parse(rows[0].result_json);
		parsed.reviewDecision = decision;
		await sql`update traces set result_json = ${JSON.stringify(parsed)} where id = ${id}`;
	}
	await sql`
    insert into audit_logs (action, target_id, detail)
    values (${"review"}, ${id}, ${decision})
  `;
}
async function listTraces(limit = 30) {
	await ensureSeed();
	return (await getSql())`
    select id, case_id, wallet_address, chain, status, attributed_vasp_id, confidence_score,
           confidence_band, review_decision, created_at::text
    from traces
    order by created_at desc
    limit ${limit}
  `;
}
async function listDataset() {
	await ensureSeed();
	const sql = await getSql();
	return {
		vasps: await sql`select id, name, category, jurisdiction, website, notes from vasps order by name`,
		addresses: await sql`
    select vasp_id, chain, address, label, source, source_url, verification_status, verified_at::text, reliability
    from vasp_addresses
    order by vasp_id, chain, label
  `,
		risks: await sql`select chain, address, entity_type, name, source, source_url, notes from risk_entities order by entity_type, name`,
		meta: (await sql`
    select version, updated_at::text, notes from dataset_meta where id = 'labels'
  `)[0] ?? null,
		version: DATASET_VERSION
	};
}
async function pickLiveDemo(chain) {
	await ensureSeed();
	const hub = chain === "ethereum" ? "0x28c6c06298d514db089934071355e5743bf21d60" : "TDqSquXBgUCLYvYC4XZgrprLK589dkhSCf";
	const adapter = getAdapter(chain);
	try {
		const inbound = (await cachedHistory(chain, adapter.normalize(hub), () => adapter.fetchHistory(hub, 30))).txs.find((tx) => tx.toNorm === adapter.normalize(hub) && tx.fromNorm !== adapter.normalize(hub));
		if (!inbound) return {
			wallet: hub,
			note: "No recent inbound sample found. Tracing the labelled Binance hub itself (hop-0 VASP match)."
		};
		return {
			wallet: inbound.from,
			note: `Live sample: a recent counterparty that sent ${inbound.amountDisplay} to labelled Binance (${hub.slice(0, 8)}…).`
		};
	} catch (err) {
		return { error: err instanceof Error ? err.message : "Could not fetch a live demo wallet." };
	}
}
function buildSahyogDraft(result, investigator = "Duty officer, State Cyber Cell") {
	const vasp = result.attributed;
	return {
		channel: "SAHYOG (MOCK — not submitted)",
		notLiveIntegration: true,
		case_id: result.caseId ?? result.traceId,
		requesting_agency: "State/UT Cyber Cell (placeholder)",
		investigator_placeholder: investigator,
		attributed_vasp: vasp ? {
			name: vasp.vaspName,
			vasp_id: vasp.vaspId,
			labelled_addresses: vasp.matchedAddresses.map((m) => ({
				address: m.address,
				chain: result.chain,
				label: m.label,
				source: m.source,
				source_url: m.sourceUrl
			}))
		} : null,
		subject_wallet: {
			address: result.wallet,
			chain: result.chain
		},
		evidence_summary: vasp?.why ?? ["No reliable VASP attribution found."],
		transaction_references: (vasp?.sampleTxs ?? result.edges.slice(0, 8)).map((e) => ({
			hash: e.txHash,
			from: e.from,
			to: e.to,
			amount: e.amountDisplay,
			timestamp: e.timestamp,
			explorer: e.explorerUrl
		})),
		heuristic_score: vasp?.score ?? null,
		score_disclaimer: HEURISTIC_DISCLAIMER,
		requested_information: [
			"KYC / CDD records associated with the deposit address, if held",
			"Account opening date and last known contact details",
			"Internal ledger of credits matching the listed transaction hashes",
			"Any onward withdrawal destinations from the credited account"
		],
		legal_posture: LEAD_NOT_PROOF,
		generated_at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
//#endregion
export { buildSahyogDraft, listDataset, listTraces, loadTrace, pickLiveDemo, runAttribution, setReview };
