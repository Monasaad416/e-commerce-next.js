import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { CountrySelect, StateSelect, CitySelect } from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
import "react-phone-number-input/style.css";
import PhoneInput, {
    getCountryCallingCode,
    type Country,
    type Value as PhoneValue,
} from "react-phone-number-input";

import { IShipping, ShippingType } from "@/interfaces/ShippingType";
import { cn } from "@/lib/utils";

/* Country object shape returned by react-country-state-city's CountrySelect onChange */
interface CscCountry {
    id: number | string;
    name: string;
    iso2?: string;
    phone_code?: string | number;
}

interface CscState {
    id: number | string;
    name: string;
}

interface CscCity {
    id: number | string;
    name: string;
}

export interface ShippingStepRef {
    validate: () => Promise<{ valid: boolean; data: ShippingType | null }>;
    data?: ShippingType | null;
}

interface ShippingStepProps {
    currentStep: number;
    onNext: (data: ShippingType) => void;
    formData?: Partial<ShippingType> | null;
}

const ShippingStep = forwardRef<ShippingStepRef, ShippingStepProps>(
    ({ onNext, formData = null }, ref) => {
        const {
            register,
            handleSubmit,
            getValues,
            setValue,
            control,
            formState: { errors },
            trigger,
            reset,
        } = useForm<ShippingType>({
            mode: "onChange",
            resolver: zodResolver(IShipping),
            defaultValues: {
                firstName: "",
                lastName: "",
                address: "",
                city: "",
                zipCode: "",
                country: "",
                phone: "",
                apartment: "",
                ...(formData || {}),
            },
        });

        const t = useTranslations("Shipping");

        const [countryId, setCountryId] = useState<string>("");
        const [stateId, setStateId] = useState<string>("");
        const [phoneCountry, setPhoneCountry] = useState<Country | undefined>(
            undefined,
        );
        const phoneValue = useWatch({ control, name: "phone" });
        const phone = (phoneValue || undefined) as PhoneValue | undefined;

        // Register phone / location fields controlled outside native inputs
        useEffect(() => {
            register("phone");
            register("country");
            register("city");
        }, [register]);

        useEffect(() => {
            if (formData) {
                reset({
                    firstName: "",
                    lastName: "",
                    address: "",
                    city: "",
                    zipCode: "",
                    country: "",
                    phone: "",
                    apartment: "",
                    ...formData,
                });
            }
        }, [formData, reset]);

        useImperativeHandle(
            ref,
            () => ({
                async validate() {
                    try {
                        const isValid = await trigger(undefined, {
                            shouldFocus: true,
                        });
                        if (!isValid) {
                            document
                                .getElementById("shipping-form")
                                ?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                });
                            return { valid: false, data: null };
                        }

                        const values = getValues();
                        const shippingData: ShippingType = {
                            firstName: values.firstName || "",
                            lastName: values.lastName || "",
                            address: values.address || "",
                            city: values.city || "",
                            zipCode: values.zipCode || "",
                            country: values.country || "",
                            phone: values.phone || "",
                            apartment: values.apartment || undefined,
                        };
                        return { valid: true, data: shippingData };
                    } catch (error) {
                        console.error("Validation error:", error);
                        return { valid: false, data: null };
                    }
                },
            }),
            [trigger, getValues],
        );

        const onSubmit = (data: ShippingType) => {
            onNext(data);
        };

        /* ── Country picker → sync phone widget + prefill dialing code ── */
        const handleCountryChange = (country: unknown) => {
            if (!country || typeof country !== "object" || !("id" in country)) {
                return;
            }
            const c = country as CscCountry;

            setCountryId(String(c.id));
            setValue("country", c.name, { shouldValidate: true });

            if (c.iso2) {
                const iso2 = c.iso2.toUpperCase() as Country;
                setPhoneCountry(iso2);

                // Prefill phone with the country's calling code ("+20", "+1", ...)
                // Prefer phone_code from the dataset; fall back to library lookup.
                let dialCode: string | undefined;
                if (c.phone_code) {
                    dialCode = String(c.phone_code).replace(/^\+/, "");
                } else {
                    try {
                        dialCode = getCountryCallingCode(iso2);
                    } catch {
                        dialCode = undefined;
                    }
                }
                if (dialCode) {
                    const next = `+${dialCode}` as PhoneValue;
                    setValue("phone", next, { shouldValidate: false });
                }
            }
        };

        const handleStateChange = (state: unknown) => {
            if (state && typeof state === "object" && "id" in state) {
                setStateId(String((state as CscState).id));
            }
        };

        const handleCityChange = (city: unknown) => {
            if (city && typeof city === "object" && "name" in city) {
                setValue("city", (city as CscCity).name, { shouldValidate: true });
            }
        };

        // Input base styles mapped to the shop theme
        const inputBase =
            "w-full rounded-xl border border-shop_light_gray/20 bg-shop_dark_primary/60 px-4 py-2.5 text-sm text-shop_white placeholder:text-shop_light_gray/40 transition-colors focus:border-shop_secondary/60 focus:outline-none focus:ring-2 focus:ring-shop_secondary/40";

        const getInputClasses = (fieldName: keyof typeof errors) =>
            cn(inputBase, errors[fieldName] && "border-red-500/50 focus:ring-red-500/30");

        const labelCls =
            "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-shop_light_gray/80";
        const errorCls = "mt-1.5 text-xs text-red-300";

        return (
            <form id="shipping-form" onSubmit={handleSubmit(onSubmit)} className="py-2">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-shop_white sm:text-2xl">
                        Shipping Information
                    </h2>
                </div>

                <div className="space-y-6">
                    {/* Name Row */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <label className={labelCls}>
                                {t("FirstName")}
                                {errors.firstName && (
                                    <span className="ml-1 text-red-400">*</span>
                                )}
                            </label>
                            <input
                                {...register("firstName")}
                                type="text"
                                placeholder="John"
                                className={getInputClasses("firstName")}
                            />
                            {errors.firstName && (
                                <p className={errorCls}>{errors.firstName.message}</p>
                            )}
                        </div>
                        <div>
                            <label className={labelCls}>
                                {t("LastName")}
                                {errors.lastName && (
                                    <span className="ml-1 text-red-400">*</span>
                                )}
                            </label>
                            <input
                                {...register("lastName")}
                                type="text"
                                placeholder="Doe"
                                className={getInputClasses("lastName")}
                            />
                            {errors.lastName && (
                                <p className={errorCls}>{errors.lastName.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className={labelCls}>
                            {t("Address")}
                            {errors.address && <span className="ml-1 text-red-400">*</span>}
                        </label>
                        <input
                            {...register("address")}
                            type="text"
                            placeholder="123 Main St"
                            className={getInputClasses("address")}
                        />
                        {errors.address && (
                            <p className={errorCls}>{errors.address.message}</p>
                        )}
                    </div>

                    {/* Apartment + Zip */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <label className={labelCls}>
                                {t("ApartmentSuite")}
                                {errors.apartment && (
                                    <span className="ml-1 text-red-400">*</span>
                                )}
                            </label>
                            <input
                                {...register("apartment")}
                                type="text"
                                placeholder="Apt 4B"
                                className={getInputClasses("apartment")}
                            />
                            {errors.apartment && (
                                <p className={errorCls}>{errors.apartment.message}</p>
                            )}
                        </div>
                        <div>
                            <label className={labelCls}>
                                {t("ZipCode")}
                                {errors.zipCode && (
                                    <span className="ml-1 text-red-400">*</span>
                                )}
                            </label>
                            <input
                                {...register("zipCode")}
                                type="text"
                                placeholder="10001"
                                className={getInputClasses("zipCode")}
                            />
                            {errors.zipCode && (
                                <p className={errorCls}>{errors.zipCode.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Country / State / City */}
                    <div>
                        <label className={labelCls}>Location</label>
                        <div
                            className={cn(
                                "grid grid-cols-1 gap-3 md:grid-cols-3",
                                // Style third-party selects from react-country-state-city to match the dark theme
                                "[&_.stdropdown-container]:!rounded-xl [&_.stdropdown-container]:!border [&_.stdropdown-container]:!border-shop_light_gray/20 [&_.stdropdown-container]:!bg-shop_dark_primary/60",
                                "[&_.stdropdown-input]:!bg-transparent [&_.stdropdown-input]:!text-shop_white",
                                "[&_.stdropdown-input_input]:!bg-transparent [&_.stdropdown-input_input]:!text-shop_white [&_.stdropdown-input_input::placeholder]:!text-shop_light_gray/40",
                                "[&_.stsearch-box_input]:!bg-shop_dark_primary/80 [&_.stsearch-box_input]:!text-shop_white [&_.stsearch-box_input]:!border-shop_light_gray/20",
                                "[&_.stdropdown-menu]:!rounded-xl [&_.stdropdown-menu]:!border [&_.stdropdown-menu]:!border-shop_light_gray/20 [&_.stdropdown-menu]:!bg-shop_dark_primary [&_.stdropdown-menu]:!text-shop_white",
                                "[&_.stdropdown-item:hover]:!bg-shop_secondary/20 [&_.stdropdown-item.selected]:!bg-shop_secondary/30",
                            )}
                        >
                            <CountrySelect
                                onChange={handleCountryChange}
                                placeHolder="Select Country"
                            />
                            <StateSelect
                                countryid={Number(countryId)}
                                onChange={handleStateChange}
                                placeHolder="Select State"
                            />
                            <CitySelect
                                countryid={Number(countryId)}
                                stateid={Number(stateId)}
                                onChange={handleCityChange}
                                placeHolder="Select City"
                            />
                        </div>
                        {errors.country && (
                            <p className={errorCls}>{errors.country.message}</p>
                        )}
                        {errors.city && <p className={errorCls}>{errors.city.message}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className={labelCls}>
                            {t("PhoneNumber")}
                            {errors.phone && <span className="ml-1 text-red-400">*</span>}
                        </label>
                        <div
                            className={cn(
                                // Container: group country picker + input into one pill
                                "flex items-stretch overflow-hidden rounded-xl border border-shop_light_gray/20 bg-shop_dark_primary/60 transition-colors focus-within:border-shop_secondary/60 focus-within:ring-2 focus-within:ring-shop_secondary/40",
                                errors.phone && "border-red-500/50 focus-within:ring-red-500/30",
                                // Normalize react-phone-number-input internals
                                "[&_.PhoneInput]:flex [&_.PhoneInput]:w-full [&_.PhoneInput]:items-center [&_.PhoneInput]:gap-0",
                                // Country selector area: flag + arrow, with a subtle divider
                                "[&_.PhoneInputCountry]:relative [&_.PhoneInputCountry]:flex [&_.PhoneInputCountry]:h-full [&_.PhoneInputCountry]:items-center [&_.PhoneInputCountry]:gap-2 [&_.PhoneInputCountry]:px-4 [&_.PhoneInputCountry]:py-2.5",
                                "[&_.PhoneInputCountry]:border-e [&_.PhoneInputCountry]:border-shop_light_gray/15 [&_.PhoneInputCountry]:bg-shop_dark_primary/40",
                                "[&_.PhoneInputCountryIcon]:!overflow-hidden [&_.PhoneInputCountryIcon]:!rounded-sm [&_.PhoneInputCountryIcon]:!shadow-sm",
                                "[&_.PhoneInputCountryIcon--border]:!shadow-none",
                                "[&_.PhoneInputCountrySelectArrow]:!opacity-80 [&_.PhoneInputCountrySelectArrow]:!text-shop_light_gray",
                                // Native country <select> overlay — keep it invisible but clickable
                                "[&_.PhoneInputCountrySelect]:!absolute [&_.PhoneInputCountrySelect]:!inset-0 [&_.PhoneInputCountrySelect]:!cursor-pointer [&_.PhoneInputCountrySelect]:!opacity-0",
                                // The number input
                                "[&_input.PhoneInputInput]:!flex-1 [&_input.PhoneInputInput]:!border-0 [&_input.PhoneInputInput]:!bg-transparent [&_input.PhoneInputInput]:!px-4 [&_input.PhoneInputInput]:!py-2.5 [&_input.PhoneInputInput]:!text-sm [&_input.PhoneInputInput]:!text-shop_white [&_input.PhoneInputInput]:!outline-none",
                                "[&_input.PhoneInputInput::placeholder]:!text-shop_light_gray/40",
                            )}
                        >
                            <PhoneInput
                                international
                                withCountryCallingCode
                                defaultCountry={phoneCountry ?? "US"}
                                country={phoneCountry}
                                value={phone}
                                onChange={(value) => {
                                    setValue("phone", value ?? "", {
                                        shouldValidate: true,
                                    });
                                }}
                                onCountryChange={(c) => {
                                    if (c) setPhoneCountry(c);
                                }}
                                placeholder={t("PhoneNumber")}
                            />
                        </div>
                        {errors.phone && <p className={errorCls}>{errors.phone.message}</p>}
                        <p className="mt-1.5 text-xs text-shop_light_gray/60">
                            Country code is set automatically from your selected country. You
                            can still change it via the flag.
                        </p>
                    </div>
                </div>
            </form>
        );
    },
);

ShippingStep.displayName = "ShippingStep";

export default ShippingStep;
