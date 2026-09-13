import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

export const IShipping = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters long"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters long"),
  address: z
    .string()
    .trim()
    .min(2, "Address must be at least 2 characters long"),
  city: z.string().trim().min(2, "City is required"),
  zipCode: z.string().trim().optional().nullable(),
  country: z.string().trim().min(2, "Country is required"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .refine((value) => isValidPhoneNumber(value), {
      message: "Enter a valid phone number with country code",
    }),
  apartment: z.string().trim().optional(),
});

export type ShippingType = z.infer<typeof IShipping>;
