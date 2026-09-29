import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/functions-BpFdbkcT.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var analyzeWallet = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("81b3b132a7f6d5463410ee2e624576795932fa63fbf0fa3a946dca2f2985048a"));
var getTrace = createServerFn({ method: "GET" }).validator((input) => input).handler(createSsrRpc("22f68b6f35c982c2be86ba3b6f6427468bdd396a09cf40239076502751a4cdfd"));
var listRecentTraces = createServerFn({ method: "GET" }).handler(createSsrRpc("49b609e3d74e082ba89e12704532f2d3cc46dc39678df3fedb5cce789322bc19"));
var getDataset = createServerFn({ method: "GET" }).handler(createSsrRpc("32928de206601ac0f798107b0106abd7732e31992c0bfa35770e2eb8fb74fc32"));
var reviewTrace = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("c9d78bfd7523cdec59ffc97bfc8e98bdf915f0d2f5ba88aa4f5ea8c682656957"));
var pickDemoWallet = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("2c1bbad937ed0519aefea7d444753c30deb464945bd41a9b44d361f4f07cf084"));
var getSahyogDraft = createServerFn({ method: "GET" }).validator((input) => input).handler(createSsrRpc("7b037a4485146bba7ab028fc5e0b270865243dd36a7569f1edb495fb89b2517e"));
var summarizeTrace = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("ccf999bc873bb1824be39ce676c63a5bce12b03eaf70be9560adc3f1ce419713"));
//#endregion
export { listRecentTraces as a, summarizeTrace as c, getTrace as i, getDataset as n, pickDemoWallet as o, getSahyogDraft as r, reviewTrace as s, analyzeWallet as t };
