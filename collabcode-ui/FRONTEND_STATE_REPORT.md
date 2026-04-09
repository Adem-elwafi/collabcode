# Frontend State Report

Date: 2026-04-09

## Overview

The frontend is currently a React 19 + TypeScript + Vite application built around a collaborative code editor experience. The app now starts on a dedicated entry screen, collects user details, and only mounts the editor workspace after the user joins a room.

The visual direction is a dark, modern interface with glassmorphism treatment on the entry card, layered gradients in the shell, and a short entrance transition when the editor mounts.

## Current Stack

- React 19
- TypeScript
- Vite
- Monaco editor via `@monaco-editor/react`
- WebSocket messaging via `sockjs-client` and `@stomp/stompjs`
- Iconography via `lucide-react`

## Application Flow

### 1. Entry Gate

The app now renders a join screen before the workspace mounts.

The join screen collects:

- Username
- Room ID

When the user clicks Join Workspace, the app switches into a short loading state before revealing the editor workspace. This keeps the interaction responsive without requiring a separate motion library.

### 2. Join State and Persistence

The top-level app state now includes:

- `currentUser`
- `roomId`
- `isJoined`
- `isJoining`
- `users`
- `saveStatus`

Username persistence is handled through `localStorage` using the key `collabcode.username`. The stored username is restored on refresh, so the user does not need to re-enter it every time.

Room ID is currently kept in component state only and is not persisted.

### 3. Workspace Mounting

Once joined, the app renders `MainLayout`, which contains:

- `Sidebar`
- `CodeEditor`
- `StatusBar`

The workspace container uses a simple CSS entrance animation so the editor fades/slides into view after join.

## Component Breakdown

### `App.tsx`

The top-level shell is responsible for:

- Loading the saved username
- Managing join/loading state
- Saving username updates to `localStorage`
- Switching between the join screen and the workspace
- Passing room/user state into the editor layout

### `JoinRoom.tsx`

The new gate component provides:

- Centered card-based layout
- Glassmorphism styling
- Username and Room ID inputs
- Gradient join button
- Loading indicator during connection delay

### `MainLayout.tsx`

The workspace layout still owns the editor shell composition:

- Sidebar for room info and active users
- Main editor region
- Footer-style status bar

### `CodeEditor.tsx`

The editor component remains the core collaboration surface.

Current behavior:

- Connects to the backend WebSocket service with the JWT token
- Subscribes to room updates after a short delay
- Handles JOIN and LEAVE presence messages
- Handles CODE_UPDATE payloads
- Keeps the local editor content and save state in sync

### `Sidebar.tsx`

The sidebar shows:

- Current room ID
- Share button for the room URL
- Active users list

### `UserList.tsx`

The user list merges the current user with remote users and highlights the current user entry as `you`.

### `StatusBar.tsx`

The status bar displays:

- Room ID
- Save state
- Encoding indicator

### `WebSocketService.ts`

The websocket layer is a singleton service built on STOMP over SockJS.

Current responsibilities:

- Connect with a Bearer JWT header
- Subscribe to room topics
- Publish editor updates
- Cleanly disconnect and unsubscribe on teardown

## Visual Design State

The current styling is intentionally darker and more atmospheric than the original shell.

Key UI traits:

- Full-screen gradient background
- Glassmorphism join card
- Blue-to-purple primary action button
- Soft blur/glow decoration around the shell
- Fade/slide transition when the workspace mounts

The UI is implemented with plain CSS only. No animation library is installed, so the transition is intentionally lightweight.

## Persistence And Connection Notes

What is persisted:

- Username in `localStorage`

What is not persisted yet:

- Room ID
- Join/session state across refreshes
- JWT token source

Current connection assumptions:

- Backend websocket endpoint: `http://localhost:8080/ws`
- Room topic pattern: `/topic/room/{roomId}`
- Editor publish destination: `/app/editor.sendMessage/{roomId}`

## Build Status

The frontend was validated with a successful production build:

- `npm run build` completed successfully

## Known Gaps

These are the main follow-up items if the frontend is meant to become production-ready:

- The JWT token is still hardcoded in `App.tsx`
- The room ID is not yet hydrated from the share URL query string
- The sender value in outbound code updates is still a placeholder in `WebSocketService.ts`
- The loading delay is fixed rather than tied to actual websocket connection readiness
- There is no explicit logout/leave flow yet

## Summary

The frontend is now structured around a proper entry portal, persistent username capture, and a cleaner handoff into the collaborative workspace. The current implementation is stable and compiles successfully, but it still contains a few placeholder assumptions around authentication and room hydration that should be addressed before release.