# TODO — Data Expansion Plan

## Current State
- **Providers**: 303,909 normalizing, ~214K+ seeded (seed running)
- **Payments**: 1,441,863 Texas records downloaded, normalized, waiting to seed
- **Specialties**: 810 seeded
- **Stats**: Generated (will regenerate after full seed)

---

## Phase 1: Seed Remaining Data
1. Wait for provider seed to finish (303K target)
2. Fix payment seed script to skip NPIs not in providers table (avoid FK failures)
3. Seed 1.4M payments
4. Regenerate stats
5. Verify provider detail pages show payment data

---

## Phase 2: Medicare Utilization Data

**Source**: Medicare Physician & Other Practitioners by Provider dataset
**URL**: https://data.cms.gov/provider-summary-by-type-of-service/medicare-physician-other-practitioners/medicare-physician-other-practitioners-by-provider-and-service
**Format**: Bulk CSV download
**Key**: NPI (direct join with our providers table)

**Fields we want**:
- `Rndrng_NPI` — Provider NPI (join key)
- `Tot_Benes` — Total unique Medicare patients
- `Tot_Srvcs` — Total services performed
- `Tot_Mdcr_Pymt_Amt` — Total Medicare payment amount
- `HCPCS_Cd` / `HCPCS_Desc` — Procedure codes and descriptions
- `Place_Of_Srvc` — Facility vs office setting

**Schema addition**:
```sql
CREATE TABLE medicare_utilization (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  provider_npi VARCHAR(10) NOT NULL REFERENCES providers(npi) ON DELETE CASCADE,
  hcpcs_code VARCHAR(10),
  hcpcs_description TEXT,
  place_of_service VARCHAR(1),
  total_beneficiaries INTEGER,
  total_services INTEGER,
  total_medicare_payment INTEGER, -- cents
  avg_medicare_payment INTEGER, -- cents per service
  program_year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_medicare_util_npi ON medicare_utilization(provider_npi);
CREATE INDEX idx_medicare_util_year ON medicare_utilization(program_year);
```

**Pipeline**:
- `scripts/ingest/fetch-medicare-util.ts` — Download CSV from data.cms.gov
- Filter for Texas (Rndrng_Prvdr_State_Abrvtn = 'TX')
- Normalize and seed into medicare_utilization table

**UI additions**:
- Provider detail page: "Medicare Activity" section
  - Total patients served (font-mono, big number)
  - Total services performed
  - Total Medicare payments received
  - Top procedures table (HCPCS code, description, count, payment)
- Provider card: optional "high volume" indicator if > X patients

---

## Phase 3: Medicare Part D Prescriber Data

**Source**: Medicare Part D Prescribers by Provider and Drug dataset
**URL**: https://data.cms.gov/provider-summary-by-type-of-service/medicare-part-d-prescribers/medicare-part-d-prescribers-by-provider-and-drug
**Format**: Bulk CSV download
**Key**: NPI (direct join)

**Fields we want**:
- `Prscrbr_NPI` — Provider NPI (join key)
- `Brnd_Name` — Drug brand name
- `Gnrc_Name` — Drug generic name
- `Tot_Clms` — Total prescription claims
- `Tot_Drug_Cst` — Total drug cost
- `Tot_Benes` — Total patients prescribed to
- `GE65_Tot_Clms` — Claims for 65+ patients

**Schema addition**:
```sql
CREATE TABLE prescriber_data (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  provider_npi VARCHAR(10) NOT NULL REFERENCES providers(npi) ON DELETE CASCADE,
  brand_name TEXT,
  generic_name TEXT NOT NULL,
  total_claims INTEGER NOT NULL,
  total_drug_cost INTEGER NOT NULL, -- cents
  total_beneficiaries INTEGER,
  program_year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_prescriber_npi ON prescriber_data(provider_npi);
CREATE INDEX idx_prescriber_drug ON prescriber_data(generic_name);
CREATE INDEX idx_prescriber_year ON prescriber_data(program_year);
```

**Pipeline**:
- `scripts/ingest/fetch-prescriber.ts` — Download CSV
- Filter for Texas
- Normalize and seed

**UI additions**:
- Provider detail page: "Prescribing Activity" section
  - Top drugs prescribed (table: drug name, claims, cost, patients)
  - Total prescriptions written (big number)
  - Total drug cost
- **Killer feature**: Cross-reference with Open Payments
  - "Received $28,000 from Pfizer → Prescribed $340,000 of Pfizer drugs"
  - Match payment payer names to drug manufacturers
  - Display as a linked insight on the provider page

---

## Phase 4: Provider Performance Scores (MIPS/Care Compare)

**Source**: CMS Care Compare / MIPS Performance dataset
**URL**: https://data.cms.gov/provider-data/dataset/mips-performance
**Format**: Bulk CSV
**Key**: NPI

**Fields we want**:
- `npi` — Provider NPI
- `final_score` — Overall MIPS score (0-100)
- `quality_score` — Quality category score
- `pi_score` — Promoting Interoperability score
- `ia_score` — Improvement Activities score
- `cost_score` — Cost category score
- `org_name` — Practice/group name
- `facility_based` — Whether facility-based scoring applied

**Schema addition**:
```sql
CREATE TABLE performance_scores (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  provider_npi VARCHAR(10) NOT NULL REFERENCES providers(npi) ON DELETE CASCADE,
  final_score NUMERIC(5,2),
  quality_score NUMERIC(5,2),
  promoting_interoperability_score NUMERIC(5,2),
  improvement_activities_score NUMERIC(5,2),
  cost_score NUMERIC(5,2),
  program_year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider_npi, program_year)
);
CREATE INDEX idx_perf_npi ON performance_scores(provider_npi);
```

**Pipeline**:
- `scripts/ingest/fetch-mips.ts` — Download CSV
- Filter for NPIs in our providers table
- Normalize and seed

**UI additions**:
- Provider detail page: "Performance" section
  - Overall MIPS score as a circular gauge or bold number out of 100
  - Breakdown: Quality, Cost, Interoperability, Improvement
  - Comparison to specialty average: "Scored 82/100 vs. 71 avg for Cardiologists in Texas"
- Provider card: optional score badge if available

---

## Phase 5: Provider Page Redesign (after all data)

With all 4 data sources linked to each provider, the detail page becomes:

```
[Name] [Credential]              [MIPS: 82/100]
Cardiology · Houston, TX

─── DETAILS ──────────────────────────────────
NPI: 1234567890 · Individual · Registered Jan 2019
14251 Edgemere Blvd, El Paso, TX 79938
Phone: (915) 292-2065

─── MEDICARE ACTIVITY ────────────────────────
1,247 patients · 4,891 services · $892,400 received
Top procedures:
  99213 Office visit, est. patient    1,204  $48,160
  99214 Office visit, detailed          892  $53,520
  93000 Electrocardiogram               445  $8,900

─── PRESCRIBING ──────────────────────────────
3,421 prescriptions · $1.2M total drug cost
Top drugs:
  Lipitor (atorvastatin)     847 claims  $340,000
  Plavix (clopidogrel)       412 claims  $98,000
  Eliquis (apixaban)         298 claims  $210,000

─── PHARMA PAYMENTS ──────────────────────────
$47,200 from 3 companies in 2024
  Pfizer         ████████████████  $28,000
  Merck          ████████          $12,000
  AstraZeneca    ████               $7,200

  ⚠ Pfizer paid $28K → Provider prescribed $340K of Pfizer drugs

─── PERFORMANCE ──────────────────────────────
MIPS Score: 82/100 (avg for Cardiology in TX: 71)
  Quality: 88  Cost: 74  Interoperability: 90  Activities: 80
```

This is the page that makes someone pay $29/mo. No one else has all this in one place.

---

## Execution Order
1. ✅ Providers seeding (running now)
2. Payments seeding (next)
3. Medicare Utilization (fetch + schema + seed + UI)
4. Prescriber Data (fetch + schema + seed + UI)
5. MIPS Scores (fetch + schema + seed + UI)
6. Cross-reference insights (pharma payments ↔ prescribing)
7. Regenerate all stats
8. Provider page redesign with all sections
