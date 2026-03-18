# Snapnet Backend GT Assessment

This is my submission for the backend graduate trainee assessment. I built the Task Management API using Node.js and Express. 



## What's in this repo?
* `app.js`: The main Express app containing the routes, in-memory storage, and the auth middleware.
* `EXPLANATION.md`: A quick breakdown of my approach, the permissions logic, and what I would do differently for a production environment.
* `task-1-api-reasoning.md`: My answers for the order creation validation and error handling.
* `task-3-system-thinking.md`: My notes on API scaling and production monitoring.

## Setup instructions
To get this running locally, you just need Node.js installed.

1. Clone the repo:
```bash
git clone [https://github.com/YourUsername/backend-gt-assessment.git](https://github.com/YourUsername/backend-gt-assessment.git)
cd backend-gt-assessment
```

### 2. Install the dependencies (it's just Express):

\`\`\`bash
npm install
\`\`\`

### How to run the project
Once the packages are installed, start the local server by running:

\`\`\`bash
node app.js
\`\`\`

The API will start listening on http://localhost:3000.

### Example API requests
A quick note on testing: To handle the Assigner vs. Assignee logic without overcomplicating the assessment, I added a custom middleware. You will need to pass an x-user-id header in your HTTP requests so the API knows who is making the call.

Here are a few ways to test the rules using cURL:

1. Create a task (User 1 assigning a task to User 2)
\`\`\`bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{
    "title": "Set up database schema",
    "priority": "high",
    "assignedTo": 2
  }'
\`\`\`

2. Update a task status (User 2 marking it as in-progress)
(The logic ensures only the assignee can update the status)
\`\`\`bash
curl -X PATCH http://localhost:3000/tasks/1/status \
  -H "Content-Type: application/json" \
  -H "x-user-id: 2" \
  -d '{"status": "in-progress"}'
\`\`\`

3. Unassign a task (User 1 taking User 2 off the task)
(The logic ensures only the assigner can do this)
\`\`\`bash
curl -X PATCH http://localhost:3000/tasks/1/unassign \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1"
\`\`\`

