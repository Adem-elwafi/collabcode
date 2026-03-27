# 🏗️ CollabCode API: Technical Architecture Reference

This document serves as the structural map for the CollabCode backend. It explains the "why" and "how" of every major class.

---

## 🔐 1. Security & Identity Layer

*Location: `com.collabcode_api.core.security`*

### 🧠 `JwtService`

**The Brain of Identity.**

- **Role:** Handles the creation and parsing of JSON Web Tokens.
- **Key Responsibilities:**
	- Generates 24-hour tokens for users upon login.
	- Uses **HS256** signing with a secret key to ensure tokens are not tampered with.
	- Extracts the username (email) from an incoming token.
	- Checks if a token is expired or belongs to the wrong user.

### 💂 `JwtAuthenticationFilter`

**The Security Guard.**

- **Role:** Intercepts incoming HTTP requests before they reach the controller layer.
- **Logic Flow:**
	1. Looks for the `Authorization: Bearer <token>` header.
	2. If found, asks `JwtService` to validate the token.
	3. If valid, sets the user authentication in Spring Security context.
- **Optimization:** Skips JWT validation for `/api/v1/auth/**` so users can register and log in.

### 📜 `SecurityConfig`

**The Building Rules (The Blueprint).**

- **Role:** Configures the Spring Security filter chain.
- **Key Rules:**
	- **Statelessness:** Disables sessions and CSRF (standard for modern REST APIs).
	- **Endpoint Permissions:** Allows `Auth` and WebSocket handshake routes while protecting all other endpoints.
	- **CORS:** Whitelists frontend development origins so browser calls are not blocked.
	- **Filter Ordering:** Ensures `JwtAuthenticationFilter` runs *before* `UsernamePasswordAuthenticationFilter`.

---

## 📡 2. Real-Time Layer (Coming Soon)

*Location: `com.collabcode_api.features.editor`*

> *Reserved for WebSocket configurations and STOMP message handlers.*

---

## 🗄️ 3. Persistence Layer (Coming Soon)

*Location: `com.collabcode_api.features.rooms`*

> *Reserved for User, Room, and SourceFile entities.*

### 🎮 `AuthenticationController` & `Service`
**The Entrance Logic.**
- **Role:** Handles the "Registration" and "Login" flow.
- **Key Logic:** It acts as the bridge between raw user input and the Security context. It is the only place where we explicitly call the `AuthenticationManager` to verify credentials.
- **Validation:** Uses Jakarta Validation to ensure data integrity before touching the database.