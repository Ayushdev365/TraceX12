export type ChainId = "ethereum" | "tron";

export type Reliability = "high" | "medium" | "low";

export type NodeRole =
  | "unknown_wallet"
  | "intermediate"
  | "vasp"
  | "risk"
  | "both";

export type RiskKind = "mixer" | "bridge" | "sanctioned" | "high_fan_out" | "high_fan_in";

export interface NormalizedTx {
  hash: string;
  from: string;
  fromNorm: string;
  to: string;
  toNorm: string;
  valueAtomic: string;
  decimals: number;
  symbol: string;
  amountDisplay: string;
  timestamp: number;
  isToken: boolean;
  tokenAddress?: string;
  explorerUrl: string;
  directionFromSeed?: "out" | "in";
}

export interface ChainAdapter {
  chain: ChainId;
  displayName: string;
  nativeSymbol: string;
  validate(address: string): boolean;
  normalize(address: string): string;
  display(address: string): string;
  fetchHistory(address: string, limit: number): Promise<{
    txs: NormalizedTx[];
    source: string;
    truncated: boolean;
  }>;
}

export interface LabelledAddress {
  vaspId: string;
  vaspName: string;
  chain: ChainId;
  address: string;
  addressNorm: string;
  label: string;
  source: string;
  sourceUrl: string | null;
  verificationStatus: string;
  verifiedAt: string | null;
  reliability: Reliability;
}

export interface RiskEntity {
  chain: ChainId;
  address: string;
  addressNorm: string;
  entityType: RiskKind;
  name: string;
  source: string;
  sourceUrl: string | null;
  notes: string | null;
}

export interface GraphNode {
  id: string;
  address: string;
  addressNorm: string;
  hop: number;
  role: NodeRole;
  label: string | null;
  vaspId: string | null;
  vaspName: string | null;
  reliability: Reliability | null;
  source: string | null;
  sourceUrl: string | null;
  txCount: number;
  fanOut: number;
  fanIn: number;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  fromNorm: string;
  toNorm: string;
  txHash: string;
  amountDisplay: string;
  symbol: string;
  timestamp: number;
  isToken: boolean;
  explorerUrl: string;
}

export interface ScoreBreakdown {
  graphProximity: { awarded: number; max: number; note: string };
  labelReliability: { awarded: number; max: number; note: string };
  txConsistency: { awarded: number; max: number; note: string };
  recurringInteraction: { awarded: number; max: number; note: string };
  clusterEvidence: { awarded: number; max: number; note: string };
  riskPenalty: { awarded: number; max: number; note: string };
}

export interface VaspCandidate {
  vaspId: string;
  vaspName: string;
  score: number;
  hopDistance: number;
  matchedAddresses: LabelledAddress[];
  interactionCount: number;
  path: string[];
  sampleTxs: GraphEdge[];
  breakdown: ScoreBreakdown;
  why: string[];
  outbound: boolean;
}

export interface RiskFlag {
  kind: RiskKind;
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
  address?: string;
}

export interface DataGap {
  provider: string;
  code?: string;
  address?: string;
  detail: string;
}

export interface GraphIntelNode {
  addressNorm: string;
  hop: number;
  degree: number;
  centrality: number;
  similarityToSeed: number;
}

export interface GraphIntelPair {
  a: string;
  b: string;
  cosine: number;
}

export interface GraphIntelResult {
  method: string;
  disclaimer: string;
  nodesAnalyzed: number;
  edgesAnalyzed: number;
  elapsedMs: number;
  layers: number;
  nodeInsights: GraphIntelNode[];
  similarPairs: GraphIntelPair[];
  structuralNeighbors: GraphIntelNode[];
}

export interface TraceResult {
  traceId: string;
  caseId: string | null;
  wallet: string;
  walletNorm: string;
  chain: ChainId;
  hopCap: number;
  status: "complete" | "inconclusive" | "error";
  dataSource: string;
  completeness: "full" | "partial" | "empty";
  completenessNote: string;
  dataGaps?: DataGap[];
  datasetVersion: string;
  datasetUpdatedAt: string | null;
  attributed: VaspCandidate | null;
  candidates: VaspCandidate[];
  confidenceBand: "high" | "moderate" | "low" | "insufficient" | "none";
  heuristicDisclaimer: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  riskFlags: RiskFlag[];
  txsAnalyzed: number;
  addressesVisited: number;
  elapsedMs: number;
  createdAt: string;
  reviewDecision: "pending" | "accepted" | "rejected" | "inconclusive";
  limitations: string[];
  error?: string;
}

export interface AnalyzeInput {
  wallet: string;
  chain: ChainId;
  hopCap?: number;
  caseId?: string;
}

export const HEURISTIC_DISCLAIMER =
  "This score is a heuristic investigative aid, not a statistically calibrated probability and not legal proof.";

export const LEAD_NOT_PROOF =
  "This output is an investigative lead and not legal proof. It does not identify a beneficial owner, and it must not be used as a basis for freezing assets or filing charges without independent investigator review.";
