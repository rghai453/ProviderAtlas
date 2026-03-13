import {
  pgTable,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
  varchar,
  pgEnum,
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

// Saved Searches
export const savedSearches = pgTable('saved_searches', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  query: jsonb('query').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
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

// Data Lists (pre-built CSV products)
export const dataLists = pgTable('data_lists', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  recordCount: integer('record_count').notNull().default(0),
  price: integer('price').notNull(), // cents
  stripePriceId: text('stripe_price_id'),
  slug: text('slug').notNull().unique(),
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
  savedSearches: many(savedSearches),
  alerts: many(alerts),
}));

export const savedSearchesRelations = relations(savedSearches, ({ one }) => ({
  user: one(users, {
    fields: [savedSearches.userId],
    references: [users.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(users, {
    fields: [alerts.userId],
    references: [users.id],
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
export const insertSavedSearchSchema = createInsertSchema(savedSearches);
export const insertDataListSchema = createInsertSchema(dataLists);
