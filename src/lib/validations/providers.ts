import { z } from 'zod/v4';

export const providerSearchSchema = z.object({
  specialty: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  name: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
});

export type ProviderSearchFilters = z.infer<typeof providerSearchSchema>;
