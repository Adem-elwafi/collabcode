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

### 🔑 `AuthenticationService` (The Processing Plant)
**The Business Logic of Identity.**
- **Registration:** Orchestrates the flow: Validate Input ➡️ Hash Password ➡️ Save to DB ➡️ Issue JWT.
- **Authentication:** The "Judge" that uses `AuthenticationManager` to verify credentials before granting a token.

### 📦 `DTOs` (Data Transfer Objects)
**The Contract between Frontend and Backend.**
- **Role:** Uses Java Records for immutability and Jakarta Validation to reject "bad data" (like weak passwords or invalid emails) before it ever touches your database.

### 🏠 `Room` Entity & `RoomService`
**The Workspace Foundation.**
- **Identity:** Uses **UUID v4** to prevent URL guessing and enumeration attacks.
- **Ownership:** Strictly enforced via `SecurityContextHolder`. A room is permanently linked to the `User` who created it.
- **Data Integrity:** Uses `RoomResponse` DTOs to hide internal database IDs of users, exposing only the `ownerEmail` to the frontend.
### 📡 `WebSocketConfig` & `JwtChannelInterceptor`
**The Real-Time Nervous System.**
- **Protocol:** STOMP over WebSockets with SockJS fallback for high compatibility.
- **Security:** JWTs are validated at the **Protocol Level** via a `ChannelInterceptor` during the handshake, ensuring no unauthenticated "pipes" are opened.
- **Messaging:** Uses `/topic` for room-wide broadcasts (code sync) and `/app` for server-side processing.
### 🎮 `EditorController` & `SocketMessage`
**The Logic of Collaboration.**
- **Routing:** Uses STOMP `@MessageMapping` to separate incoming data from outgoing broadcasts.
- **Isolation:** Employs `@DestinationVariable` to ensure messages are only broadcast to the specific `roomId` they belong to.
- **Presence:** Manages `JOIN` events by attaching user metadata to the WebSocket session, enabling "User X has joined" notifications.
### 🛡️ Frontend Type Safety & Lifecycle
**The Robust Client.**
- **Type Guards:** Uses `isCodeUpdatePayload` to validate WebSocket packets at runtime before they touch the React state.
- **Dependency Management:** Migrated to `@stomp/stompjs` Client API for better lifecycle control (`activate/deactivate`).
- **Memory Safety:** Explicitly resets subscriptions and STOMP references on `disconnect()` to prevent memory leaks and "Ghost" listeners.
### 🗄️ Phase 4: Persistence & Data Hydration
**The Hybrid Storage Model.**
- **Storage:** Uses `@Lob` and `LONGTEXT` in the `SourceFile` entity to support large codebases within MySQL.
- **Performance:** Implemented `@Async` background saving to decouple real-time broadcasting from database I/O, preventing "Keystroke Lag".
- **Hydration:** Provides a RESTful "Initial State" endpoint (`GET /api/v1/rooms/{roomId}/files`) to sync the frontend state upon room entry.
### 🧹 Phase 5: Presence & Session Lifecycle
**The Cleanup Engine.**
- **Event Handling:** Utilizes `WebSocketEventListener` to monitor low-level socket terminations (Disconnects).
- **Metadata Recovery:** Extracts `username` and `roomId` from `SimpMessageHeaderAccessor` to identify which user left which room.
- **UI Synchronization:** Automatically broadcasts `LEAVE` events to remaining collaborators to prevent "Ghost User" artifacts in the frontend.
