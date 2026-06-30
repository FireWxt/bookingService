import express from "express";
import swaggerUi from "swagger-ui-express";
import { requireHostToken } from "./auth.js";
import { bookings, createBooking } from "./models/bookingModel.js";
import { openapiSpec } from "./openapi.js";

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Booking Service is running");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.use(requireHostToken);

// Orchestration complète d'une réservation (Identity -> Inventory -> Payment)
app.post("/bookings", async (req, res) => {
  const { userId, eventId, amount, cardNumber } = req.body ?? {};

  if (typeof userId !== "number") {
    return res.status(400).json({ error: "Invalid userId" });
  }
  if (typeof eventId !== "number") {
    return res.status(400).json({ error: "Invalid eventId" });
  }
  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }
  if (typeof cardNumber !== "string") {
    return res.status(400).json({ error: "Invalid cardNumber" });
  }

  try {
    const booking = await createBooking(userId, eventId, amount, cardNumber);
    res.status(201).json(booking);
  } catch {
    res.status(502).json({ error: "A dependent service is unavailable" });
  }
});

// Consultation des réservations orchestrées
app.get("/bookings", (_req, res) => {
  res.json(bookings);
});

app.get("/bookings/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid booking id" });
  }

  const booking = bookings.find((b) => b.id === id);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  res.json(booking);
});

app.listen(3003, () => {
  console.log("Booking Service is running on port 3003");
});
