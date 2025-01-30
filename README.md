# Online Roulette

A random chat and video application built with Deno Fresh.

https://roleta-online.aldeia-viva.com.br

## Features

- Real-time chat
- Video streaming
- Chat-only mode (no video)
- Broadcast mode (viewers only)

## Requirements

Make sure you have Deno installed: https://deno.land/manual/getting_started/installation

## Development

To start the project in development mode:

```bash
deno task start
```

This will watch the project directory and restart as needed.

## Tests

The project includes automated tests to ensure correct functionality. To run the tests:

```bash
deno task test
```

### Test Suites

- `tests/rooms.test.ts`: Tests room management functions
  - Room creation (normal and chat-only)
  - Room listing
  - User counting
  - Room removal

- `tests/ws.test.ts`: Tests WebSocket communication
  - Connection in normal rooms
  - Connection in chat-only rooms
  - Message transmission
  - Error handling

## Build and Production

To build the project for production:

```bash
deno task build
```

To run in production:

```bash
deno task preview
```
