# Shared Module

This directory contains code and types that are intended to be reused between the client and server applications in AstraLearn.

## Purpose
- **Type Definitions:** Common TypeScript types and interfaces for data models, API contracts, and shared logic.
- **Utility Functions:** Helper functions that are used in both frontend and backend codebases.
- **Shared Logic:** Any code that should remain consistent and DRY across both the client and server.

## Usage
- Import types, utilities, or modules from this directory in both the `client/` and `server/` projects to ensure consistency and reduce duplication.
- Update shared logic here when changes are needed in both client and server.

---

**Note:** Avoid placing environment-specific code here. Only include code that is truly universal between frontend and backend.
