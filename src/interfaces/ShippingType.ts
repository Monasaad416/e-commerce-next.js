import Z from "zod";
export const IShipping = Z.object({
    firstName: Z.string().min(2, "First name must be at least 2 characters long"),
    lastName: Z.string().min(2, "Last name must be at least 2 characters long"),
    address: Z.string().min(2, "Address must be at least 2 characters long"),
    city: Z.string().min(2, "City must be at least 2 characters long"),

    zipCode: Z.string().min(2, "Zip code must be at least 2 characters long"),
    country: Z.string().min(2, "Country must be at least 2 characters long"),
    phone: Z.string().min(10, "Phone must be between 10 and 15 characters long")
    .max(15, "Phone must be between 10 and 15 characters long")
    .regex(/^[0-9]+$/, "Phone must be a valid phone number"),
    apartment: Z.string().optional(),
})


export type ShippingType = Z.infer<typeof IShipping>;


