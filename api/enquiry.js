import { createHash, randomUUID } from "node:crypto";
import { validateEnquiry } from "../lib/validation.mjs";
import { site } from "../src/data.mjs";
const required = [
  "ENQUIRY_WEBHOOK_URL",
  "ENQUIRY_WEBHOOK_TOKEN",
  "TURNSTILE_SECRET_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];
const httpsURL = (value) => {
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      !["localhost", "127.0.0.1", "::1"].includes(u.hostname)
    );
  } catch {
    return false;
  }
};
const timeout = () => AbortSignal.timeout(8000);
export function createHandler({
  env = process.env,
  fetcher = fetch,
  now = Date.now,
  uuid = randomUUID,
} = {}) {
  return async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    const reply = (code, message, extra = {}) =>
      res.status(code).json({ ok: code === 200, message, ...extra });
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return reply(405, "Use the enquiry form to send a request.");
    }
    if (req.headers.origin !== site.origin)
      return reply(403, "Please send your enquiry from the TAPEX website.");
    if (!/^application\/json(?:;|$)/i.test(req.headers["content-type"] || ""))
      return reply(415, "Please use the enquiry form.");
    if (Number(req.headers["content-length"]) > 12000)
      return reply(
        413,
        "Your enquiry is too long. Please shorten your message.",
      );
    let input = req.body;
    try {
      if (typeof input === "string") {
        if (Buffer.byteLength(input) > 12000)
          return reply(413, "Your enquiry is too long.");
        input = JSON.parse(input);
      }
      if (Buffer.byteLength(JSON.stringify(input) || "") > 12000)
        return reply(413, "Your enquiry is too long.");
    } catch {
      return reply(400, "Please check your enquiry details.");
    }
    const { data, errors } = validateEnquiry(input);
    if (Object.keys(errors).length)
      return reply(400, "Please check the highlighted details.", { errors });
    if (data.website)
      return reply(400, "We could not verify this enquiry. Please call TAPEX.");
    if (
      required.some((k) => !env[k]) ||
      !httpsURL(env.ENQUIRY_WEBHOOK_URL) ||
      !httpsURL(env.UPSTASH_REDIS_REST_URL)
    )
      return reply(
        503,
        "Online enquiries are not available yet. Please call or use WhatsApp.",
      );
    if (!data.turnstileToken)
      return reply(400, "Please complete the security check.");
    // Vercel supplies this trusted header. Never trust arbitrary x-forwarded-for chains.
    const ip = String(
      req.headers["x-vercel-forwarded-for"] ||
        req.socket?.remoteAddress ||
        "unknown",
    )
      .split(",")[0]
      .trim();
    const bucket = Math.floor(now() / 600000);
    const key =
      "tapex:enquiry:" +
      createHash("sha256")
        .update(env.ENQUIRY_WEBHOOK_TOKEN + ip + bucket)
        .digest("hex");
    try {
      const limit = await fetcher(
        env.UPSTASH_REDIS_REST_URL.replace(/\/$/, "") + "/pipeline",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify([
            ["INCR", key],
            ["EXPIRE", key, 1200],
          ]),
          signal: timeout(),
        },
      );
      const counts = await limit.json();
      if (
        !limit.ok ||
        !Array.isArray(counts) ||
        counts.some((x) => x.error) ||
        !Number.isInteger(counts[0]?.result)
      )
        throw Error("Rate limit unavailable");
      if (counts[0].result > 5) {
        res.setHeader("Retry-After", "600");
        return reply(
          429,
          "Too many attempts. Please try again in ten minutes or call us.",
        );
      }
      const check = await fetcher(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secret: env.TURNSTILE_SECRET_KEY,
            response: data.turnstileToken,
            remoteip: ip,
          }),
          signal: timeout(),
        },
      );
      const verified = await check.json();
      if (
        !check.ok ||
        verified.success !== true ||
        verified.hostname !== new URL(site.origin).hostname ||
        verified.action !== "enquiry"
      )
        return reply(
          400,
          "The security check expired or could not be verified. Please try again.",
        );
      const enquiryId = uuid();
      const { turnstileToken, website, ...enquiry } = data;
      const delivered = await fetcher(env.ENQUIRY_WEBHOOK_URL, {
        method: "POST",
        redirect: "error",
        headers: {
          Authorization: `Bearer ${env.ENQUIRY_WEBHOOK_TOKEN}`,
          "Content-Type": "application/json",
          "Idempotency-Key": enquiryId,
        },
        body: JSON.stringify({
          enquiryId,
          receivedAt: new Date(now()).toISOString(),
          privacyNoticeVersion: "2026-10-26",
          ...enquiry,
        }),
        signal: timeout(),
      });
      let receipt;
      try {
        receipt = await delivered.json();
      } catch {
        receipt = null;
      }
      if (
        !delivered.ok ||
        receipt?.accepted !== true ||
        receipt?.enquiryId !== enquiryId
      )
        return reply(
          502,
          "We could not confirm delivery. Please call TAPEX or use WhatsApp; your enquiry is not confirmed.",
        );
      return reply(
        200,
        "Your enquiry has been received by TAPEX. We’ll use your details to respond.",
        { enquiryId },
      );
    } catch {
      return reply(
        503,
        "We could not confirm delivery. Please try again later, call TAPEX or use WhatsApp.",
      );
    }
  };
}
export default createHandler();
