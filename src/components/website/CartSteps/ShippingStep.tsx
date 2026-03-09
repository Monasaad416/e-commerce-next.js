import { forwardRef, useEffect, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IShipping, ShippingType } from "@/interfaces/ShippingType";

export interface ShippingStepRef {
    validate: () => Promise<{ valid: boolean; data: ShippingType | null }>;
}

interface ShippingStepProps {
  currentStep: number;
  onNext: (data: ShippingType) => void;
  formData?: Partial<ShippingType> | null;
}

const ShippingStep = forwardRef<ShippingStepRef, ShippingStepProps>(({ onNext, formData = null }, ref) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        trigger,
        reset
    } = useForm<ShippingType>({
        mode: "onChange",
        resolver: zodResolver(IShipping),
        defaultValues: formData || {}
    });

    // Reset form when formData changes
    useEffect(() => {
        if (formData) {
            reset(formData);
        }
    }, [formData, reset]);

useImperativeHandle(ref, () => ({
    async validate() {
        const isValid = await trigger();
        if (!isValid) {
            return { valid: false, data: null };
        }

        // Get form values directly from the form
        const form = document.getElementById('shipping-form') as HTMLFormElement;
        if (!form) {
            return { valid: false, data: null };
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries()) as unknown as ShippingType;
        
        return { 
            valid: true, 
            data 
        };
    }
}), [trigger]);

    const onSubmit = (data: ShippingType) => {
        onNext(data);
    };




    // Helper function to get input classes
    const getInputClasses = (fieldName: keyof typeof errors) => 
        `w-full px-4 py-2 border ${
            errors[fieldName] ? 'border-red-500' : 'border-gray-300'
        } rounded-md focus:ring-2 focus:ring-shop_light focus:border-shop_light transition-all`;


    return (
        <form id="shipping-form" onSubmit={handleSubmit(onSubmit)} className="py-4">
            <div className="py-4">
                <h2 className="text-2xl font-bold mb-6 text-shop_dark">Shipping Information</h2>
                <div className="max-w-2xl space-y-5">
                    {/* Name Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                                {errors.firstName && (
                                    <span className="text-red-500 text-xs ml-1">*</span>
                                )}
                            </label>
                            <input
                                {...register('firstName', { 
                                    required: 'First name is required',
                                    minLength: {
                                        value: 2,
                                        message: 'Must be at least 2 characters'
                                    }
                                })}
                                type="text"
                                placeholder="John"
                                className={getInputClasses('firstName')}
                            />
                            {errors.firstName && (
                                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                                {errors.lastName && (
                                    <span className="text-red-500 text-xs ml-1">*</span>
                                )}
                            </label>
                            <input
                                {...register('lastName', { 
                                    required: 'Last name is required',
                                    minLength: {
                                        value: 2,
                                        message: 'Must be at least 2 characters'
                                    }
                                })}
                                type="text"
                                placeholder="Doe"
                                className={getInputClasses('lastName')}
                            />
                            {errors.lastName && (
                                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Street Address
                            {errors.address && (
                                <span className="text-red-500 text-xs ml-1">*</span>
                            )}
                        </label>
                        <input
                            {...register('address', {
                                required: 'Street address is required'
                            })}
                            type="text"
                            placeholder="123 Main St"
                            className={getInputClasses('address')}
                        />
                        {errors.address && (
                            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                        )}
                    </div>

                    {/* Apartment/Suite (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Apartment, suite, etc. (optional)
                        </label>
                        <input
                            {...register('apartment')}
                            type="text"
                            placeholder="Apt 4B"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-shop_light focus:border-shop_light transition-all"
                        />
                        {errors.apartment && (
                            <p className="mt-1 text-sm text-red-600">{errors.apartment.message}</p>
                        )}
                    </div>

                    {/* City, State, ZIP */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City
                                {errors.city && (
                                    <span className="text-red-500 text-xs ml-1">*</span>
                                )}
                            </label>
                            <input
                                {...register('city', {
                                    required: 'City is required'
                                })}
                                type="text"
                                placeholder="New York"
                                className={getInputClasses('city')}
                            />
                            {errors.city && (
                                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ZIP/Postal Code
                                {errors.zipCode && (
                                    <span className="text-red-500 text-xs ml-1">*</span>
                                )}
                            </label>
                            <input
                                {...register('zipCode', {
                                    required: 'ZIP code is required',
                                    pattern: {
                                        value: /^\d{5}(-\d{4})?$/,
                                        message: 'Please enter a valid ZIP code'
                                    }
                                })}
                                type="text"
                                placeholder="10001"
                                className={getInputClasses('zipCode')}
                            />
                            {errors.zipCode && (
                                <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Country/Region */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country/Region
                            {errors.country && (
                                <span className="text-red-500 text-xs ml-1">*</span>
                            )}
                        </label>
                        <select
                            {...register('country', {
                                required: 'Country is required'
                            })}
                            className={getInputClasses('country')}
                        >
                            <option value="">Select a country/region</option>
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="UK">United Kingdom</option>
                        </select>
                        {errors.country && (
                            <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                            {errors.phone && (
                                <span className="text-red-500 text-xs ml-1">*</span>
                            )}
                        </label>
                        <input
                            {...register('phone', {
                                required: 'Phone number is required',
                                pattern: {
                                    value: /^[0-9]{10,15}$/,
                                    message: 'Please enter a valid phone number (10-15 digits)'
                                }
                            })}
                            type="tel"
                            placeholder="(123) 456-7890"
                            className={getInputClasses('phone')}
                        />
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">For delivery questions only</p>
                    </div>


                </div>
            </div>
        </form>
    );
});

ShippingStep.displayName = "ShippingStep";

export default ShippingStep;