/* Public configuration contains identifiers only. No contact fields enter analytics. */
(() => {
  "use strict";
  const config = JSON.parse(
    document.querySelector("#site-config")?.textContent || "{}",
  );
  const store = {
    get(key, session = false) {
      try {
        return JSON.parse(
          (session ? sessionStorage : localStorage).getItem(key),
        );
      } catch {
        return null;
      }
    },
    set(key, value, session = false) {
      try {
        (session ? sessionStorage : localStorage).setItem(
          key,
          JSON.stringify(value),
        );
      } catch {
        /* Storage may be disabled. */
      }
    },
    remove(key, session = false) {
      try {
        (session ? sessionStorage : localStorage).removeItem(key);
      } catch {
        /* Ignore. */
      }
    },
  };
  let consent = store.get("tapex-consent-v1") || {
    analytics: false,
    ads: false,
  };
  let tagsLoaded = false;
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  function attribution() {
    if (!consent.ads) {
      store.remove("tapex-attribution", true);
      return {};
    }
    const params = new URLSearchParams(location.search);
    const saved = store.get("tapex-attribution", true) || {};
    for (const key of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "gclid",
      "gbraid",
      "wbraid",
    ]) {
      const value = params.get(key);
      if (value && /^[A-Za-z0-9_.~-]{1,150}$/.test(value)) saved[key] = value;
    }
    store.set("tapex-attribution", saved, true);
    return saved;
  }
  function loadTags() {
    gtag("consent", "update", {
      analytics_storage: consent.analytics ? "granted" : "denied",
      ad_storage: consent.ads ? "granted" : "denied",
      ad_user_data: consent.ads ? "granted" : "denied",
      ad_personalization: consent.ads ? "granted" : "denied",
    });
    attribution();
    if (tagsLoaded) return;
    const script = document.createElement("script");
    script.async = true;
    if (config.gtmId && consent.analytics && consent.ads) {
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(config.gtmId)}`;
    } else if (
      !config.gtmId &&
      ((consent.analytics && config.ga4Id) || (consent.ads && config.adsId))
    ) {
      const id =
        consent.analytics && config.ga4Id ? config.ga4Id : config.adsId;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
      gtag("js", new Date());
      // Never send the current query string, hash or referring URL to analytics.
      if (consent.analytics && config.ga4Id)
        gtag("config", config.ga4Id, {
          page_location: location.origin + location.pathname,
          page_referrer: "",
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
        });
      if (consent.ads && config.adsId)
        gtag("config", config.adsId, {
          page_location: location.origin + location.pathname,
          page_referrer: "",
          allow_ad_personalization_signals: false,
        });
    } else return;
    document.head.append(script);
    tagsLoaded = true;
  }
  function track(event, extra = {}) {
    const permitted = [
      "whatsapp_click",
      "phone_click",
      "consultation_start",
      "form_submit_success",
    ];
    if (!permitted.includes(event)) return;
    const payload = { page_path: location.pathname, ...extra };
    if (config.gtmId) {
      if (consent.analytics && consent.ads)
        window.dataLayer.push({ event, ...payload });
    } else {
      if (consent.analytics && config.ga4Id)
        gtag("event", event, { ...payload, send_to: config.ga4Id });
      if (
        event === "form_submit_success" &&
        consent.ads &&
        config.adsId &&
        config.adsFormLabel
      )
        gtag("event", "conversion", {
          send_to: `${config.adsId}/${config.adsFormLabel}`,
          transaction_id: extra.enquiry_id,
        });
    }
  }
  const banner = document.querySelector(".consent");
  const analyticsCheck = document.querySelector("#analytics-consent"),
    adsCheck = document.querySelector("#ads-consent");
  function openPreferences() {
    analyticsCheck.checked = consent.analytics;
    adsCheck.checked = consent.ads;
    banner.hidden = false;
    banner.querySelector("input").focus();
  }
  document
    .querySelectorAll("[data-cookie-settings]")
    .forEach((b) => b.addEventListener("click", openPreferences));
  if (
    !store.get("tapex-consent-v1") &&
    (config.ga4Id || config.adsId || config.gtmId)
  )
    banner.hidden = false;
  document.querySelectorAll("[data-consent]").forEach((b) =>
    b.addEventListener("click", () => {
      const next =
        b.dataset.consent === "reject"
          ? { analytics: false, ads: false }
          : { analytics: analyticsCheck.checked, ads: adsCheck.checked };
      const changed =
        consent.analytics !== next.analytics || consent.ads !== next.ads;
      consent = next;
      store.set("tapex-consent-v1", consent);
      banner.hidden = true;
      if (!consent.ads) store.remove("tapex-attribution", true);
      if (tagsLoaded && changed) {
        location.reload();
        return;
      }
      loadTags();
    }),
  );
  loadTags();
  const menu = document.querySelector(".menu-toggle"),
    nav = document.querySelector("#navigation");
  function closeMenu() {
    nav.classList.remove("is-open");
    menu.setAttribute("aria-expanded", "false");
  }
  menu?.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  });
  nav
    ?.querySelectorAll("a")
    .forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu?.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menu.focus();
    }
  });
  document
    .querySelectorAll("[data-event]")
    .forEach((a) => a.addEventListener("click", () => track(a.dataset.event)));
  const form = document.querySelector("#enquiry-form");
  let started = false,
    token = "",
    widget;
  if (config.enquiryEnabled && config.turnstileSiteKey && form) {
    form.hidden = false;
    document.querySelector(".form-availability").hidden = true;
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => {
      widget = window.turnstile.render("#turnstile", {
        sitekey: config.turnstileSiteKey,
        action: "enquiry",
        callback: (t) => {
          token = t;
        },
        "expired-callback": () => {
          token = "";
        },
        "error-callback": () => {
          token = "";
          status(
            "The security check could not load. Please call or use WhatsApp.",
            true,
          );
        },
      });
    };
    script.onerror = () =>
      status(
        "The security check could not load. Please call or use WhatsApp.",
        true,
      );
    document.head.append(script);
    form.addEventListener("focusin", () => {
      if (!started) {
        started = true;
        track("consultation_start");
      }
    });
    form.addEventListener("input", (e) => {
      e.target.setCustomValidity?.("");
      e.target.removeAttribute("aria-invalid");
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      if (!token) {
        status("Please complete the security check.", true);
        return;
      }
      const button = form.querySelector("[type=submit]");
      button.disabled = true;
      button.textContent = "Sending your enquiry…";
      status("Sending…");
      const fields = Object.fromEntries(new FormData(form));
      const payload = {
        ...fields,
        privacy: form.elements.privacy.checked,
        marketing: form.elements.marketing.checked,
        turnstileToken: token,
        adsConsent: consent.ads,
        attribution: attribution(),
      };
      try {
        const response = await fetch("/api/enquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(20000),
        });
        const result = await response.json();
        if (
          !response.ok ||
          result.ok !== true ||
          typeof result.enquiryId !== "string"
        ) {
          for (const [name, message] of Object.entries(result.errors || {})) {
            const field = form.elements.namedItem(name);
            if (field?.setCustomValidity) {
              field.setCustomValidity(message);
              field.setAttribute("aria-invalid", "true");
            }
          }
          form.reportValidity();
          throw Error(
            result.message ||
              "Delivery could not be confirmed. Please call or use WhatsApp.",
          );
        }
        status(result.message);
        track("form_submit_success", { enquiry_id: result.enquiryId });
        form.reset();
        started = false;
      } catch (error) {
        status(
          error.name === "TimeoutError"
            ? "Delivery could not be confirmed. Please call or use WhatsApp."
            : error.message,
          true,
        );
      } finally {
        token = "";
        if (widget !== undefined) window.turnstile.reset(widget);
        button.disabled = false;
        button.textContent = "Request my free assessment ↗";
      }
    });
  }
  function status(message, error = false) {
    const node = document.querySelector("#form-status");
    if (node) {
      node.textContent = message;
      node.classList.toggle("error", error);
      node.focus();
    }
  }
})();
