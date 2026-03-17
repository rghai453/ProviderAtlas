# ProviderAtlas — Business Plan

## Product
The Bloomberg Terminal for healthcare provider intelligence. One page per provider combining NPI registry, pharma payments, Medicare utilization, prescribing data, and performance scores. No one else cross-references all five.

## Target Customers

| Segment | Need | Current Alternative | Our Price |
|---|---|---|---|
| Pharma/device sales reps | Who prescribes what, who competitors pay | IQVIA, Definitive Healthcare ($10K+/yr) | $29/mo |
| Healthcare recruiters | New providers, contact info, practice volume | Job boards, manual research | $29/mo |
| Hospital systems | Competitive intelligence, market analysis | Consultants ($50K+ engagements) | $29/mo |
| Journalists/researchers | Pharma payment transparency, conflicts of interest | Manual FOIA requests | Free tier (SEO driver) |
| Patients | Doctor lookup, payment transparency | Healthgrades, Vitals (no payment data) | Free tier (SEO traffic) |

## Revenue Streams

| Stream | Price | Margin |
|---|---|---|
| Pro subscription | $29/mo ($348/yr) | ~95% |
| Data list exports | $49–$149 one-time | ~98% |
| API access (future) | $99/mo | ~95% |

## Growth Engine
Programmatic SEO. 300K+ provider pages, thousands of specialty+city pages, city pages, ZIP pages. All indexed by Google. Someone searches "cardiologist houston" or "dr smith npi" → our page ranks → free organic traffic.

## Data Moat
Five free public datasets, cross-referenced by NPI:
1. **NPI Registry** — Provider identity, specialty, location, contact
2. **Open Payments** — Pharma/device payments to providers
3. **Medicare Utilization** — Patient volume, procedures, Medicare payments
4. **Part D Prescriber** — Drug prescriptions by provider
5. **MIPS Performance** — Quality scores and ratings

The insight "Pfizer paid this doctor $28K and he prescribed $340K of Pfizer drugs" doesn't exist anywhere else in one click.

## Cost Structure
- Hosting: Vercel free tier (or ~$20/mo if traffic spikes)
- Database: Neon free tier (or ~$19/mo for more storage)
- Email: Resend free tier (3K/mo)
- Stripe: 2.9% + $0.30 per transaction
- Total fixed cost: ~$0–$40/mo

## Unit Economics
- CAC: ~$0 (organic SEO traffic)
- LTV at 6-month avg retention: $174
- Gross margin: ~95%
- Break-even: ~2 paying subscribers

## Milestones
1. Launch with NPI + Open Payments data → first SEO pages indexed
2. Add Medicare utilization + prescriber data → "killer page" complete
3. Add MIPS scores → full provider intelligence profile
4. 100 Pro subscribers → $2,900 MRR
5. API access tier → B2B revenue
