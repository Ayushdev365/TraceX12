-- VASPTrace schema. Unowned demo data (auth off). Case IDs are
-- investigation reference numbers, not personal identifiers.

create table if not exists vasps (
  id text primary key,
  name text not null,
  category text not null default 'exchange',
  jurisdiction text,
  website text,
  notes text
);

create table if not exists vasp_addresses (
  id serial primary key,
  vasp_id text not null references vasps(id),
  chain text not null,
  address text not null,
  address_norm text not null,
  label text not null,
  source text not null,
  source_url text,
  verification_status text not null default 'public_label',
  verified_at date,
  reliability text not null default 'medium',
  unique (chain, address_norm)
);

create index if not exists vasp_addresses_norm_idx on vasp_addresses (chain, address_norm);
create index if not exists vasp_addresses_vasp_idx on vasp_addresses (vasp_id);

create table if not exists risk_entities (
  id serial primary key,
  chain text not null,
  address text not null,
  address_norm text not null,
  entity_type text not null,
  name text not null,
  source text not null,
  source_url text,
  notes text,
  unique (chain, address_norm)
);

create index if not exists risk_entities_norm_idx on risk_entities (chain, address_norm);

create table if not exists dataset_meta (
  id text primary key,
  version text not null,
  updated_at timestamptz not null default now(),
  notes text
);

create table if not exists cases (
  id text primary key,
  title text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists traces (
  id text primary key,
  case_id text,
  wallet_address text not null,
  wallet_norm text not null,
  chain text not null,
  hop_cap integer not null default 3,
  status text not null default 'complete',
  dataset_version text,
  data_source text not null,
  completeness text not null default 'full',
  attributed_vasp_id text,
  confidence_score integer,
  confidence_band text,
  review_decision text not null default 'pending',
  review_note text,
  result_json text not null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists traces_created_idx on traces (created_at desc);
create index if not exists traces_case_idx on traces (case_id);

create table if not exists trace_nodes (
  id serial primary key,
  trace_id text not null references traces(id) on delete cascade,
  address text not null,
  address_norm text not null,
  hop integer not null,
  role text not null,
  label text,
  vasp_id text,
  tx_count integer not null default 0
);

create index if not exists trace_nodes_trace_idx on trace_nodes (trace_id);

create table if not exists trace_edges (
  id serial primary key,
  trace_id text not null references traces(id) on delete cascade,
  from_address text not null,
  to_address text not null,
  tx_hash text not null,
  amount_display text,
  symbol text,
  timestamp_unix bigint,
  is_token boolean not null default false
);

create index if not exists trace_edges_trace_idx on trace_edges (trace_id);

create table if not exists predictions (
  id serial primary key,
  trace_id text not null references traces(id) on delete cascade,
  vasp_id text not null,
  vasp_name text not null,
  score integer not null,
  hop_distance integer not null,
  ranked integer not null,
  breakdown_json text not null
);

create table if not exists reports (
  id serial primary key,
  trace_id text not null references traces(id) on delete cascade,
  kind text not null,
  payload_json text not null,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id serial primary key,
  action text not null,
  target_id text,
  detail text,
  created_at timestamptz not null default now()
);

create table if not exists tx_cache (
  id serial primary key,
  chain text not null,
  address_norm text not null,
  payload_json text not null,
  source text not null,
  fetched_at timestamptz not null default now(),
  unique (chain, address_norm)
);
