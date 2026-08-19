# Security & Functionality Audit — Textra Accounts

Saved for future reference.

---

## Refactoring Status: ✅ No Broken Functionality

The refactoring from monolithic `App.tsx` to separate pages (`AccountDetail.tsx`, `Dashboard.tsx`, `RemindersPage.tsx`) + layout (`Header.tsx`, `Sidebar.tsx`) + modals is wired correctly. All API calls flow through `api.ts` → backend, all callbacks pass through `App.tsx` as props correctly.

---

## 🔴 Security Checklist (To Action Later)

### 1. Missing `JWT_SECRET` in `.env` — Using Hardcoded Fallback
**Files:** [authController.js](file:///d:/Dcoode/Ryphira/Accounts/textra%20accounts/backend/controllers/authController.js#L6), [authMiddleware.js](file:///d:/Dcoode/Ryphira/Accounts/textra%20accounts/backend/middleware/authMiddleware.js#L16)

The `.env` has no `JWT_SECRET` defined. Both files fall back to `'fallback_secret_key_123'` — a hardcoded secret committed to source code.

**Action:** Add a proper `JWT_SECRET` to `.env`:
```env
JWT_SECRET=your_secure_jwt_secret_key_here
```

---

### 2. MongoDB Atlas Credentials in `.env`
**File:** [.env](file:///d:/Dcoode/Ryphira/Accounts/textra%20accounts/backend/.env#L2)

MongoDB Atlas connection string is kept in `.env` for production/remote DB usage. Make sure `.env` remains in `.gitignore`.

---

### 3. Hardcoded Default Admin Credentials
**File:** [seedUser.js](file:///d:/Dcoode/Ryphira/Accounts/textra%20accounts/backend/seedUser.js#L20-L25)

```js
username: 'admin',
password: 'password123'
```

**Action:** Change default admin password if this seed script was run on production.

---

### 4. Open Registration Endpoint
**File:** [authRoutes.js](file:///d:/Dcoode/Ryphira/Accounts/textra%20accounts/backend/routes/authRoutes.js#L6)

`POST /api/auth/register` is publicly accessible. 

**Action:** Restrict or disable public user registration if only internal admins should create users.

---

## 🟡 Additional Notes

- **CORS Configuration:** Restrict `cors()` in [server.js](file:///d:/Dcoode/Ryphira/Accounts/textra%20accounts/backend/server.js) to specific frontend origin in production.
- **Seed & Clear Routes:** `POST /api/accounts/seed` and `DELETE /api/accounts/clear` should be disabled or restricted in production to prevent accidental data resets.
