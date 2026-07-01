import { createPaymentOrder, registerForEvent, verifyPayment } from "@/lib/api";

type RegistrationContext = {
  token: string;
  eventId: number;
  isPaidEvent: boolean;
  eventTitle: string;
  userName?: string;
  userEmail?: string;
  onSuccess: (registrationId: number) => void;
  onError: (message: string, error?: unknown) => void;
  onPaymentCancelled?: () => void;
  setActionLock?: (locked: boolean) => void;
};

export async function runEventRegistration({
  token,
  eventId,
  isPaidEvent,
  eventTitle,
  userName,
  userEmail,
  onSuccess,
  onError,
  onPaymentCancelled,
  setActionLock,
}: RegistrationContext) {
  if (isPaidEvent) {
    try {
      const payment = await createPaymentOrder(token, eventId);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: payment.order.amount,
        currency: payment.order.currency,
        name: "EventSphere",
        description: payment.event_title || eventTitle,
        order_id: payment.order.id,
        prefill: {
          name: userName || "",
          email: userEmail || "",
        },
        handler: async function (response: any) {
          try {
            const currentToken = localStorage.getItem("token");

            if (!currentToken) {
              onError("Please login first");
              return;
            }

            const registration = await verifyPayment(currentToken, {
              event_id: eventId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            onSuccess(registration.id);
          } catch (error) {
            console.error(error);
            onError("Payment verification failed.", error);
          } finally {
            setActionLock?.(false);
          }
        },
        theme: {
          color: "#7c3aed",
        },
        modal: {
          ondismiss: function () {
            onPaymentCancelled?.();
            setActionLock?.(false);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error(error);
      onError("Failed to start payment.", error);
      setActionLock?.(false);
    }

    return;
  }

  try {
    const result = await registerForEvent(token, eventId);

    if (result.detail) {
      onError(result.detail);
      return;
    }

    onSuccess(result.registration_id ?? result.id);
  } catch (error) {
    console.error(error);
    onError("Failed to register.", error);
  }
}
