import { Shipment } from "../interfaces/Shipment";

export const markLostShipments = async () => {
  const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;
  const now = new Date();

  const oldShipments = await Shipment.find({
    statusId: { $nin: ["ENTREGADO", "PERDIDO"] },
  });

  let updatedCount = 0;

  for (const shipment of oldShipments) {
    const diff = now.getTime() - new Date(shipment.shipmentAt).getTime();

    if (diff > FIFTEEN_DAYS) {
      shipment.statusId = "PERDIDO";
      shipment.updatedAt = new Date();
      await shipment.save();
      updatedCount++;
    }
  }
  return updatedCount;
};
