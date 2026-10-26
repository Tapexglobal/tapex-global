# Google Ads and conversion measurement

Reviewed 26 October 2026 against [Google Ads destination requirements](https://support.google.com/adspolicy/answer/6368661), [misrepresentation policy](https://support.google.com/adspolicy/answer/6020955), [Consent Mode setup](https://developers.google.com/tag-platform/security/guides/consent) and [consent debugging](https://developers.google.com/tag-platform/security/guides/consent-debugging). These policies require functioning, accessible, useful destinations and accurate representations. This implementation does not imply Google approval.

## Landing-page readiness
The four country guides use one reusable layout with distinct substantial content. Match campaign country, keyword and ad claim to `/uk`, `/australia`, `/canada` or `/germany`. Each gives practical planning questions, official sources, relevant assessment action, About/Contact/policy navigation and availability limits. All content renders as static HTML. No conditional offer, fake urgency, jobs or visa guarantees are published. Do not launch form-led ads until actual enquiry delivery is verified; currently the website explicitly directs visitors to phone/WhatsApp.

## Event contract

| Event | Trigger | Measurement status | Allowed parameters |
| --- | --- | --- | --- |
| `consultation_start` | First focus in an enabled assessment form | Funnel diagnostic, not conversion | Clean `page_path` only |
| `form_submit_success` | First-party endpoint returns `ok:true` and opaque enquiry ID after matching delivery receipt | Candidate primary online enquiry conversion after configuration | `page_path`, opaque `enquiry_id` |
| `whatsapp_click` | Visitor clicks a configured WhatsApp link | Secondary engagement; not a delivered message or qualified lead | `page_path` |
| `phone_click` | Visitor clicks a `tel:` link | Secondary engagement; not an answered call | `page_path` |
| Qualified lead (offline) | Staff verifies a real enquiry against documented CRM criteria | Separate optional offline outcome | Opaque CRM ID, permitted click ID, consent, timestamp and configured action |

Never include name, phone, email, qualification, intake, free-form message or full URL/query/referrer in analytics parameters. IDs are opaque, not contact-derived hashes. URLs can still be observed by configured tag vendors: use identifiers-only campaign URLs, never put personal data in URLs, and validate tag behavior with Tag Assistant. Configure GA4 enhanced measurement carefully; disable automatic form interactions to avoid false submissions.

## Direct Google tags
Set the real `PUBLIC_GA4_ID`, optionally `PUBLIC_GOOGLE_ADS_ID` and `PUBLIC_GOOGLE_ADS_FORM_LABEL`. No fake IDs are supplied. The confirmed enquiry event sends to GA4 only with analytics consent. Direct Ads conversion fires only after receipt and advertising consent, with the opaque enquiry ID as `transaction_id` to aid deduplication. Do not import the same GA4 event into Ads as a second primary conversion when direct Ads tracking already counts it.

## Google Tag Manager alternative
Set `PUBLIC_GTM_ID` and leave direct Google IDs blank; build rejects both approaches together. Conservative basic-mode gating loads GTM only when both optional permissions are granted. This intentionally sacrifices measurement rather than relying on an unaudited container. Configure a Consent Initialization template to respect/update consent; require all relevant permissions on each tag. Create custom-event triggers for the event contract above. Configure Conversion Linker with appropriate consent checks and a Google Ads conversion tag for acknowledged form delivery, using the approved action/label and opaque ID. Add no custom HTML scripts that violate the site CSP. Google-tag path handles its own linking; GTM linker setup is an account task, not already active.

## Consent and attribution
All four Consent Mode v2 flags default to denied before optional scripts: `analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`. No optional Google script loads before its required consent. Visitors can grant analytics and advertising separately, save essential-only, and reopen settings in the footer. Withdrawing a loaded preference reloads the page to stop tags; previous cookies may require browser deletion. This is a conservative first-party preference UI, not a certified CMP or legal-compliance certification.

After advertising consent only, allowlisted `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`, `gbraid` and `wbraid` identifiers may be kept in session storage and attached to the private enquiry payload. The character filter rejects emails, spaces and URL values; campaign taxonomy must also forbid personal data. No identifiers are captured before permission, and withdrawal clears them. Server strips attribution when consent is absent. Avoid parallel GA4/GTM installations or manual ad snippets.

## Account-dependent features
- **Enhanced conversions:** deliberately not implemented or enabled; requires explicit business/privacy approval, secure hashing/transport design and account configuration. No personal data is sent to tags by this code.
- **Call reporting:** use real published contact numbers. Google forwarding-number/call reporting must be configured in an eligible Ads account; no forwarding number is invented and phone clicks are not reported as calls.
- **Offline imports:** optional design only. A secure CRM worker should validate consent and attribution, keep a private lead ID, record qualification criteria/time, map only approved click identifiers to the correct Ads import action, deduplicate by lead/event and record retries/results. Use service account/OAuth secrets server-side with restricted permissions. Set retention/access controls; do not put CRM exports or contact records in this repository. No import job or CRM connection currently exists.

## Verification before paid traffic
With approval and genuine account identifiers: use Tag Assistant to verify default-denied order and individual preferences; confirm no optional requests before permission; check one event per action and no PII in network payloads; test successful delivery versus validation/server failure; confirm linker and Ads receipt diagnostics; validate deduplication and withdrawal; test the exact ad destination on mobile and AdsBot access. Observe business-qualified outcomes separately from clicks. Obtain business/legal approval for claims, policies, processors and marketing consent before activation.
