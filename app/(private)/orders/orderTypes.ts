export interface Order {
  id: string;
  customerName: string;
  status: "processing" | "completed" | "cancelled";
  orderNumber: string;
}
