import { getSql } from "@/lib/db";
import { getAdapter } from "./adapters";
import { ATTRIBUTION_FLOOR, bandForScore, scoreCandidate } from "./scoring";
import { DATASET_NOTES, DATASET_VERSION, SEED_ADDRESSES, SEED_RISK, SEED_VASPS } from "./seed";
import type {
  AnalyzeInput,
  ChainId,
  DataGap,
  GraphEdge,
  GraphNode,
  LabelledAddress,
  NodeRole,
  NormalizedTx,
  RiskEntity,
  RiskFlag,
  TraceResult,
  VaspCandidate,
} from "./types";
import { HEURISTIC_DISCLAIMER, LEAD_NOT_PROOF } from "./types";
import { clampHopCap, sanitizeCaseId, validateAddress } from "./validate";

const CACHE_MS = 6 * 60 * 60 * 1000;
const MAX_EXPAND = 22;
const MAX_TX_PER_NODE = 40;
const MAX_NEIGHBORS = 8;
const DEADLINE_MS = 22000;
const FETCH_CONCURRENCY = 3;

const rateBucket: { stamps: number[] } = { stamps: [] };

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  if (!items.length) return [];
  const out: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const idx = cursor;
      cursor += 1;
      const item = items[idx];
      if (item === undefined) continue;
      out[idx] = await fn(item);
    }
  }
  const n = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: n }, () => worker()));
  return out;
}

function classifyGap(err: unknown, address: string): DataGap {
  const message = err instanceof Error ? err.message : "error";
  const code = message.match(/HTTP (\d+)/)?.[1];
  const rateLimited = code === "429" || code === "503";
  return {
    provider: message.includes("TronGrid") ? "TronGrid" : message.includes("Blockscout") ? "Blockscout" : "Ethplorer / Blockscout",
    code,
    address,
    detail: rateLimited
      ? "The explorer rate-limited this request. Attribution used transfers already retrieved."
      : "Some transfer data could not be retrieved from the current provider.",
  };
}

function rateLimitOk(): boolean {
  const now = Date.now();
  rateBucket.stamps = rateBucket.stamps.filter((t) => now - t < 10 * 60 * 1000);
  if (rateBucket.stamps.length >= 10) return false;
  rateBucket.stamps.push(now);
  return true;
}

async function ensureSeed(): Promise<void> {
  const sql = await getSql();
  const existing = await sql<{ n: number }>`select count(*)::int as n from vasps`;
  if ((existing[0]?.n ?? 0) > 0) return;

  for (const v of SEED_VASPS) {
    await sql`
      insert into vasps (id, name, category, jurisdiction, website, notes)
      values (${v.id}, ${v.name}, ${v.category}, ${v.jurisdiction}, ${v.website}, ${v.notes})
      on conflict (id) do nothing
    `;
  }
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

async function loadLabels(chain: ChainId): Promise<Map<string, LabelledAddress>> {
  const sql = await getSql();
  const rows = await sql<{
    vasp_id: string;
    vasp_name: string;
    chain: string;
    address: string;
    address_norm: string;
    label: string;
    source: string;
    source_url: string | null;
    verification_status: string;
    verified_at: string | null;
    reliability: string;
  }>`
    select a.vasp_id, v.name as vasp_name, a.chain, a.address, a.address_norm, a.label,
           a.source, a.source_url, a.verification_status, a.verified_at::text, a.reliability
    from vasp_addresses a
    join vasps v on v.id = a.vasp_id
    where a.chain = ${chain}
  `;
  const map = new Map<string, LabelledAddress>();
  for (const r of rows) {
    map.set(r.address_norm, {
      vaspId: r.vasp_id,
      vaspName: r.vasp_name,
      chain: r.chain as ChainId,
      address: r.address,
      addressNorm: r.address_norm,
      label: r.label,
      source: r.source,
      sourceUrl: r.source_url,
      verificationStatus: r.verification_status,
      verifiedAt: r.verified_at,
      reliability: r.reliability as LabelledAddress["reliability"],
    });
  }
  return map;
}

async function loadRisk(chain: ChainId): Promise<Map<string, RiskEntity>> {
  const sql = await getSql();
  const rows = await sql<{
    chain: string;
    address: string;
    address_norm: string;
    entity_type: string;
    name: string;
    source: string;
    source_url: string | null;
    notes: string | null;
  }>`
    select chain, address, address_norm, entity_type, name, source, source_url, notes
    from risk_entities where chain = ${chain}
  `;
  const map = new Map<string, RiskEntity>();
  for (const r of rows) {
    map.set(r.address_norm, {
      chain: r.chain as ChainId,
      address: r.address,
      addressNorm: r.address_norm,
      entityType: r.entity_type as RiskEntity["entityType"],
      name: r.name,
      source: r.source,
      sourceUrl: r.source_url,
      notes: r.notes,
    });
  }
  return map;
}

async function cachedHistory(
  chain: ChainId,
  addressNorm: string,
  fetcher: () => Promise<{ txs: NormalizedTx[]; source: string; truncated: boolean }>,
): Promise<{ txs: NormalizedTx[]; source: string; truncated: boolean; cached: boolean }> {
  const sql = await getSql();
  const rows = await sql<{ payload_json: string; source: string; fetched_at: string }>`
    select payload_json, source, fetched_at::text from tx_cache
    where chain = ${chain} and address_norm = ${addressNorm}
  `;
  const row = rows[0];
  if (row) {
    const age = Date.now() - new Date(row.fetched_at).getTime();
    if (age >= 0 && age < CACHE_MS) {
      const parsed = JSON.parse(row.payload_json) as { txs: NormalizedTx[]; truncated: boolean };
      return { txs: parsed.txs, source: `${row.source} (cached)`, truncated: parsed.truncated, cached: true };
    }
  }
  const fresh = await fetcher();
  const payload = JSON.stringify({ txs: fresh.txs, truncated: fresh.truncated });
  await sql`
    insert into tx_cache (chain, address_norm, payload_json, source, fetched_at)
    values (${chain}, ${addressNorm}, ${payload}, ${fresh.source}, now())
    on conflict (chain, address_norm) do update
      set payload_json = excluded.payload_json, source = excluded.source, fetched_at = now()
  `;
  return { ...fresh, cached: false };
}

function counterpart(tx: NormalizedTx, self: string): { addr: string; norm: string; outbound: boolean } | null {
  if (tx.fromNorm === self && tx.toNorm !== self) {
    return { addr: tx.to, norm: tx.toNorm, outbound: true };
  }
  if (tx.toNorm === self && tx.fromNorm !== self) {
    return { addr: tx.from, norm: tx.fromNorm, outbound: false };
  }
  return null;
}

function amountNumber(tx: NormalizedTx): number {
  const n = Number(tx.amountDisplay.split(" ")[0]);
  return Number.isFinite(n) ? n : 0;
}

export async function runAttribution(input: AnalyzeInput): Promise<TraceResult> {
  const started = Date.now();
  await ensureSeed();

  const chain = input.chain;
  const hopCap = clampHopCap(input.hopCap);
  const caseId = sanitizeCaseId(input.caseId);
  const formatError = validateAddress(chain, input.wallet);
  if (formatError) {
    return errorResult(input, hopCap, caseId, started, formatError, "empty");
  }
  if (!rateLimitOk()) {
    return errorResult(input, hopCap, caseId, started, "Analysis rate limit reached. Wait a few minutes and retry.", "empty");
  }

  const adapter = getAdapter(chain);
  const wallet = adapter.display(input.wallet.trim());
  const walletNorm = adapter.normalize(wallet);
  const labels = await loadLabels(chain);
  const risks = await loadRisk(chain);
  const sql = await getSql();
  const meta = await sql<{ version: string; updated_at: string }>`
    select version, updated_at::text from dataset_meta where id = 'labels'
  `;

  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const visited = new Set<string>();
  const hopOf = new Map<string, number>();
  const parent = new Map<string, string | null>();
  const sourcesUsed = new Set<string>();
  const flags: RiskFlag[] = [];
  const dataGaps: DataGap[] = [];
  let txsAnalyzed = 0;
  let completeness: TraceResult["completeness"] = "full";
  const completenessNotes: string[] = [];
  let expanded = 0;
  let rateLimitedStops = 0;

  function roleFor(norm: string): NodeRole {
    const isVasp = labels.has(norm);
    const isRisk = risks.has(norm);
    if (isVasp && isRisk) return "both";
    if (isVasp) return "vasp";
    if (isRisk) return "risk";
    return "intermediate";
  }

  function upsertNode(address: string, norm: string, hop: number): GraphNode {
    const existing = nodes.get(norm);
    if (existing) {
      existing.hop = Math.min(existing.hop, hop);
      return existing;
    }
    const lab = labels.get(norm);
    const risk = risks.get(norm);
    const node: GraphNode = {
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
      fanIn: 0,
    };
    nodes.set(norm, node);
    return node;
  }

  upsertNode(wallet, walletNorm, 0);
  hopOf.set(walletNorm, 0);
  parent.set(walletNorm, null);

  const queue: string[] = [walletNorm];
  const addressOf = new Map<string, string>([[walletNorm, wallet]]);

  async function expandNode(current: string): Promise<string[]> {
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

      const neighbors: { addr: string; norm: string; outbound: boolean; tx: NormalizedTx }[] = [];
      const seenN = new Set<string>();
      let fanOut = 0;
      let fanIn = 0;
      for (const tx of hist.txs) {
        const c = counterpart(tx, current);
        if (!c) continue;
        if (c.outbound) fanOut += 1;
        else fanIn += 1;
        neighbors.push({ ...c, tx });
        if (!seenN.has(c.norm)) seenN.add(c.norm);
      }
      if (node) {
        node.fanOut = fanOut;
        node.fanIn = fanIn;
      }
      if (seenN.size >= 40) {
        flags.push({
          kind: fanOut >= fanIn ? "high_fan_out" : "high_fan_in",
          severity: "medium",
          title: fanOut >= fanIn ? "High fan-out address" : "High fan-in address",
          detail: `${addr} interacted with ${seenN.size} counterparties in the retrieved window. This pattern is common for exchange hot wallets, mixers, or pass-through contracts.`,
          address: addr,
        });
      }

      const ranked = [...neighbors].sort((a, b) => {
        if (a.outbound !== b.outbound) return a.outbound ? -1 : 1;
        return amountNumber(b.tx) - amountNumber(a.tx);
      });
      const picked: typeof ranked = [];
      const pickedNorm = new Set<string>();
      for (const n of ranked) {
        if (pickedNorm.has(n.norm)) continue;
        if (pickedNorm.size >= MAX_NEIGHBORS) continue;
        pickedNorm.add(n.norm);
        picked.push(n);
      }

      const edgeSeen = new Set<string>();
      for (const n of ranked) {
        const key = `${n.tx.hash}:${n.tx.fromNorm}:${n.tx.toNorm}`;
        if (edgeSeen.has(key)) continue;
        edgeSeen.add(key);
        if (!nodes.has(n.norm) && !pickedNorm.has(n.norm) && !labels.has(n.norm) && !risks.has(n.norm)) {
          continue;
        }
        if (!nodes.has(n.norm) && (labels.has(n.norm) || risks.has(n.norm))) {
          upsertNode(n.addr, n.norm, hop + 1);
        }
        if (!nodes.has(n.norm) && pickedNorm.has(n.norm)) {
          upsertNode(n.addr, n.norm, hop + 1);
        }
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
          explorerUrl: n.tx.explorerUrl,
        });
      }

      const next: string[] = [];
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
    const batch: string[] = [];
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
    for (const next of nextLists) {
      for (const n of next) {
        if (!visited.has(n)) queue.push(n);
      }
    }
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
      address: node.address,
    });
  }

  const candidates = buildCandidates(walletNorm, nodes, edges, labels, flags, parent);
  candidates.sort((a, b) => b.score - a.score || a.hopDistance - b.hopDistance);
  const top = candidates[0] ?? null;
  const usable = top && top.score >= ATTRIBUTION_FLOOR ? top : null;
  const band = bandForScore(usable?.score ?? top?.score ?? null, Boolean(top));

  const status: TraceResult["status"] =
    completeness === "empty" && nodes.size <= 1 ? "error" : usable ? "complete" : "inconclusive";

  const limitations = [
    LEAD_NOT_PROOF,
    HEURISTIC_DISCLAIMER,
    "Label coverage is partial. A missing match does not prove the wallet is unhosted.",
    "MVP traces Ethereum and Tron only. Cross-chain hops after a bridge are not followed.",
    "Public explorer APIs may truncate history; deep or high-fan-out paths can be incomplete.",
    "The system does not identify a beneficial owner's real-world identity.",
  ];

  const result: TraceResult = {
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
    datasetVersion: meta[0]?.version ?? DATASET_VERSION,
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
    createdAt: new Date().toISOString(),
    reviewDecision: "pending",
    limitations,
    error:
      status === "error"
        ? completenessNotes[0] || "No blockchain transfers could be retrieved for this wallet."
        : undefined,
  };

  try {
    await persistTrace(result);
  } catch (err) {
    console.error("[vasptrace] persist failed", err);
  }
  return result;
}

function reconstructPath(norm: string, parent: Map<string, string | null>): string[] {
  const path: string[] = [];
  let cur: string | null = norm;
  const guard = new Set<string>();
  while (cur && !guard.has(cur)) {
    guard.add(cur);
    path.push(cur);
    cur = parent.get(cur) ?? null;
  }
  return path.reverse();
}

function buildCandidates(
  seed: string,
  nodes: Map<string, GraphNode>,
  edges: GraphEdge[],
  labels: Map<string, LabelledAddress>,
  flags: RiskFlag[],
  parent: Map<string, string | null>,
): VaspCandidate[] {
  const grouped = new Map<string, LabelledAddress[]>();
  for (const [norm, lab] of labels) {
    if (!nodes.has(norm)) continue;
    const list = grouped.get(lab.vaspId) ?? [];
    list.push(lab);
    grouped.set(lab.vaspId, list);
  }
  const out: VaspCandidate[] = [];
  for (const [vaspId, matched] of grouped) {
    const hops = matched.map((m) => nodes.get(m.addressNorm)?.hop ?? 99);
    const hopDistance = Math.min(...hops);
    const nearest = matched.filter((m) => (nodes.get(m.addressNorm)?.hop ?? 99) === hopDistance);
    const norms = new Set(matched.map((m) => m.addressNorm));
    const connecting = edges.filter((e) => norms.has(e.fromNorm) || norms.has(e.toNorm));
    const outbound = connecting.some((e) => norms.has(e.toNorm) && !norms.has(e.fromNorm));
    const nearestNorm = nearest[0]?.addressNorm ?? matched[0].addressNorm;
    const path = reconstructPath(nearestNorm, parent);
    if (path[0] !== seed && hopDistance > 0) {
      path.unshift(seed);
    }
    const timestamps = connecting.map((e) => e.timestamp).filter(Boolean).sort((a, b) => a - b);
    const timestampsOrdered = timestamps.length < 2 || timestamps.every((t, i) => i === 0 || t >= timestamps[i - 1] - 120);
    out.push(
      scoreCandidate({
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
        amountPlausible: connecting.length > 0,
      }),
    );
  }
  return out;
}

function dedupeFlags(flags: RiskFlag[]): RiskFlag[] {
  const seen = new Set<string>();
  const out: RiskFlag[] = [];
  for (const f of flags) {
    const key = `${f.kind}:${f.address ?? f.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(f);
  }
  return out;
}

function errorResult(
  input: AnalyzeInput,
  hopCap: number,
  caseId: string | null,
  started: number,
  message: string,
  completeness: TraceResult["completeness"],
): TraceResult {
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
    createdAt: new Date().toISOString(),
    reviewDecision: "pending",
    limitations: [LEAD_NOT_PROOF],
    error: message,
  };
}

async function persistTrace(result: TraceResult): Promise<void> {
  const sql = await getSql();
  if (result.caseId) {
    await sql`
      insert into cases (id, title, status)
      values (${result.caseId}, ${"Case " + result.caseId}, 'open')
      on conflict (id) do nothing
    `;
  }
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
  for (const n of result.nodes) {
    await sql`
      insert into trace_nodes (trace_id, address, address_norm, hop, role, label, vasp_id, tx_count)
      values (${result.traceId}, ${n.address}, ${n.addressNorm}, ${n.hop}, ${n.role}, ${n.label}, ${n.vaspId}, ${n.txCount})
    `;
  }
  const edgeSlice = result.edges.slice(0, 400);
  for (let i = 0; i < edgeSlice.length; i += 8) {
    await Promise.all(
      edgeSlice.slice(i, i + 8).map(
        (e) => sql`
      insert into trace_edges (trace_id, from_address, to_address, tx_hash, amount_display, symbol, timestamp_unix, is_token)
      values (${result.traceId}, ${e.from}, ${e.to}, ${e.txHash}, ${e.amountDisplay}, ${e.symbol}, ${e.timestamp}, ${e.isToken})
    `,
      ),
    );
  }
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

export async function loadTrace(id: string): Promise<TraceResult | null> {
  await ensureSeed();
  const sql = await getSql();
  const rows = await sql<{ result_json: string; review_decision: string }>`
    select result_json, review_decision from traces where id = ${id}
  `;
  if (!rows[0]) return null;
  const result = JSON.parse(rows[0].result_json) as TraceResult;
  result.reviewDecision = rows[0].review_decision as TraceResult["reviewDecision"];
  return result;
}

export async function setReview(id: string, decision: TraceResult["reviewDecision"], note?: string) {
  const sql = await getSql();
  await sql`
    update traces set review_decision = ${decision}, review_note = ${note ?? null}, reviewed_at = now()
    where id = ${id}
  `;
  const rows = await sql<{ result_json: string }>`select result_json from traces where id = ${id}`;
  if (rows[0]) {
    const parsed = JSON.parse(rows[0].result_json) as TraceResult;
    parsed.reviewDecision = decision;
    await sql`update traces set result_json = ${JSON.stringify(parsed)} where id = ${id}`;
  }
  await sql`
    insert into audit_logs (action, target_id, detail)
    values (${"review"}, ${id}, ${decision})
  `;
}

export async function listTraces(limit = 30) {
  await ensureSeed();
  const sql = await getSql();
  return sql<{
    id: string;
    case_id: string | null;
    wallet_address: string;
    chain: string;
    status: string;
    attributed_vasp_id: string | null;
    confidence_score: number | null;
    confidence_band: string | null;
    review_decision: string;
    created_at: string;
  }>`
    select id, case_id, wallet_address, chain, status, attributed_vasp_id, confidence_score,
           confidence_band, review_decision, created_at::text
    from traces
    order by created_at desc
    limit ${limit}
  `;
}

export async function listDataset() {
  await ensureSeed();
  const sql = await getSql();
  const vasps = await sql<{
    id: string;
    name: string;
    category: string;
    jurisdiction: string | null;
    website: string | null;
    notes: string | null;
  }>`select id, name, category, jurisdiction, website, notes from vasps order by name`;
  const addresses = await sql<{
    vasp_id: string;
    chain: string;
    address: string;
    label: string;
    source: string;
    source_url: string | null;
    verification_status: string;
    verified_at: string | null;
    reliability: string;
  }>`
    select vasp_id, chain, address, label, source, source_url, verification_status, verified_at::text, reliability
    from vasp_addresses
    order by vasp_id, chain, label
  `;
  const risks = await sql<{
    chain: string;
    address: string;
    entity_type: string;
    name: string;
    source: string;
    source_url: string | null;
    notes: string | null;
  }>`select chain, address, entity_type, name, source, source_url, notes from risk_entities order by entity_type, name`;
  const meta = await sql<{ version: string; updated_at: string; notes: string | null }>`
    select version, updated_at::text, notes from dataset_meta where id = 'labels'
  `;
  return { vasps, addresses, risks, meta: meta[0] ?? null, version: DATASET_VERSION };
}

export async function pickLiveDemo(chain: ChainId): Promise<{ wallet: string; note: string } | { error: string }> {
  await ensureSeed();
  const hub =
    chain === "ethereum"
      ? "0x28c6c06298d514db089934071355e5743bf21d60"
      : "TDqSquXBgUCLYvYC4XZgrprLK589dkhSCf";
  const adapter = getAdapter(chain);
  try {
    const hist = await cachedHistory(chain, adapter.normalize(hub), () => adapter.fetchHistory(hub, 30));
    const inbound = hist.txs.find((tx) => tx.toNorm === adapter.normalize(hub) && tx.fromNorm !== adapter.normalize(hub));
    if (!inbound) {
      return {
        wallet: hub,
        note: "No recent inbound sample found. Tracing the labelled Binance hub itself (hop-0 VASP match).",
      };
    }
    return {
      wallet: inbound.from,
      note: `Live sample: a recent counterparty that sent ${inbound.amountDisplay} to labelled Binance (${hub.slice(0, 8)}…).`,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not fetch a live demo wallet." };
  }
}

export function buildSahyogDraft(result: TraceResult, investigator = "Duty officer, State Cyber Cell") {
  const vasp = result.attributed;
  return {
    channel: "SAHYOG (MOCK — not submitted)",
    notLiveIntegration: true,
    case_id: result.caseId ?? result.traceId,
    requesting_agency: "State/UT Cyber Cell (placeholder)",
    investigator_placeholder: investigator,
    attributed_vasp: vasp
      ? {
          name: vasp.vaspName,
          vasp_id: vasp.vaspId,
          labelled_addresses: vasp.matchedAddresses.map((m) => ({
            address: m.address,
            chain: result.chain,
            label: m.label,
            source: m.source,
            source_url: m.sourceUrl,
          })),
        }
      : null,
    subject_wallet: { address: result.wallet, chain: result.chain },
    evidence_summary: vasp?.why ?? ["No reliable VASP attribution found."],
    transaction_references: (vasp?.sampleTxs ?? result.edges.slice(0, 8)).map((e) => ({
      hash: e.txHash,
      from: e.from,
      to: e.to,
      amount: e.amountDisplay,
      timestamp: e.timestamp,
      explorer: e.explorerUrl,
    })),
    heuristic_score: vasp?.score ?? null,
    score_disclaimer: HEURISTIC_DISCLAIMER,
    requested_information: [
      "KYC / CDD records associated with the deposit address, if held",
      "Account opening date and last known contact details",
      "Internal ledger of credits matching the listed transaction hashes",
      "Any onward withdrawal destinations from the credited account",
    ],
    legal_posture: LEAD_NOT_PROOF,
    generated_at: new Date().toISOString(),
  };
}
