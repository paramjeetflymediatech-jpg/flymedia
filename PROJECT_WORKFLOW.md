# Flymedia Project Management System: Complete Workflow & Functionality

This document provides a comprehensive guide to the business processes and the technical functions that power the Flymedia platform.

## 1. System Architecture & Roles

Flymedia is a Multi-Tenant SaaS platform. 
- **Superadmin**: Global oversight, tenant management.
- **Admin**: Organization owner, user and project management.
- **Manager**: Project execution, task assignment, approvals.
- **Employee**: Task execution, time tracking, communication.
- **Client**: Project requester, stakeholder, feedback provider.

---

## 2. Granular Business Workflow

### Phase A: Setup & Onboarding
1.  **Direct Registration**: A user registers at `/register`, automatically creating a new **Tenant** (Organization) and becoming its **Admin**.
2.  **Organization Configuration**: Admin updates tenant details (domain, branding) via the **Tenant Settings**.
3.  **Team Invitation**: Admin/Manager adds **Employees** and **Managers** via the **Employees** page.

### Phase B: Project Initiation
1.  **Client Request**: A **Client** submits a new project request.
    - *Related Function*: `projectController.createProject` (with `status: "requested"`).
2.  **Project Revision**: The client can edit their request using the **Pencil Icon** if the status is still "requested".
    - *Related Function*: `projectController.updateProject` (validated for owner and status).
3.  **Approval**: A **Manager** or **Admin** reviews and approves the request.
    - *Related Function*: `projectController.approveProject` (sets status to "planned").

### Phase C: Execution & Task Management
1.  **Planning**: Manager creates granular **Tasks** for the approved project.
    - *Related Function*: `taskController.createTask`.
2.  **Assignment**: Tasks are assigned to specific **Employees**.
3.  **Progress Tracking**: Employees move tasks from "To-do" to "In-progress" and finally "Completed".
    - *Related Function*: `taskController.updateTask` (logs changes in `activityLog`).
4.  **Collaboration**: Team members and clients communicate via the **Messages** module.
    - *Related Function*: `messageController.sendMessage` (supports text and media).

### Phase D: Delivery & Closing
1.  **Review**: Client and Manager review the project progress.
2.  **Completion**: Once all tasks are done, the project status is updated to "completed".

---

## 3. Technical Function Catalog

### Authentication (`authController.js`)
- `register`: Initialize user and tenant records.
- `login`: Issue JWT for secure sessions.
- `updatePassword`: Securely rotate credentials with current-password verification.
- `updateDetails`: Self-service profile management (name, email, phone).

### Project Management (`projectController.js`)
- `getProjects`: Role-based project listing (Clients see their own, Employees see assigned).
- `createProject`: Handles both internal creation and external client requests.
- `approveProject`: Transitions a request to an active project.
- `updateProject`: High-level project metadata updates with strict role-based field filtering.

### Task Management (`taskController.js`)
- `getTasks`: Lists tasks with deep population of assignees and activity logs.
- `createTask`: Creation and automatic assignment, updating the project's team list.
- `updateTask`: Status/Priority updates with automatic activity logging.
- `uploadAttachment`: AWS/Local file storage integration for task-related assets.

### Communication (`messageController.js`)
- `getCommunicationUsers`: Role-based address book (e.g., Clients can only chat with Managers).
- `sendMessage`: Real-time messaging with socket.io integration and multi-media support.
- `getConversations`: Aggregated view of all user interactions, sorted by recency.

### Organization Management (`tenantController.js` & `employeeController.js`)
- `getTenants`: Cross-tenant management for Superadmins.
- `getEmployees`: Paginated listing of team members within a specific organization.
- `createEmployee`: Administrative addition of new users to a tenant.

### Dashboard & Analytics (`dashboardController.js`)
- `getStats`: Real-time counters and summaries for the dashboard cards.
