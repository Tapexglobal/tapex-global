import { test } from "node:test";
import assert from "node:assert/strict";
import { createHandler } from "../api/enquiry.js";
import { validateEnquiry } from "../lib/validation.mjs";
const valid = {
  fullName: "Test Student",
  phone: "+91 98765 43210",
  email: "",
  destination: "United Kingdom",
  qualification: "Bachelor’s degree",
  privacy: true,
  marketing: false,
  turnstileToken: "synthetic-test-token",
};
const env = {
  ENQUIRY_WEBHOOK_URL: "https://crm.example.test/enquiry",
  ENQUIRY_WEBHOOK_TOKEN: "test-only-secret",
  TURNSTILE_SECRET_KEY: "test-only",
  UPSTASH_REDIS_REST_URL: "https://redis.example.test",
  UPSTASH_REDIS_REST_TOKEN: "test-only",
};
function mockFetch(options = {}) {
  return async (url, init) => {
    if (url.includes("/pipeline"))
      return {
        ok: !options.redisFailure,
        json: async () => [{ result: options.count || 1 }, { result: 1 }],
      };
    if (url.includes("siteverify"))
      return {
        ok: true,
        json: async () => ({
          success: !options.spam,
          hostname: options.hostname || "www.tapexglobalservices.com",
          action: options.action || "enquiry",
        }),
      };
    if (options.throw) throw Error("Network failure");
    const sent = JSON.parse(init.body);
    assert.ok(!("turnstileToken" in sent));
    assert.equal(init.headers.Authorization, "Bearer test-only-secret");
    return {
      ok: !options.deliveryFailure,
      json: async () => ({
        accepted: !options.missingReceipt,
        enquiryId: options.wrongId ? "wrong" : sent.enquiryId,
      }),
    };
  };
}
async function run({
  body = valid,
  method = "POST",
  origin = "https://www.tapexglobalservices.com",
  settings = env,
  options = {},
  headers = {},
} = {}) {
  let result;
  const res = {
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(c) {
      this.code = c;
      return this;
    },
    json(x) {
      result = x;
    },
  };
  await createHandler({
    env: settings,
    fetcher: mockFetch(options),
    uuid: () => "test-enquiry-id",
    now: () => 1793000000000,
  })(
    {
      method,
      headers: { origin, "content-type": "application/json", ...headers },
      body,
      socket: { remoteAddress: "127.0.0.1" },
    },
    res,
  );
  return { code: res.code, result, headers: res.headers };
}
test("accepts minimal valid enquiry; optional fields remain optional", () =>
  assert.deepEqual(validateEnquiry(valid).errors, {}));
test("requires country code, qualification, privacy and bounded fields", () => {
  for (const bad of [
    { phone: "9876543210" },
    { qualification: "fake" },
    { privacy: false },
    { fullName: "x" },
    { message: "x".repeat(1001) },
    { email: "broken" },
    { destination: "USA" },
  ])
    assert.ok(Object.keys(validateEnquiry({ ...valid, ...bad }).errors).length);
});
test("rejects non-string data and malformed bodies", async () => {
  assert.ok(
    Object.keys(validateEnquiry({ ...valid, phone: 42 }).errors).length,
  );
  assert.equal((await run({ body: "{bad" })).code, 400);
});
test("attribution is allowlisted and removed without consent", () => {
  assert.deepEqual(
    validateEnquiry({ ...valid, attribution: { gclid: "abc" } }).data
      .attribution,
    {},
  );
  assert.deepEqual(
    validateEnquiry({
      ...valid,
      adsConsent: true,
      attribution: {
        gclid: "ABC_123",
        utm_term: "student@example.com",
        phone: "secret",
      },
    }).data.attribution,
    { gclid: "ABC_123" },
  );
});
test("blocks cross-origin and non-POST requests", async () => {
  assert.equal((await run({ origin: "https://evil.example" })).code, 403);
  assert.equal((await run({ method: "GET" })).code, 405);
});
test("rejects large and unsupported content", async () => {
  assert.equal(
    (await run({ headers: { "content-length": "13000" } })).code,
    413,
  );
  assert.equal(
    (await run({ headers: { "content-type": "text/plain" } })).code,
    415,
  );
});
test("rejects honeypot and missing security token", async () => {
  assert.equal((await run({ body: { ...valid, website: "bot" } })).code, 400);
  assert.equal(
    (await run({ body: { ...valid, turnstileToken: "" } })).code,
    400,
  );
});
test("fails closed without credentials or secure endpoint", async () => {
  assert.equal((await run({ settings: {} })).code, 503);
  assert.equal(
    (
      await run({
        settings: { ...env, ENQUIRY_WEBHOOK_URL: "http://insecure.test" },
      })
    ).code,
    503,
  );
});
test("durable limiter rejects over limit and outage", async () => {
  assert.equal((await run({ options: { count: 6 } })).code, 429);
  assert.equal((await run({ options: { redisFailure: true } })).code, 503);
});
test("validates challenge success, hostname and action", async () => {
  for (const options of [
    { spam: true },
    { hostname: "evil.example" },
    { action: "other" },
  ])
    assert.equal((await run({ options })).code, 400);
});
test("never confirms delivery without matching explicit receipt", async () => {
  for (const options of [
    { deliveryFailure: true },
    { missingReceipt: true },
    { wrongId: true },
    { throw: true },
  ]) {
    const r = await run({ options });
    assert.ok(r.code >= 500);
    assert.equal(r.result.ok, false);
    assert.ok(!r.result.enquiryId);
  }
});
test("confirms only acknowledged delivery and returns opaque ID", async () => {
  const r = await run();
  assert.equal(r.code, 200);
  assert.equal(r.result.ok, true);
  assert.equal(r.result.enquiryId, "test-enquiry-id");
  assert.equal(r.headers["Cache-Control"], "no-store");
  assert.ok(!JSON.stringify(r.result).includes(valid.phone));
});
