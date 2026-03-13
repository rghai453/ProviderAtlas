import { z } from 'zod/v4';

export const exportFiltersSchema = z.object({
  specialty: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
});

export type ExportFilters = z.infer<typeof exportFiltersSchema>;
