//#region node_modules/.nitro/vite/services/ssr/assets/result-cache-B4nT4Dwz.js
var KEY = "vasptrace:last-result";
function stashTrace(result) {
	try {
		sessionStorage.setItem(KEY, JSON.stringify(result));
	} catch {}
}
function takeStashedTrace(id) {
	try {
		const raw = sessionStorage.getItem(KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (parsed.traceId !== id) return null;
		return parsed;
	} catch {
		return null;
	}
}
//#endregion
export { takeStashedTrace as n, stashTrace as t };
