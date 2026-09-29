import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, V as require_jsx_runtime, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./utils-B3cJiHpi.mjs";
import { a as Route, l as Clipboard, o as Lock, t as Waypoints } from "../_libs/lucide-react.mjs";
import { i as PageHeader, n as Field, r as Glass, t as AppShell } from "./glass-suHdsA2o.mjs";
import { o as pickDemoWallet, t as analyzeWallet } from "./functions-BpFdbkcT.mjs";
import { n as detectChain } from "./validate-D-Y1YbRZ.mjs";
import { t as Button } from "./button-CPxaIEem.mjs";
import { t as stashTrace } from "./result-cache-B4nT4Dwz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DpOjAoxK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Segmented({ value, onChange, options, ariaLabel }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "segmented",
		role: "tablist",
		"aria-label": ariaLabel,
		children: options.map((option) => {
			const active = option.value === value;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				role: "tab",
				"aria-selected": active,
				className: cn("segmented-item", active && "is-active"),
				onClick: () => onChange(option.value),
				children: option.label
			}, option.value);
		})
	});
}
function Stepper({ value, min, max, onChange, suffix, ariaLabel }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "stepper",
		role: "group",
		"aria-label": ariaLabel,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "stepper-btn",
				"aria-label": "Decrease",
				disabled: value <= min,
				onClick: () => onChange(Math.max(min, value - 1)),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
					viewBox: "0 0 16 16",
					className: "size-4",
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M3.5 8h9",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "1.6",
						strokeLinecap: "round"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "stepper-value tabular-nums",
				children: [
					value,
					" ",
					suffix
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "stepper-btn",
				"aria-label": "Increase",
				disabled: value >= max,
				onClick: () => onChange(Math.min(max, value + 1)),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
					viewBox: "0 0 16 16",
					className: "size-4",
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M3.5 8h9M8 3.5v9",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "1.6",
						strokeLinecap: "round"
					})
				})
			})
		]
	});
}
var CHAINS = [{
	value: "ethereum",
	label: "Ethereum"
}, {
	value: "tron",
	label: "Tron"
}];
function Home() {
	const navigate = useNavigate();
	const [wallet, setWallet] = (0, import_react.useState)("");
	const [chain, setChain] = (0, import_react.useState)("ethereum");
	const [hopCap, setHopCap] = (0, import_react.useState)(3);
	const [caseId, setCaseId] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [note, setNote] = (0, import_react.useState)(null);
	const guessed = detectChain(wallet);
	async function run() {
		setError(null);
		setBusy(true);
		try {
			const usedChain = guessed ?? chain;
			if (guessed && guessed !== chain) setChain(guessed);
			const result = await analyzeWallet({ data: {
				wallet,
				chain: usedChain,
				hopCap,
				caseId: caseId || void 0
			} });
			if (result.status === "error" && result.dataSource === "none") {
				setError(result.error ?? "Analysis failed.");
				return;
			}
			stashTrace(result);
			await navigate({
				to: "/trace/$traceId",
				params: { traceId: result.traceId }
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Analysis failed.");
		} finally {
			setBusy(false);
		}
	}
	async function demo(c) {
		setBusy(true);
		setError(null);
		try {
			const picked = await pickDemoWallet({ data: { chain: c } });
			if ("error" in picked) {
				setError(picked.error);
				return;
			}
			setChain(c);
			setWallet(picked.wallet);
			setNote(picked.note);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not load a live demo wallet.");
		} finally {
			setBusy(false);
		}
	}
	async function pasteWallet() {
		try {
			const text = await navigator.clipboard.readText();
			if (text.trim()) setWallet(text.trim());
		} catch {
			setError("Clipboard access was blocked. Paste the address into the field.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			live: true,
			kicker: "SIH 2026 · Blockchain & Cybersecurity",
			title: "Attribute an unknown wallet to the nearest VASP.",
			description: "Enter a suspect address. VASPTrace pulls live chain data, walks the outbound graph, and matches labelled exchange addresses with an explainable heuristic score."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
			live: true,
			className: "mt-8 p-4 sm:p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-5",
				onSubmit: (e) => {
					e.preventDefault();
					run();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Wallet address",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: wallet,
								onChange: (e) => setWallet(e.target.value),
								placeholder: "0x… or T…",
								autoComplete: "off",
								spellCheck: false,
								className: "glass-input pr-32 font-mono",
								suppressHydrationWarning: true
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute inset-y-0 right-1.5 flex items-center gap-1",
								children: [guessed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "chip chip-ok capitalize",
									children: guessed
								}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => void pasteWallet(),
									className: "glass-press inline-flex size-10 items-center justify-center rounded-lg text-muted hover:bg-white/10 hover:text-fg",
									"aria-label": "Paste from clipboard",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clipboard, {
										className: "size-4",
										strokeWidth: 1.75
									})
								})]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Blockchain",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
								ariaLabel: "Blockchain",
								value: chain,
								onChange: setChain,
								options: CHAINS
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Hop depth",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper, {
								ariaLabel: "Hop depth",
								value: hopCap,
								min: 2,
								max: 6,
								suffix: "hops",
								onChange: setHopCap
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Case ID",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: caseId,
							onChange: (e) => setCaseId(e.target.value),
							placeholder: "optional",
							className: "glass-input font-mono",
							suppressHydrationWarning: true
						})
					}),
					note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-accent",
						children: note
					}) : null,
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 sm:flex-row sm:items-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								size: "lg",
								disabled: busy || !wallet.trim(),
								className: "min-h-12 w-full sm:w-auto",
								children: busy ? "Tracing on-chain path…" : "Run attribution"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								disabled: busy,
								onClick: () => void demo("ethereum"),
								children: "Live ETH demo"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								disabled: busy,
								onClick: () => void demo("tron"),
								children: "Live TRON demo"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-relaxed text-subtle",
						children: "Live demo buttons fetch a recent counterparty of a labelled Binance hub from public explorer APIs. No transactions are fabricated. Keys stay on the server."
					})
				]
			}), busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "shimmer-bar",
				"aria-hidden": "true"
			}) : null]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "reveal space-y-3 lg:pt-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
					lite: true,
					interactive: true,
					className: "rounded-3xl p-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "icon-well",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Waypoints, {
								className: "size-4 text-accent",
								strokeWidth: 1.75
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold",
							children: "What this tool does"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
							className: "mt-3 space-y-2 text-sm leading-relaxed text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "1. Validate the address and chain." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "2. Retrieve native and token transfers from public APIs." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "3. Breadth-first walk, default 3 hops, outbound-first." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "4. Match visited addresses to the labelled VASP store." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "5. Score with hop distance, label reliability, consistency, recurrence." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "6. Flag mixers, bridges, and high fan-out." })
							]
						})] })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
					lite: true,
					interactive: true,
					className: "rounded-3xl p-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "icon-well",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
								className: "size-4 text-muted",
								strokeWidth: 1.75
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold",
							children: "What it does not do"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-3 space-y-2 text-sm leading-relaxed text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Does not identify a beneficial owner." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Does not freeze, block, or submit a live SAHYOG request." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Does not present the score as a calibrated probability." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Does not invent chain data when an explorer is silent." })
							]
						})] })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
					lite: true,
					className: "rounded-3xl p-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "icon-well bg-warn/10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {
								className: "size-4 text-warn",
								strokeWidth: 1.75
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed text-fg",
							children: "Human review is mandatory. Export and the mock SAHYOG draft stay locked until an investigator accepts the lead."
						})]
					})
				})
			]
		})]
	}) });
}
//#endregion
export { Home as component };
