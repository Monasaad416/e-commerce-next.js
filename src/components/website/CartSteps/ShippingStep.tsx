import { forwardRef, useEffect, useImperativeHandle } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { IShipping, ShippingType } from "@/interfaces/ShippingType";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

export interface ShippingStepRef {
    validate: () => Promise<{ valid: boolean; data: ShippingType | null }>;
    data?: ShippingType | null; // Add this property
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
        getValues,
        formState: { errors },
        trigger,
        reset
    } = useForm<ShippingType>({
        mode: "onChange",
        resolver: zodResolver(IShipping),
        defaultValues: formData || {}
    });

    const t = useTranslations('Shipping');

    // Reset form when formData changes
    useEffect(() => {
        if (formData) {
            reset(formData);
        }
    }, [formData, reset]);

    useImperativeHandle(ref, () => ({
    async validate() {
        try {
            // First trigger validation
            const isValid = await trigger();
            
            if (!isValid) {
                return { valid: false, data: null };
            }

            // Get values directly from react-hook-form
            const values = getValues();
            
            // Ensure all required fields have values
            const shippingData: ShippingType = {
                firstName: values.firstName || '',
                lastName: values.lastName || '',
                address: values.address || '',
                city: values.city || '',
                zipCode: values.zipCode || '',
                country: values.country || '',
                phone: values.phone || '',
                apartment: values.apartment || undefined,
            };
            

            
            return { 
                valid: true, 
                data: shippingData
            };
        } catch (error) {
            console.error('Validation error:', error);
            return { valid: false, data: null };
        }
    },
}), [trigger, getValues, errors]);
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
                                {t('FirstName')}
                                {errors.firstName && (
                                    <span className="text-red-500 text-xs ml-1">*</span>
                                )}
                            </label>
                            <input
                                {...register('firstName')}
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
                                {t('LastName')}
                                {errors.lastName && (
                                    <span className="text-red-500 text-xs ml-1">*</span>
                                )}
                            </label>
                            <input
                                {...register('lastName')}
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
                            {t('Address')}
                            {errors.address && (
                                <span className="text-red-500 text-xs ml-1">*</span>
                            )}
                        </label>
                        <input
                            {...register('address')}
                            type="text"
                            placeholder="123 Main St"
                            className={getInputClasses('address')}
                        />
                        {errors.address && (
                            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                        )}
                    </div>

                    {/* Apartment/Suite (Optional) */}
                    {/* Zip Code */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('ApartmentSuite')}
                                {errors.apartment && (
                                    <span className="text-red-500 text-xs ml-1">*</span>
                                )}
                            </label>
                            <input
                                {...register('apartment')}
                                type="text"
                                placeholder="John"
                                className={getInputClasses('apartment')}
                            />
                            {errors.apartment && (
                                <p className="mt-1 text-sm text-red-600">{errors.apartment.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('ZipCode')}
                                {errors.zipCode && (
                                    <span className="text-red-500 text-xs ml-1">*</span>
                                )}
                            </label>
                            <input
                                {...register('zipCode')}
                                type="text"
                                placeholder="Doe"
                                className={getInputClasses('zipCode')}
                            />
                            {errors.zipCode && (
                                <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
                            )}
                        </div>
                    </div>


                    {/* City, State, ZIP */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('City')}
                                {errors.city && (
                                    <span className="text-red-500 text-xs ml-1">*</span>
                                )}
                            </label>
                            <input
                                {...register('city')}
                                type="text"
                                placeholder="New York"
                                className={getInputClasses('city')}
                            />
                            {errors.city && (
                                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('Country')}
                                {errors.country && (
                                    <span className="text-red-500 text-xs ml-1">*</span>
                                )}
                            </label>
                            <input
                                {...register('country')}
                                type="text"
                                placeholder="New York"
                                className={getInputClasses('country')}
                            />
                            {errors.country && (
                                <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                            )}
                        </div>

                    </div>



                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('PhoneNumber')}
                            {errors.phone && (
                                <span className="text-red-500 text-xs ml-1">*</span>
                            )}
                        </label>
                        <input
                            {...register('phone')}
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