# ReversePath email setup

Checked October 13, 2026. Release remains blocked until a real signup confirmation reaches an owned inbox and its link establishes the correct session. Supabase custom SMTP is currently disabled; confirmation is enabled. Waiting for the built-in sender's quota reset does not remove its team-recipient restriction. [Supabase SMTP requirements](https://supabase.com/docs/guides/auth/auth-smtp).

## Choose a provider

The user prefers Resend but owns no domain. No purchase is authorized or has been made.

| Option | Cost and limits | Decision |
| --- | --- | --- |
| Brevo Free with a verified existing mailbox | $0; 300 emails/day | Possible temporary route without buying a domain. Brevo documents replacing unauthenticated/free-mailbox sender domains with its own `brevosend.com` domain. Transactional activation/account review and actual inbox acceptance must succeed. |
| Resend Free with an owned domain | $0 email service; 3,000/month, 100/day, 3 domains; domain registration extra | Preferred durable setup with a brand-controlled sender. `resend.dev` is restricted to the account owner's address and cannot serve public registration. |

Sources: [Brevo limits](https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan), [Brevo sender replacement](https://help.brevo.com/hc/en-us/articles/16045394674066-Troubleshooting-Domain-authentication), [Resend pricing](https://resend.com/pricing), [Resend testing-domain restriction](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain). Brevo recommends authenticating an owned domain; its temporary replacement is not a permanent deliverability guarantee.

For an inexpensive domain, Porkbun's current standard `.in` registration/renewal is $7.83/year; `.com` is $11.08/year, with an announced increase to approximately $11.81 on November 1, 2026. A `.xyz` costs $2.04 for its first year but currently renews at $14.21. These are USD list prices for standard names, not a quote for a chosen available name; check the checkout total, renewal and any tax before approving a purchase. For lowest initial cost choose standard `.xyz`; for lower current ongoing cost consider `.in`. No name availability is asserted. [Official price list](https://porkbun.com/products/domains), [announced .com increase](https://kb.porkbun.com/article/201-why-did-com-prices-go-up-and-how-high-will-they-go). Public pricing API values were also checked this session.

## Brevo: try the free route

1. Create a free account at [Brevo](https://www.brevo.com/). Complete required account verification and ensure transactional sending is activated; contact Brevo support privately if activation requires review.
2. In Settings → Senders, Domains, IPs → Senders, add sender name `ReversePath` and an existing mailbox you own. Enter the emailed verification code inside Brevo. Brevo may rewrite the sender address under its temporary domain replacement policy; do not invent a `brevosend.com` address yourself.
3. Open Brevo's SMTP page. Generate an **SMTP key**, and copy the actual **SMTP login** shown there. The SMTP key is different from an API key or account password.
4. Enter the Brevo column below privately in Supabase and save. If the account refuses transactional sending without an authenticated domain, stop and use the Resend/domain route; do not repeatedly submit signup or weaken confirmation.

Sources: [create sender](https://help.brevo.com/hc/en-us/articles/208836149-Create-a-new-sender-From-name-and-From-email), [SMTP setup](https://help.brevo.com/hc/en-us/articles/7924908994450-Send-transactional-emails-using-Brevo-SMTP), [activation troubleshooting](https://help.brevo.com/hc/en-us/articles/115000188150-Troubleshooting-Issues-with-Brevo-SMTP).

## Resend: owned domain setup

1. Create a free [Resend account](https://resend.com/signup). Purchase a chosen domain privately only after approving its cost, or use a domain you later obtain/control. The application can stay at `reversepath-vibesprint.vercel.app`; it does not need to move.
2. In Resend → Domains → Add Domain, enter a sending subdomain such as `auth.your-owned-domain.in` (illustrative only). Select a suitable region.
3. In the registrar/DNS provider's DNS editor, add every sending-verification record exactly as Resend displays: DKIM TXT and SPF/return-path TXT/MX records with their exact names, values and MX priorities. Use DNS-only mode for email CNAME records if provided. Do not replace root mail MX records or create duplicate SPF records at the same name. No inbound email hosting purchase is needed for sending-only setup.
4. Click Verify in Resend and wait until sending verification succeeds. Use `noreply@auth.your-owned-domain.in` only after verifying that actual domain. Create a sending-access API key, preferably restricted to that domain, and enter it privately in Supabase's SMTP password field.

Sources: [domain verification](https://resend.com/docs/dashboard/domains/introduction), [API key permissions](https://resend.com/docs/dashboard/api-keys/introduction), [Supabase SMTP integration](https://resend.com/docs/send-with-supabase-smtp).

## Exact Supabase fields

Open the **ReversePath** project → Authentication → Email (under Notifications) → SMTP Settings, or [open the project SMTP settings](https://supabase.com/dashboard/project/kvytcttuskwwbmmmjjri/auth/smtp). Enable custom SMTP, enter these fields and Save:

| Supabase field | Brevo | Resend |
| --- | --- | --- |
| Host | `smtp-relay.brevo.com` | `smtp.resend.com` |
| Port | `465` (implicit TLS) | `465` (implicit TLS) |
| Username | Exact SMTP login from Brevo dashboard | `resend` |
| Password | Private Brevo SMTP key | Private Resend API key |
| Sender email | Mailbox verified as a Brevo sender | Address under your verified Resend sending domain |
| Sender name | `ReversePath` | `ReversePath` |

Keep email confirmation enabled. Keep keys exclusively in provider/Supabase dashboards; do not paste them into chat, repository files or client `VITE_*` settings. Supabase's own custom-SMTP email rate limit also applies (initially 30/hour); retain it for initial acceptance instead of increasing limits to force a pass.

## Delivery and release acceptance

After saving, report only “SMTP configured” and the provider name. Arrange an owned disposable test mailbox privately. Submit one real signup on the existing staged deployment. Confirm the provider event, actual inbox receipt, recognizable sender and usable confirmation link; then verify callback, authenticated refresh and logout/login. A 200 response, provider “delivered” status, reserved `example.com` recipient or admin-generated confirmation URL alone does not prove inbox delivery. Do not delete a preexisting real user while cleaning up a test.

Only after this gate passes, promote the already-verified staged Production deployment, run public workflow/mobile/demo acceptance, and safely integrate the verified branch into main. Preserve the working public `/demo` while blocked. No additional provider integration code or application rebuild is needed for SMTP dashboard configuration.
