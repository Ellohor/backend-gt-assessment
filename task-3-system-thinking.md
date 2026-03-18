Task 3: Basic System Thinking

1. Scaling Challenges
If this API suddenly goes from a few hits to thousands of requests per minute, I’d expect a few things to start breaking:

Database Stress: Right now, every request hits the database. With thousands of users, the database will likely struggle to keep up with all the "read" and "write" operations, causing a huge bottleneck.

Memory Issues: If we’re storing things in-memory (like a simple array), the server's RAM will eventually fill up. If the server restarts, we also lose all that data, which is a big risk at scale.

Slow Responses (Latency): As the request queue grows, users will start seeing "spinning wheels" because the server is busy processing earlier requests. This usually leads to timeouts and a bad user experience.

2. Performance Improvements
To keep things running smoothly as we grow, I’d look into these techniques:

Caching with Redis: I’d store frequently accessed data (like a user’s task list) in a cache. It’s way faster than querying the main database every single time a user refreshes their page.

Database Indexing: I’d make sure columns like assignedTo and status are indexed. This makes searching through thousands of rows much faster for the database engine.

Load Balancing: Instead of one big server, I’d run several smaller instances of the API and use a load balancer to split the traffic between them. If one server gets overwhelmed, the others can pick up the slack.

3. Production Monitoring
To make sure the API stays healthy, I’d keep a close eye on these "vitals":

Response Times (p95/p99): I want to know how long the "slowest" requests are taking. If the p99 latency is high, it means some users are having a really frustrating experience.

Error Rates: I’d monitor the percentage of 5xx errors. A sudden spike usually means a bug was deployed or a service we depend on (like the DB) is down.

Resource Usage (CPU/RAM): If the CPU usage is constantly at 90%, it’s a clear sign we need to scale up our infrastructure.

Request Volume: Knowing how many requests we handle per second helps us predict when we'll need more server power before things actually break.