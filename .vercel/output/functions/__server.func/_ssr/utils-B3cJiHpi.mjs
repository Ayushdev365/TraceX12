import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, V as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-B3cJiHpi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Drives --lx / --ly on :root for live glass specular.
* Fine pointers only, rAF-lerped, paused offscreen / reduced-motion.
*/
function usePointerLight() {
	(0, import_react.useEffect)(() => {
		const root = document.documentElement;
		const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
		const fine = window.matchMedia("(pointer: fine)");
		root.style.setProperty("--lx", "0.62");
		root.style.setProperty("--ly", "0.22");
		if (motion.matches || !fine.matches) return;
		let raf = 0;
		let x = .62;
		let y = .22;
		let tx = x;
		let ty = y;
		const tick = () => {
			x += (tx - x) * .16;
			y += (ty - y) * .16;
			root.style.setProperty("--lx", x.toFixed(4));
			root.style.setProperty("--ly", y.toFixed(4));
			if (Math.abs(tx - x) > .0012 || Math.abs(ty - y) > .0012) raf = requestAnimationFrame(tick);
			else raf = 0;
		};
		const onMove = (event) => {
			if (document.hidden) return;
			const w = window.innerWidth || 1;
			const h = window.innerHeight || 1;
			tx = event.clientX / w;
			ty = event.clientY / h;
			if (!raf) raf = requestAnimationFrame(tick);
		};
		window.addEventListener("pointermove", onMove, { passive: true });
		return () => {
			window.removeEventListener("pointermove", onMove);
			if (raf) cancelAnimationFrame(raf);
		};
	}, []);
}
function Atmosphere() {
	usePointerLight();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "atmosphere",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-wash" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-orb atmosphere-orb-a" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-orb atmosphere-orb-b" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-orb atmosphere-orb-c" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-pointer" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "atmosphere-grain" })
		]
	});
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function shortenAddress(address, left = 6, right = 4) {
	if (address.length <= left + right + 1) return address;
	return `${address.slice(0, left)}…${address.slice(-right)}`;
}
function formatUnix(ts) {
	if (!ts) return "—";
	const ms = ts > 0xe8d4a51000 ? ts : ts * 1e3;
	return new Date(ms).toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");
}
function explorerUrl(chain, address) {
	return chain === "tron" ? `https://tronscan.org/#/address/${address}` : `https://etherscan.io/address/${address}`;
}
function txExplorerUrl(chain, hash) {
	return chain === "tron" ? `https://tronscan.org/#/transaction/${hash}` : `https://etherscan.io/tx/${hash}`;
}
//#endregion
export { shortenAddress as a, formatUnix as i, cn as n, txExplorerUrl as o, explorerUrl as r, Atmosphere as t };
