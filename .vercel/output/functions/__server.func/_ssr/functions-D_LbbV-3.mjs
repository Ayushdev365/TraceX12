import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { n as LEAD_NOT_PROOF } from "./types-CPbO9eBB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/functions-D_LbbV-3.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var analyzeWallet_createServerFn_handler = createServerRpc({
	id: "81b3b132a7f6d5463410ee2e624576795932fa63fbf0fa3a946dca2f2985048a",
	name: "analyzeWallet",
	filename: "src/lib/server/functions.ts"
}, (opts) => analyzeWallet.__executeServer(opts));
var analyzeWallet = createServerFn({ method: "POST" }).validator((input) => input).handler(analyzeWallet_createServerFn_handler, async ({ data }) => {
	const { runAttribution } = await import("./engine-DrGiGNUQ.mjs");
	return runAttribution(data);
});
var getTrace_createServerFn_handler = createServerRpc({
	id: "22f68b6f35c982c2be86ba3b6f6427468bdd396a09cf40239076502751a4cdfd",
	name: "getTrace",
	filename: "src/lib/server/functions.ts"
}, (opts) => getTrace.__executeServer(opts));
var getTrace = createServerFn({ method: "GET" }).validator((input) => input).handler(getTrace_createServerFn_handler, async ({ data }) => {
	const { loadTrace } = await import("./engine-DrGiGNUQ.mjs");
	return loadTrace(data.id);
});
var listRecentTraces_createServerFn_handler = createServerRpc({
	id: "49b609e3d74e082ba89e12704532f2d3cc46dc39678df3fedb5cce789322bc19",
	name: "listRecentTraces",
	filename: "src/lib/server/functions.ts"
}, (opts) => listRecentTraces.__executeServer(opts));
var listRecentTraces = createServerFn({ method: "GET" }).handler(listRecentTraces_createServerFn_handler, async () => {
	const { listTraces } = await import("./engine-DrGiGNUQ.mjs");
	return listTraces(40);
});
var getDataset_createServerFn_handler = createServerRpc({
	id: "32928de206601ac0f798107b0106abd7732e31992c0bfa35770e2eb8fb74fc32",
	name: "getDataset",
	filename: "src/lib/server/functions.ts"
}, (opts) => getDataset.__executeServer(opts));
var getDataset = createServerFn({ method: "GET" }).handler(getDataset_createServerFn_handler, async () => {
	const { listDataset } = await import("./engine-DrGiGNUQ.mjs");
	return listDataset();
});
var reviewTrace_createServerFn_handler = createServerRpc({
	id: "c9d78bfd7523cdec59ffc97bfc8e98bdf915f0d2f5ba88aa4f5ea8c682656957",
	name: "reviewTrace",
	filename: "src/lib/server/functions.ts"
}, (opts) => reviewTrace.__executeServer(opts));
var reviewTrace = createServerFn({ method: "POST" }).validator((input) => input).handler(reviewTrace_createServerFn_handler, async ({ data }) => {
	const { setReview, loadTrace } = await import("./engine-DrGiGNUQ.mjs");
	await setReview(data.id, data.decision, data.note);
	return loadTrace(data.id);
});
var pickDemoWallet_createServerFn_handler = createServerRpc({
	id: "2c1bbad937ed0519aefea7d444753c30deb464945bd41a9b44d361f4f07cf084",
	name: "pickDemoWallet",
	filename: "src/lib/server/functions.ts"
}, (opts) => pickDemoWallet.__executeServer(opts));
var pickDemoWallet = createServerFn({ method: "POST" }).validator((input) => input).handler(pickDemoWallet_createServerFn_handler, async ({ data }) => {
	const { pickLiveDemo } = await import("./engine-DrGiGNUQ.mjs");
	return pickLiveDemo(data.chain);
});
var getSahyogDraft_createServerFn_handler = createServerRpc({
	id: "7b037a4485146bba7ab028fc5e0b270865243dd36a7569f1edb495fb89b2517e",
	name: "getSahyogDraft",
	filename: "src/lib/server/functions.ts"
}, (opts) => getSahyogDraft.__executeServer(opts));
var getSahyogDraft = createServerFn({ method: "GET" }).validator((input) => input).handler(getSahyogDraft_createServerFn_handler, async ({ data }) => {
	const { loadTrace, buildSahyogDraft } = await import("./engine-DrGiGNUQ.mjs");
	const trace = await loadTrace(data.id);
	if (!trace) return { error: "Trace not found" };
	if (trace.reviewDecision !== "accepted") return { error: "Investigator must accept the lead before a disclosure draft is generated." };
	return { draft: buildSahyogDraft(trace) };
});
var summarizeTrace_createServerFn_handler = createServerRpc({
	id: "ccf999bc873bb1824be39ce676c63a5bce12b03eaf70be9560adc3f1ce419713",
	name: "summarizeTrace",
	filename: "src/lib/server/functions.ts"
}, (opts) => summarizeTrace.__executeServer(opts));
var summarizeTrace = createServerFn({ method: "POST" }).validator((input) => input).handler(summarizeTrace_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "Briefing model is not available in this environment."
	};
	const { loadTrace } = await import("./engine-DrGiGNUQ.mjs");
	const trace = await loadTrace(data.id);
	if (!trace) return {
		ok: false,
		error: "Trace not found"
	};
	const facts = {
		wallet: trace.wallet,
		chain: trace.chain,
		vasp: trace.attributed?.vaspName ?? null,
		score: trace.attributed?.score ?? null,
		why: trace.attributed?.why ?? [],
		hops: trace.attributed?.hopDistance ?? null,
		flags: trace.riskFlags.map((f) => f.title),
		txs: trace.txsAnalyzed,
		disclaimer: LEAD_NOT_PROOF
	};
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			max_tokens: 400,
			messages: [{
				role: "system",
				content: "You write plain-language investigative briefings for Indian cyber-cell officers. Use ONLY the JSON facts provided. Do not invent transactions, identities, or certainty. Always restate that this is an investigative lead, not legal proof. Do not identify a beneficial owner."
			}, {
				role: "user",
				content: JSON.stringify(facts)
			}]
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `Briefing model error ${res.status}`
	};
	return {
		ok: true,
		text: (await res.json()).choices?.[0]?.message?.content ?? ""
	};
});
//#endregion
export { analyzeWallet_createServerFn_handler, getDataset_createServerFn_handler, getSahyogDraft_createServerFn_handler, getTrace_createServerFn_handler, listRecentTraces_createServerFn_handler, pickDemoWallet_createServerFn_handler, reviewTrace_createServerFn_handler, summarizeTrace_createServerFn_handler };
