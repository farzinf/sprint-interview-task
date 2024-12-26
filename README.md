# Voting System with Real-Time Updates

## Overview

This project enhances an existing voting system to allow users to vote on various polls. The system provides immediate feedback to users and dynamically updates poll results using WebSockets.

- Manage polls (create, delete, list polls)
- Real-time updates with WebSockets
- API documentation using Swagger
- Comprehensive error handling
- Unit tests for reliability

---

## Technologies Used

- **Node.js** with **NestJS**
- **TypeORM** for ORM with **SQLite**
- **WebSockets** for real-time updates with **Socket.io**
- **Swagger** for API documentation
- **Jest** for unit testing

---

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/farzinf/sprint-voting-system
   cd sprint-voting-system
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the application:

   ```bash
   npm run start:dev
   ```

4. Access the Swagger API documentation at:

   ```
   http://localhost:3000/docs
   ```

5. To observe real-time updates from the voting system, open the [websocket-client.html](websocket-client.html) file located in the root directory of the repository using your web browser. This client will connect to the WebSocket server and display live voting results as they are updated.

---

## Testing

Run unit tests using Jest:

```bash
npm run test
```
