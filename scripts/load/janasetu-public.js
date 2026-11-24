import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

const failures = new Rate("janasetu_request_failures");
const baseUrl = (__ENV.BASE_URL || "").replace(/\\/+$/, "");
if (!baseUrl) throw new Error("Set BASE_URL to a staging deployment URL.");
const parsedBase = new URL(baseUrl);
const productionHosts = new Set(["jana-setu-ai.vercel.app", "janasetu-ai.vercel.app"]);
if (productionHosts.has(parsedBase.hostname) && __ENV.ALLOW_PRODUCTION_LOAD_TEST !== "true") {
  throw new Error("Production load tests are blocked by default. Use an isolated staging project or explicitly set ALLOW_PRODUCTION_LOAD_TEST=true during an approved change window.");
}
if (!productionHosts.has(parsedBase.hostname) && !["localhost", "127.0.0.1"].includes(parsedBase.hostname) && __ENV.ALLOW_STAGING_LOAD_TEST !== "true") {
  throw new Error("Non-local load tests require ALLOW_STAGING_LOAD_TEST=true and an isolated staging project.");
}

export const options = {
  stages: [
    { duration: "2m", target: 10 },
    { duration: "3m", target: 25 },
    { duration: "5m", target: 50 },
    { duration: "5m", target: 100 },
    { duration: "3m", target: 0 }
  ],
  thresholds: {
    http_req_failed: ["rate<0.005"],
    http_req_duration: ["p(95)<750", "p(99)<1500"],
    janasetu_request_failures: ["rate<0.005"]
  },
  discardResponseBodies: true
};

export default function () {
  const responses = http.batch([
    ["GET", `${baseUrl}/api/health`, null, { tags: { route: "health" } }],
    ["GET", `${baseUrl}/api/schemes`, null, { tags: { route: "schemes" } }],
    ["GET", `${baseUrl}/api/schemes/open-data?q=agriculture`, null, { tags: { route: "catalogue-search" } }]
  ]);
  const expected = [200, 200, 200];
  responses.forEach((response, index) => {
    const ok = check(response, { [`${["health", "schemes", "catalogue-search"][index]} returns 200`]: (r) => r.status === expected[index] });
    failures.add(!ok);
  });
  sleep(1);
}
