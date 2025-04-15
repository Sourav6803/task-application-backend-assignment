🔐 User Authentication API Documentation

This section describes how user registration and login work for the Task Management API. Authentication is done using JWT (JSON Web Token), stored in cookies.

🧱 Base URL localhost:3000/

1.  POST /register

Description: Register a new user.

Request Body:
{
"username": "john",
"password": "mypassword"
}

Validation Rules:

username must be at least 3 characters
password must be at least 6 characters
Username must be unique

Success Response (201):
{
"message": "User registration success",
"user": {
"id": 1,
"username": "john",
"password": "$2a$10$..."
}
}


 2. POST /login

Description: Log in with existing credentials.

Request Body:
{
  "username": "john",
  "password": "mypassword"
}
 success response:
{
  "message": "Login Success",
  "username": "john",
  "token": "<JWT Token>"
}
Note: A access_token cookie is also set in the browser containing the token.


Middleware: Authentication Required

All task-related routes (/tasks, /task/:id) are protected. You must be logged in, and your request must include a valid JWT cookie (access_token).

If a token is invalid or missing, the following response is returned:

 Token Info

Signed using osumare-pvt-ltd secret

Stored in an HTTP-only cookie: access_token

Expires in 7 days




📌 Task Management API Documentation

1. GET /tasks
Description: Retrieve a list of all tasks.
Optional Query Params:

page: Page number (optional, for pagination)

limit: Number of tasks per page (optional)

Response Example:
{
  "message": "Tasks fetched successfully",
  "tasks": [
    {
      "id": 1,
      "title": "Buy groceries",
      "description": "Milk, Eggs, Bread"
    }
  ]
}

🔹 2. GET /tasks/:id
Description: Get a specific task by its ID.
Path Param: id (number)

Success (200):
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, Eggs, Bread"
}

🔹 3. POST /tasks
Description: Create a new task.

Body:
{
  "title": "Complete assignment",
  "description": "Submit by 10 PM"
}
 
success(201)
{
  "message": "Task created successfully",
  "task": {
    "id": 2,
    "title": "Complete assignment",
    "description": "Submit by 10 PM"
  }
}


🔹 4. PUT /tasks/:id
Description: Update a task by ID.
Body (same format as POST)

Success (200):

json
Copy
Edit
{
  "message": "Task updated successfully",
  "task": {
    "id": 2,
    "title": "Updated title",
    "description": "Updated description"
  }
}
Error (404):

json
Copy
Edit
{ "error": "Task not found" }
🔹 5. DELETE /tasks/:id
Description: Delete a task by ID.
Success (200):

json
Copy
Edit
{ "message": "Task deleted successfully" }
Error (404):

json
Copy
Edit
{ "error": "Task not found" }

