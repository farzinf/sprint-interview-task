# Use Case: Implement a Voting System with Real-Time Updates

## Background:

You are tasked with enhancing the existing voting system to allow users to vote on various polls in real-time. The system should provide immediate feedback to users and update the poll results dynamically.

## Requirements:

### 1. Choose an ORM:

Select an ORM library (e.g., TypeORM or Sequelize) that is compatible with NestJS.

### 2. Real-Time Updates:

- Use WebSockets to broadcast updates to all connected clients whenever a vote is cast. This should include:
  - The updated vote count for each option.
  - A notification message indicating that a new vote has been cast.

### 3. Poll Results Endpoint:

- Create an endpoint `/poll/results/:pollId` that returns the current results of a specific poll, including the total votes for each option.

### 4. Error Handling:

- Handle cases where:
  - The poll does not exist.
  - The user has already voted.
  - Invalid input data is provided.

### 5. Testing:

- Write unit tests for the new functionality, ensuring that all edge cases are covered.
- Include tests for the WebSocket functionality to ensure that updates are broadcast correctly.

## Deliverables:

- Implement the above functionality in the existing codebase.
- Ensure that the code follows best practices, including:
  - Proper error handling.
  - Unit tests for the new features.
