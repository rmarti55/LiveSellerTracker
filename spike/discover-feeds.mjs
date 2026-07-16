#!/usr/bin/env node
/**
 * One-time helper: probe LivestreamTagNode ids and print slug-ready registry rows.
 * Usage: node spike/discover-feeds.mjs [tagId ...]
 * Default: scans tag ids 850–2500 in steps (see PROBE_IDS).
 */

const ENDPOINT = "https://www.whatnot.com/services/graphql/";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";

const QUERY = /* GraphQL */ `
  query GetLiveShowsMin($feedId: ID!, $objectSize: Int) {
    feed: getFeedFromOnboardingOption(id: $feedId) {
      id
      title
      objects(first: $objectSize) {
        totalCount
        edges {
          node {
            ... on FeedEntity {
              object {
                __typename
                ... on LiveStream {
                  activeViewers
                }
              }
            }
          }
        }
      }
    }
  }
`;

function feedId(tagId) {
  const node = `LivestreamTagNode:${tagId}`;
  return `CATEGORY_FEED_V2:${Buffer.from(node).toString("base64")}`;
}

async function probeTag(tagId) {
  const res = await fetch(`${ENDPOINT}?operationName=GetLiveShowsMin`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      "user-agent": UA,
    },
    body: JSON.stringify({
      operationName: "GetLiveShowsMin",
      query: QUERY,
      variables: { feedId: feedId(tagId), objectSize: 30 },
    }),
  });
  const json = await res.json();
  if (json.errors?.length) return null;
  const feed = json.data?.feed;
  if (!feed?.title) return null;
  const edges = feed.objects?.edges ?? [];
  const viewers = edges.reduce((sum, e) => {
    const v = e?.node?.object?.activeViewers ?? 0;
    return sum + (typeof v === "number" ? v : 0);
  }, 0);
  return {
    tagId,
    label: feed.title,
    feedId: feed.id,
    totalCount: feed.objects?.totalCount ?? 0,
    sampleViewers: viewers,
  };
}

const PROBE_IDS = [];
for (let id = 850; id <= 2500; id++) PROBE_IDS.push(id);

const ids = process.argv.slice(2).map(Number).filter(Boolean);
const toScan = ids.length ? ids : PROBE_IDS;

const results = [];
for (const tagId of toScan) {
  try {
    const row = await probeTag(tagId);
    if (row && row.totalCount > 0) results.push(row);
  } catch {
    /* skip */
  }
  await new Promise((r) => setTimeout(r, 120));
}

results.sort((a, b) => b.sampleViewers - a.sampleViewers);

console.log("slug | tagId | label | totalCount | sampleViewers");
for (const r of results) {
  const slug = r.label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  console.log(`${slug} | ${r.tagId} | ${r.label} | ${r.totalCount} | ${r.sampleViewers}`);
}
