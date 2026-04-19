import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { IShipping, ShippingType } from "@/interfaces/ShippingType";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { CountrySelect, StateSelect, CitySelect } from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
import 'react-phone-number-input/style.css';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';

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

    const [countryId, setCountryId] = useState<string>('');
    const [stateId, setStateId] = useState<string>('');
    // inside your component
const [phone, setPhone] = useState<string | undefined>(undefined);
const [countryCode, setCountryCode] = useState<string>(''); 


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
  `w-full px-4 py-2 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-shop_light transition-all ${
    errors[fieldName] ? 'ring-2 ring-red-500' : ''
  }`;

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


                        <CountrySelect
                        className="border-0"
                            onChange={(country) => {
                                console.log(country);
                                // Check if it's a country object (not a change event)
                                if (country && typeof country === 'object' && 'id' in country) {
                                setCountryId(String(country.id));
                                console.log('Country ID:', String(country.id));
                                }
                            }}
                            placeHolder="Select Country"
                        />

                        <StateSelect
                        countryid={Number(countryId)}
                        onChange={(state) => {
                            console.log(state);
                            // Check if it's a state object (not a change event)
                            if (state && typeof state === 'object' && 'id' in state) {
                            setStateId(String(state.id)); // ✅ Convert to string
                            }
                        }}
                        placeHolder="Select State"
                        />

                        <CitySelect
                        countryid={Number(countryId)}
                        stateid={Number(stateId)}
                        onChange={(city) => console.log(city)}
                        placeHolder="Select City"
                        />
                    </div>



                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('PhoneNumber')}
                            {errors.phone && (
                                <span className="text-red-500 text-xs ml-1">*</span>
                            )}
                        </label>
                        <PhoneInput
                        international
                        value={phone}
                        onChange={(value) => setPhone(value)}
                          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-shop_light"
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