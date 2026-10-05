# TraceX

### Blockchain Intelligence for Crypto Wallet Tracing & VASP Attribution

> **TraceX helps investigators understand where cryptocurrency funds move, discover connections between wallets, and identify the Virtual Asset Service Provider (VASP) most closely associated with an unknown wallet — with evidence behind the result.**

---

##  Overview

Following cryptocurrency transactions manually can become difficult when funds move through multiple wallets, repeated transactions, and different transaction paths.

**TraceX** is a blockchain intelligence platform built to simplify this process.

Give TraceX an unknown cryptocurrency wallet address, and the system analyses its available blockchain activity, builds a transaction graph, follows the flow of funds across multiple hops, and compares the observed relationships with known VASP addresses.

Instead of simply returning a VASP name, TraceX also explains:

**Why was this VASP identified?**

The platform presents the transaction path, intermediate wallets, supporting evidence, attribution score, and risk indicators through an interactive investigation interface.

---

##  Problem Statement

### Smart India Hackathon 2026 — PS 182

**Automated Attribution of Unknown Cryptocurrency Wallets to Nearest Virtual Asset Service Providers (VASPs) through Blockchain Intelligence APIs**

Cryptocurrency transactions are transparent on public blockchains, but understanding the relationships between unknown wallets and known VASPs can require significant manual investigation.

TraceX aims to reduce this effort by combining:

- Blockchain intelligence APIs
- Multi-hop transaction tracing
- Graph-based analysis
- Known VASP address information
- Attribution scoring
- Evidence-based investigation
- Risk and relationship analysis

---

## 🔍 What TraceX Does

### 1. Wallet Investigation

Enter an unknown cryptocurrency wallet address and start an investigation.

### 2. Blockchain Data Collection

Retrieve available transaction and token-transfer information from supported blockchain sources.

### 3. Transaction Graph

Convert transaction relationships into an interactive graph containing:

- Investigated wallet
- Intermediate wallets
- Counterparties
- Structural neighbours
- Risk-related addresses
- Known VASP addresses

### 4. Multi-Hop Tracing

Follow transaction relationships across multiple hops to discover possible connections with known VASPs.

### 5. VASP Attribution

Generate candidate VASPs based on the observed transaction relationships and available address labels.

### 6. Evidence & Explainability

TraceX does not only provide a result.

It shows the evidence behind the result, including:

- Graph proximity
- Label reliability
- Transaction consistency
- Path strength
- Temporal behaviour
- Transaction relationships

### 7. Risk & Network Analysis

Investigators can explore unusual relationships, risk indicators, and structural connections around the investigated wallet.

---

##  How It Works

```text
                UNKNOWN WALLET
                      │
                      ▼
          ┌──────────────────────┐
          │ Blockchain Data APIs │
          └──────────┬───────────┘
                     │
                     ▼
             Transaction Data
                     │
                     ▼
          ┌──────────────────────┐
          │ Transaction Graph    │
          │ Multi-Hop Traversal  │
          └──────────┬───────────┘
                     │
                     ▼
            Candidate VASPs
                     │
                     ▼
          ┌──────────────────────┐
          │ Attribution Engine   │
          │                      │
          │ • Graph Proximity    │
          │ • Label Reliability  │
          │ • Tx Consistency     │
          │ • Path Strength      │
          │ • Temporal Pattern   │
          └──────────┬───────────┘
                     │
                     ▼
             Attribution Result
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
      Evidence             Risk Analysis
          │                     │
          └──────────┬──────────┘
                     ▼
             INVESTIGATION VIEW
