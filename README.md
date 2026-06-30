# Booking Service

Microservice d'orchestration d'une réservation complète. Appelle successivement `identityService`, `inventoryService` et `paymentService` pour vérifier l'utilisateur, réserver une place et traiter le paiement, puis conserve le résultat de chaque réservation en mémoire.

## Démarrage

```bash
npm install
cp .env.example .env
npm run dev   # ou npm start
```

Le service écoute sur le port **3003**.

> Les services `identityService`, `inventoryService` et `paymentService` doivent être démarrés au préalable (ports par défaut 3000, 3001, 3002).

## Configuration

| Variable | Description | Défaut |
| --- | --- | --- |
| `HOST_TOKEN` | Jeton partagé envoyé aux services en aval et requis pour appeler ce service | `tp-secret-host-token` |
| `IDENTITY_SERVICE_URL` | URL de base de l'Identity Service | `http://localhost:3000` |
| `INVENTORY_SERVICE_URL` | URL de base de l'Inventory Service | `http://localhost:3001` |
| `PAYMENT_SERVICE_URL` | URL de base du Payment Service | `http://localhost:3002` |

## Authentification

Toutes les routes (hors `/` et `/api-docs`) nécessitent l'en-tête `X-Host-Token` correspondant à `HOST_TOKEN`. Ce même jeton est transmis aux services en aval lors de chaque appel.

## Orchestration d'une réservation

`POST /bookings` enchaîne :
1. Vérification de l'existence de l'utilisateur (Identity Service) → `user_not_found` si échec.
2. Réservation temporaire d'une place (Inventory Service) → `event_not_found` ou `no_seats_available` si échec.
3. Traitement du paiement (Payment Service).
4. Si le paiement est refusé : libération de la place réservée → statut `payment_failed`.
5. Si le paiement est accepté : confirmation définitive de la réservation → statut `confirmed`.

Si un service dépendant est indisponible, la requête renvoie `502`.

## Routes

| Méthode | Route | Description |
| --- | --- | --- |
| POST | `/bookings` | Orchestre une réservation complète (`{ userId, eventId, amount, cardNumber }`) |
| GET | `/bookings` | Liste toutes les réservations orchestrées |
| GET | `/bookings/:id` | Récupère une réservation par id (`400` si id invalide, `404` si introuvable) |

## Documentation API

La documentation Swagger est disponible sur `/api-docs` une fois le service démarré.
