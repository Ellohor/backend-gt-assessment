Task 1: API Reasoning and Validation

1. Validation
When a request hits the /orders endpoint, I’d break the validation into two layers: making sure the data is structured correctly and making sure the request actually makes sense for the business.

Data Level: First, I’d check that userId is a valid positive number and that the items array isn't empty. We also need to make sure each item has a productId and a quantity that is at least 1—we can’t really process an order for zero items.

Business Logic Level: * User Check: I need to verify that the userId actually belongs to a registered user in our system.

Inventory Check: We have to check if we actually have enough stock. If a user wants 5 items but we only have 2 in the warehouse, the order shouldn't go through.

Availability: I’d also check if the products are still "active." We don't want people buying things that have been delisted or discontinued.

2. Possible Errors
Here are a few things that could go wrong during the process:

Empty Order: The user sends a request but the items list is missing or empty (400 Bad Request).

Ghost User: The request uses a userId that doesn't exist in our database (404 Not Found).

Out of Stock: The user wants more than what we have available in the warehouse (422 Unprocessable Entity).

No Permissions: The user isn't logged in or their session has expired (401 Unauthorized).

Database Hiccup: The server loses connection to the database while trying to save the new order (500 Internal Server Error).

3. HTTP Responses
201 Created: This is the best response for a successful order. It’s more descriptive than a standard 200 because it confirms that a new record was actually stored in the system.

400 Bad Request: I’d use this if the incoming JSON is messy—like if a field is missing or a string is sent where a number should be. It tells the client they need to fix their formatting.

404 Not Found: This is essential if the userId or any of the productIds provided don't exist in our records.

500 Internal Server Error: This is the "catch-all" for when something breaks on our end that the user can't fix, like a crash or a timeout.