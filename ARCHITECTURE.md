\# 🏗️ CollabCode API: Technical Architecture Reference



This document serves as the structural map for the CollabCode Backend. It explains the "Why" and "How" of every major class.



\---



\## 🔐 1. Security \& Identity Layer

\*Location: `com.collabcode.core.security`\*



\### 🧠 `JwtService`

\*\*The Brain of Identity.\*\*

\- \*\*Role:\*\* Handles the creation and parsing of JSON Web Tokens.

\- \*\*Key Responsibilities:\*\*

&#x20;   - Generates 24-hour tokens for users upon login.

&#x20;   - Uses \*\*HS256\*\* signing with a secret key to ensure tokens aren't tampered with.

&#x20;   - Extracts the `username` (email) from an incoming token.

&#x20;   - Checks if a token is expired or belongs to the wrong user.



\### 💂 `JwtAuthenticationFilter`

\*\*The Security Guard.\*\*

\- \*\*Role:\*\* Intercepts every incoming HTTP request before it reaches the Controller.

\- \*\*Logic Flow:\*\*

&#x20;   1. Looks for the `Authorization: Bearer <token>` header.

&#x20;   2. If found, it asks `JwtService` to validate it.

&#x20;   3. If valid, it tells Spring Security: "This user is verified; let them pass."

\- \*\*Optimization:\*\* It skips the check for `/api/v1/auth/\*\*` so new users can register/login.



\### 📜 `SecurityConfig`

\*\*The Building Rules (The Blueprint).\*\*

\- \*\*Role:\*\* Configures the Spring Security Filter Chain.

\- \*\*Key Rules:\*\*

&#x20;   - \*\*Statelessness:\*\* Disables Sessions and CSRF (standard for modern REST APIs).

&#x20;   - \*\*Endpoint Permissions:\*\* Defines that `Auth` and `WebSockets` are accessible, but everything else is locked.

&#x20;   - \*\*CORS:\*\* Whitelists the frontend (React/Angular) so the browser doesn't block the connection.

&#x20;   - \*\*Filter Ordering:\*\* Ensures the `JwtAuthenticationFilter` runs \*before\* the standard login check.



\---



\## 📡 2. Real-Time Layer (Coming Soon)

\*Location: `com.collabcode.features.editor`\*



> \*Reserved for WebSocket configurations and STOMP message handlers.\*



\---



\## 🗄️ 3. Persistence Layer (Coming Soon)

\*Location: `com.collabcode.features.rooms`\*



> \*Reserved for User, Room, and SourceFile Entities.\*

