import * as z from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  location: z.string().min(1, "Location is required"),
  price: z.number().nonnegative("Price must be greater than 0"),
  salesPrice: z.number({ message: "Invalid number" }).nullable(),
  maxTickets: z.number().nonnegative("Price must be greater than 0"),
});

export type EventInput = z.infer<typeof eventSchema>;

// For PATCH requests (all optional)
export const eventUpdateSchema = eventSchema.partial();