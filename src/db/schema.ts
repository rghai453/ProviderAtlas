import {
  pgTable,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
  varchar,
  pgEnum,
  numeric,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Enums
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'pro']);
export const alertFrequencyEnum = pgEnum('alert_frequency', ['daily', 'weekly']);
export const entityTypeEnum = pgEnum('entity_type', ['individual', 'organization']);
export const payerTypeEnum = pgEnum('payer_type', ['pharma', 'device']);

// Users
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  stripeCustomerId: text('stripe_customer_id'),
  subscriptionTier: subscriptionTierEnum('subscription_tier').notNull().default('free'),
  subscriptionId: text('subscription_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Alerts
export const alerts = pgTable('alerts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  query: jsonb('query').notNull(),
  frequency: alertFrequencyEnum('frequency').notNull().default('weekly'),
  active: boolean('active').notNull().default(true),
  lastSent: timestamp('last_sent', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Specialties
export const specialties = pgTable('specialties', {
  code: varchar('code', { length: 20 }).primaryKey(),
  description: text('description').notNull(),
  grouping: text('grouping'),
  classification: text('classification'),
  specialization: text('specialization'),
  providerCount: integer('provider_count').notNull().default(0),
});

// Providers
export const providers = pgTable('providers', {
  npi: varchar('npi', { length: 10 }).primaryKey(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  credential: text('credential'),
  gender: varchar('gender', { length: 1 }),
  entityType: entityTypeEnum('entity_type').notNull(),
  organizationName: text('organization_name'),
  taxonomyCode: varchar('taxonomy_code', { length: 20 }).references(() => specialties.code),
  specialtyDescription: text('specialty_description'),
  slug: text('slug').notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  fax: varchar('fax', { length: 20 }),
  addressLine1: text('address_line_1'),
  addressLine2: text('address_line_2'),
  city: text('city'),
  state: varchar('state', { length: 2 }),
  zip: varchar('zip', { length: 10 }),
  county: text('county'),
  acceptsMedicare: boolean('accepts_medicare').notNull().default(false),
  enumerationDate: timestamp('enumeration_date', { withTimezone: true }),
  lastUpdated: timestamp('last_updated', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Payments (Open Payments data)
export const payments = pgTable('payments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  providerNpi: varchar('provider_npi', { length: 10 })
    .notNull()
    .references(() => providers.npi, { onDelete: 'cascade' }),
  payerName: text('payer_name').notNull(),
  payerType: payerTypeEnum('payer_type'),
  amount: integer('amount').notNull(), // cents
  dateOfPayment: timestamp('date_of_payment', { withTimezone: true }),
  natureOfPayment: text('nature_of_payment'),
  formOfPayment: text('form_of_payment'),
  contextualInfo: text('contextual_info'),
  programYear: integer('program_year'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Facilities
export const facilities = pgTable('facilities', {
  npi: varchar('npi', { length: 10 }).primaryKey(),
  organizationName: text('organization_name').notNull(),
  otherOrgName: text('other_org_name'),
  addressLine1: text('address_line_1'),
  city: text('city'),
  state: varchar('state', { length: 2 }),
  zip: varchar('zip', { length: 10 }),
  phone: varchar('phone', { length: 20 }),
  taxonomyCode: varchar('taxonomy_code', { length: 20 }),
  specialtyDescription: text('specialty_description'),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Medicare Utilization (Medicare Physician & Other Practitioners by Provider and Service)
export const medicareUtilization = pgTable('medicare_utilization', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  providerNpi: varchar('provider_npi', { length: 10 })
    .notNull()
    .references(() => providers.npi, { onDelete: 'cascade' }),
  hcpcsCode: varchar('hcpcs_code', { length: 10 }).notNull(),
  hcpcsDescription: text('hcpcs_description'),
  placeOfService: varchar('place_of_service', { length: 1 }),
  totalBeneficiaries: integer('total_beneficiaries'),
  totalServices: numeric('total_services', { precision: 12, scale: 2 }),
  totalMedicarePayment: integer('total_medicare_payment'), // cents
  avgMedicarePayment: integer('avg_medicare_payment'), // cents
  programYear: integer('program_year'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Prescriber Data (Medicare Part D Prescribers by Provider and Drug)
export const prescriberData = pgTable('prescriber_data', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  providerNpi: varchar('provider_npi', { length: 10 })
    .notNull()
    .references(() => providers.npi, { onDelete: 'cascade' }),
  brandName: text('brand_name'),
  genericName: text('generic_name').notNull(),
  totalClaims: numeric('total_claims', { precision: 12, scale: 2 }),
  totalDrugCost: integer('total_drug_cost'), // cents
  totalBeneficiaries: integer('total_beneficiaries'),
  programYear: integer('program_year'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// MIPS Performance Scores
export const mipsScores = pgTable('performance_scores', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  providerNpi: varchar('provider_npi', { length: 10 })
    .notNull()
    .references(() => providers.npi, { onDelete: 'cascade' }),
  finalScore: numeric('final_score', { precision: 6, scale: 2 }),
  qualityScore: numeric('quality_score', { precision: 6, scale: 2 }),
  promotingInteroperabilityScore: numeric('promoting_interoperability_score', { precision: 6, scale: 2 }),
  improvementActivitiesScore: numeric('improvement_activities_score', { precision: 6, scale: 2 }),
  costScore: numeric('cost_score', { precision: 6, scale: 2 }),
  programYear: integer('program_year').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  npiYearUnique: uniqueIndex('perf_scores_npi_year_unique').on(table.providerNpi, table.programYear),
}));

// Stats (precomputed)
export const stats = pgTable('stats', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Relations
export const providersRelations = relations(providers, ({ one, many }) => ({
  specialty: one(specialties, {
    fields: [providers.taxonomyCode],
    references: [specialties.code],
  }),
  payments: many(payments),
  medicareUtilization: many(medicareUtilization),
  prescriberData: many(prescriberData),
  mipsScores: many(mipsScores),
}));

export const specialtiesRelations = relations(specialties, ({ many }) => ({
  providers: many(providers),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  provider: one(providers, {
    fields: [payments.providerNpi],
    references: [providers.npi],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  alerts: many(alerts),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(users, {
    fields: [alerts.userId],
    references: [users.id],
  }),
}));

export const medicareUtilizationRelations = relations(medicareUtilization, ({ one }) => ({
  provider: one(providers, {
    fields: [medicareUtilization.providerNpi],
    references: [providers.npi],
  }),
}));

export const prescriberDataRelations = relations(prescriberData, ({ one }) => ({
  provider: one(providers, {
    fields: [prescriberData.providerNpi],
    references: [providers.npi],
  }),
}));

export const mipsScoresRelations = relations(mipsScores, ({ one }) => ({
  provider: one(providers, {
    fields: [mipsScores.providerNpi],
    references: [providers.npi],
  }),
}));

// Zod schemas
export const insertProviderSchema = createInsertSchema(providers);
export const selectProviderSchema = createSelectSchema(providers);
export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertAlertSchema = createInsertSchema(alerts);
export const selectAlertSchema = createSelectSchema(alerts);
