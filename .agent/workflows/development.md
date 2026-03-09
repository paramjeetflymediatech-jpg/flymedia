---
description: Development workflow for adding new features to Flymedia
---

# Flymedia Feature Development Workflow

Follow these steps when implementing new features or making significant changes to the codebase.

## 1. Planning and Analysis
- Analyze the requirements and identify the affected components (Web, Backend, Mobile).
- Review existing models in `backend/models` to determine if schema changes are needed.
- Review existing controllers in `backend/controllers` for logic updates.

## 2. Backend Implementation
- **Schema**: Update Mongoose models if necessary.
- **Controller**: Implement or update controller functions with proper authorization (check `req.user.role`).
- **Routes**: Register new endpoints in `backend/routes` and ensure middleware like `protect` is used.

## 3. Frontend Implementation
- **API Wrapper**: Ensure compatibility with `web/lib/api.js`.
- **UI Components**: Use tailwind-styled components from `web/components/ui`.
- **Page Logic**: Implement or update Next.js pages in `web/app/dashboard`, ensuring role-based access control.

## 4. Design Standards
- Follow the premium, modern design language (glassmorphism, vibrant colors, clean typography).
- Ensure high responsiveness using Tailwind breakpoints (e.g., `sm:`, `md:`, `lg:`).
- Use `lucide-react` for consistent iconography.

## 5. Verification
- Verify backend API behavior using scripts or manual testing.
- Test frontend UI across various screen sizes (Mobile to Desktop).
- Confirm that role-based permissions are strictly enforced.
