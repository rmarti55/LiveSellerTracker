#!/usr/bin/env node
// Whatnot data-feasibility spike — reproducible headless probe.
// Proves: the public GraphQL API answers anonymous, cookie-less, server-side
// requests (no browser, no login) and accepts arbitrary ad-hoc queries.
//
// Run: node spike/probe.mjs
//
// Findings this reproduces:
//   - HTML page routes are Cloudflare-gated (HTTP 403 to plain curl).
//   - The /services/graphql/ API route returns 200 to anonymous POSTs.
//   - Introspection is disabled, BUT ad-hoc queries execute and errors leak
//     the schema ("Did you mean...", arg types) so queries are reconstructable.

import { writeFileSync, mkdirSync } from 'node:fs';

const ENDPOINT = 'https://www.whatnot.com/services/graphql/';
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36';

async function gql(operationName, query, variables = {}) {
  const res = await fetch(`${ENDPOINT}?operationName=${operationName}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json', 'user-agent': UA },
    body: JSON.stringify({ operationName, query, variables }),
  });
  const json = await res.json().catch(() => ({ parseError: true }));
  return { status: res.status, json };
}

const CASES = [
  {
    name: 'Reachability',
    op: 'Probe',
    q: 'query Probe { __typename }',
    v: {},
    expect: 'HTTP 200, {data:{__typename:"Query"}} — endpoint answers anonymous requests',
  },
  {
    name: 'RealData',
    op: 'FeedProbe',
    q: 'query FeedProbe($id: ID!) { getFeedFromOnboardingOption(id: $id) { __typename id title } }',
    v: { id: 'BROWSE_FEED' },
    expect: 'HTTP 200 with real Feed data (title "Browse By Category")',
  },
  {
    name: 'IntrospectionDisabled',
    op: 'IntrospectionQuery',
    q: 'query IntrospectionQuery { __schema { queryType { name } } }',
    v: {},
    expect: 'HTTP 400 "introspection is disabled" — must reconstruct queries from the app',
  },
];

async function main() {
  mkdirSync(new URL('./captures/', import.meta.url), { recursive: true });
  const results = [];
  for (const c of CASES) {
    const r = await gql(c.op, c.q, c.v);
    const ok = c.name === 'IntrospectionDisabled' ? r.status === 400 : r.status === 200 && r.json?.data;
    console.log(`[${ok ? 'PASS' : 'FAIL'}] ${c.name}: HTTP ${r.status}`);
    console.log(`       expect: ${c.expect}`);
    console.log(`       got:    ${JSON.stringify(r.json).slice(0, 160)}`);
    results.push({ ...c, status: r.status, response: r.json, pass: !!ok });
  }
  const out = new URL('./captures/probe-results.json', import.meta.url);
  writeFileSync(out, JSON.stringify({ endpoint: ENDPOINT, results }, null, 2));
  const passed = results.filter((r) => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed. Saved -> spike/captures/probe-results.json`);
}

main().catch((e) => {
  console.error('probe failed:', e);
  process.exit(1);
});
