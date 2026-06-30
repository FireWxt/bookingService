export const openapiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Booking Service",
    version: "1.0.0",
    description:
      "API d'orchestration du processus de réservation : vérifie l'utilisateur (Identity Service), réserve une place (Inventory Service), traite le paiement (Payment Service) puis confirme ou annule la réservation.",
  },
  servers: [{ url: "http://localhost:3003" }],
  security: [{ HostToken: [] }],
  paths: {
    "/bookings": {
      get: {
        summary: "Lister les réservations orchestrées",
        tags: ["Bookings"],
        responses: {
          "200": {
            description: "Liste des réservations",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Booking" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Orchestrer une réservation complète",
        tags: ["Bookings"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BookingRequest" },
            },
          },
        },
        responses: {
          "201": {
            description:
              "Processus de réservation exécuté (voir le champ status pour l'issue)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Booking" },
              },
            },
          },
          "400": { description: "Requête invalide" },
          "401": { description: "Jeton inter-services manquant ou invalide" },
          "502": { description: "Un service dépendant est indisponible" },
        },
      },
    },
    "/bookings/{id}": {
      get: {
        summary: "Consulter une réservation orchestrée",
        tags: ["Bookings"],
        parameters: [{ $ref: "#/components/parameters/BookingId" }],
        responses: {
          "200": {
            description: "Réservation trouvée",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Booking" },
              },
            },
          },
          "400": { description: "Identifiant invalide" },
          "404": { description: "Réservation non trouvée" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      HostToken: {
        type: "apiKey",
        in: "header",
        name: "X-Host-Token",
        description: "Jeton partagé entre les microservices",
      },
    },
    parameters: {
      BookingId: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "integer" },
        description: "Identifiant de la réservation orchestrée",
      },
    },
    schemas: {
      BookingRequest: {
        type: "object",
        properties: {
          userId: { type: "integer", example: 1 },
          eventId: { type: "integer", example: 1 },
          amount: { type: "number", example: 250 },
          cardNumber: { type: "string", example: "4111111111111111" },
        },
        required: ["userId", "eventId", "amount", "cardNumber"],
      },
      Booking: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          userId: { type: "integer", example: 1 },
          eventId: { type: "integer", example: 1 },
          reservationId: { type: "integer", example: 1 },
          paymentId: { type: "integer", example: 1 },
          status: {
            type: "string",
            enum: [
              "pending",
              "confirmed",
              "user_not_found",
              "event_not_found",
              "no_seats_available",
              "payment_failed",
            ],
            example: "confirmed",
          },
          reason: {
            type: "string",
            example: "Paiement refusé",
            description: "Présent uniquement si la réservation a échoué",
          },
        },
        required: ["id", "userId", "eventId", "status"],
      },
    },
  },
};
