import SuccessClient from "./SuccessClient";

type PageProps = {
  searchParams: Promise<{ session_id?: string; order_id?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { session_id: sessionId, order_id: orderId } = await searchParams;

  return <SuccessClient sessionId={sessionId} orderId={orderId} />;
}
