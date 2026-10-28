# LLM Gateway Project Rule

You are building a production-grade LLM Gateway based on the specification in `ARCHITECTURE.md`.

## Core Directives:
1. **Strict Block-by-Block Execution:** Always reference the 12-Block Implementation Flow in `ARCHITECTURE.md`. Only work on the current active block. Do not prematurely build features from later blocks (e.g. do not introduce Redis rate-limiting or complex queues before the basic proxy and routing are tested and working).
2. **Never Block the Critical Path:** Gateway proxy requests must stream or return responses with minimum latency (< 20ms gateway overhead). Usage recording, database logging, and analytics must happen asynchronously.
3. **Decoupled Architecture:** 
   - Gateway requests use Gateway API Keys (`Bearer gw_live_...`).
   - Dashboard users use JWT / Refresh Tokens.
   - The Gateway core must never depend on dashboard cookie sessions.
4. **Adapter Pattern:** All LLM integrations must implement the `BaseProvider` interface and normalize inputs/outputs to the standard OpenAI-compatible format.
5. **Failover Safeguards:** Never attempt transparent model fallback after tokens have already been streamed to the client. Handle client disconnects (`req.on('close')`) by aborting upstream requests.

