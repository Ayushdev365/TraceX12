import { V as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as PageHeader, r as Glass, t as AppShell } from "./glass-suHdsA2o.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/method-CFWtYHIW.js
var import_jsx_runtime = require_jsx_runtime();
var SECTIONS = [
	{
		n: "01",
		title: "Traversal",
		body: "Depth-limited BFS, default 3 hops (configurable 2–6). Outbound counterparties are preferred because the problem is cash-out to a VASP. Labelled VASP nodes are terminals. Mixer/sanctioned contracts are not expanded through. Expansion is capped to respect public API rate limits."
	},
	{
		n: "02",
		title: "Scoring (heuristic)",
		body: "Graph proximity 40 · label reliability 25 · timing/amount consistency 20 · recurring interaction 10 · cluster evidence 5 · minus mixer/bridge/fan-out penalties. A result below 40 is reported as No reliable VASP attribution found. The number is not a calibrated probability."
	},
	{
		n: "03",
		title: "Data",
		body: "Ethereum: Ethplorer public API, Blockscout fallback. Tron: TronGrid TRC-20 and TRX. Labelled addresses are public Etherscan nametags and community Tron exchange labels, each with a source URL. Transfers are never fabricated when an API is silent."
	},
	{
		n: "04",
		title: "SAHYOG",
		body: "The MVP emits a structured mock disclosure payload after human acceptance. It is not a live SAHYOG API integration and is labelled as such in the file."
	}
];
function MethodPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		kicker: "Deterministic first",
		title: "Method",
		description: "Deterministic graph attribution first. Language models, if used, only summarise evidence that already exists."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "reveal mt-8 grid gap-3 sm:grid-cols-2",
		children: SECTIONS.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
			lite: true,
			interactive: true,
			className: "rounded-3xl p-5 sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-widest text-accent/80",
					children: section.n
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 text-fg font-semibold tracking-tight",
					children: section.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: section.body
				})
			]
		}, section.n))
	})] });
}
//#endregion
export { MethodPage as component };
