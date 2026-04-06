import { forwardRef, useEffect, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IPayment, PaymentType } from "@/interfaces/OrderType";

export interface PaymentStepRef {
    validate: () => Promise<{ valid: boolean; data: PaymentType | null }>;
}

interface PaymentStepProps {
  currentStep: number;
  onNext: (data: PaymentType) => void;
  formData?: Partial<PaymentType> | null;
}

const PaymentStep = forwardRef<PaymentStepRef, PaymentStepProps>(({ onNext, formData = null }, ref) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        trigger,
        reset
    } = useForm<PaymentType>({
        mode: "onChange",
        resolver: zodResolver(IPayment),
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
        const form = document.getElementById('Payment-form') as HTMLFormElement;
        if (!form) {
            return { valid: false, data: null };
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries()) as unknown as PaymentType;
        
        return { 
            valid: true, 
            data 
        };
    }
}), [trigger]);

    const onSubmit = (data: PaymentType) => {
        onNext(data);
    };




    // Helper function to get input classes
    const getInputClasses = (fieldName: keyof typeof errors) => 
        `w-full px-4 py-2 border ${
            errors[fieldName] ? 'border-red-500' : 'border-gray-300'
        } rounded-md focus:ring-2 focus:ring-shop_light focus:border-shop_light transition-all`;


    return (
        <form id="Payment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6"></form>
    );
});

PaymentStep.displayName = "PaymentStep";

export default PaymentStep;