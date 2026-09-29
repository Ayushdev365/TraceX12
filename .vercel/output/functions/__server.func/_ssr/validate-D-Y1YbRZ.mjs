//#region node_modules/.nitro/vite/services/ssr/assets/validate-D-Y1YbRZ.js
var ETH_RE = /^0x[a-fA-F0-9]{40}$/;
var TRON_RE = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
function detectChain(address) {
	const trimmed = address.trim();
	if (ETH_RE.test(trimmed)) return "ethereum";
	if (TRON_RE.test(trimmed)) return "tron";
	return null;
}
function validateAddress(chain, address) {
	const trimmed = address.trim();
	if (chain === "ethereum") {
		if (!ETH_RE.test(trimmed)) return "Ethereum addresses must be 42-character 0x-prefixed hex.";
		return null;
	}
	if (!TRON_RE.test(trimmed)) return "Tron addresses must be 34-character Base58 strings starting with T.";
	return null;
}
function normalizeAddress(chain, address) {
	const trimmed = address.trim();
	return chain === "ethereum" ? trimmed.toLowerCase() : trimmed;
}
function sanitizeCaseId(raw) {
	if (!raw) return null;
	return raw.trim().slice(0, 64).replace(/[^\w\-./]/g, "") || null;
}
function clampHopCap(n) {
	const v = typeof n === "number" ? n : Number(n);
	if (!Number.isFinite(v)) return 3;
	return Math.min(6, Math.max(2, Math.round(v)));
}
//#endregion
export { validateAddress as a, sanitizeCaseId as i, detectChain as n, normalizeAddress as r, clampHopCap as t };
