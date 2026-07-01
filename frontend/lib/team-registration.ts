import { createPaymentOrder, registerTeam, verifyPayment } from "@/lib/api";

type TeamMember = {
  name: string;
  email: string;
  college: string;
  branch: string;
  year: string;
  semester: string;
  is_leader: boolean;
};

type TeamRegistrationContext = {
  token: string;
  eventId: number;
  isPaidEvent: boolean;
  eventTitle: string;
  teamName: string;
  members: TeamMember[];
  onSuccess: (team: any) => void;
  onError: (message: string, error?: unknown) => void;
  onPaymentCancelled?: () => void;
  setActionLock?: (locked: boolean) => void;
  statusUpdater?: (status: string) => void;
};

export async function runTeamRegistration({
  token,
  eventId,
  isPaidEvent,
  eventTitle,
  teamName,
  members,
  onSuccess,
  onError,
  onPaymentCancelled,
  setActionLock,
  statusUpdater,
}: TeamRegistrationContext) {
  if (!isPaidEvent) {
    try {
      const team = await registerTeam(token, {
        event_id: eventId,
        team_name: teamName,
        members,
      });

      if ((team as any)?.detail) {
        onError((team as any).detail);
        return;
      }

      onSuccess(team);
    } catch (error) {
      console.error(error);
      onError("Failed to register team.", error);
    } finally {
      setActionLock?.(false);
    }

    return;
  }

  try {
    statusUpdater?.("Preparing payment...");
    const payment = await createPaymentOrder(token, eventId);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: payment.order.amount,
      currency: payment.order.currency,
      name: "EventSphere",
      description: payment.event_title || eventTitle,
      order_id: payment.order.id,
      prefill: {
        name: teamName,
        email: members[0]?.email || "",
      },
      handler: async function (response: any) {
        try {
          const currentToken = localStorage.getItem("token");

          if (!currentToken) {
            onError("Please login first");
            return;
          }

    statusUpdater?.("Verifying payment...");
    const team = await verifyPayment(currentToken, {
            event_id: eventId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            registration_type: "team",
            team_name: teamName,
            members,
      });

          if ((team as any)?.detail) {
            onError((team as any).detail);
            return;
          }

          onSuccess(team);
        } catch (error) {
          console.error(error);
          onError(error instanceof Error ? error.message : "Payment verification failed.", error);
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

    statusUpdater?.("Opening Razorpay...");
    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  } catch (error) {
    console.error(error);
    onError("Failed to start payment.", error);
    setActionLock?.(false);
  }
}
