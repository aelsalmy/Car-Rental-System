# Postman Collection

Manual regression collection for the Car Rental System REST API, referenced from `report_sections_2.4_2.5.tex` ("Postman collection committed under `/postman`").

## Files

- `Car-Rental-System.postman_collection.json` — Auth, Cars, Reservations, Reports.
- `Local.postman_environment.json` — `baseUrl`, admin/customer credentials. Edit before importing.

## Run via Postman UI

1. Start the backend: `docker compose up -d` (from repo root) or `cd backend && npm start`.
2. Import both JSON files into Postman.
3. Select the `Car Rental - Local` environment.
4. Run the **Auth** folder first (Login captures the token into a collection variable). Then run the rest in order.

## Run via Newman (CLI)

```bash
npx newman run postman/Car-Rental-System.postman_collection.json \
  -e postman/Local.postman_environment.json \
  --reporters cli
```

The customer "Register" request is idempotent — first run returns 201, subsequent runs return 409, both are treated as pass.
