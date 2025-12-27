# Crawleo Zapier Integration

Zapier CLI project for Crawleo’s search API. Authentication uses a Crawleo API key (sent via the `x-api-key` header). The primary action is **Search the Web with Crawleo** which maps directly to `GET https://api.crawleo.dev/api/v1/search`.

## Commands

```bash
# Install dependencies
npm install

# Build (outputs to dist/)
npm run build

# Run unit tests (uses nock; no external calls). In some restricted environments
# Vitest worker processes may be blocked—run locally if needed.
npm test

# Log in to Zapier CLI (required before push)
zapier login

# Register or link, then push
zapier register "Crawleo"
zapier push
```

## Action implemented
- **Search the Web with Crawleo**: accepts Crawleo search parameters (`query`, `max_pages`, `setLang`, `cc`, `geolocation`, `device`, `enhanced_html`, `raw_html`, `page_text`, `markdown`). Returns search metadata plus a flattened `results[]` array for easy Zap mapping.

## Notes
- Authentication test hits Crawleo `/search` with a minimal payload to validate the API key.
- Middleware attaches the `x-api-key` header to every request and standardizes JSON responses.
- Connection label masks the key (`Crawleo API key …XXXX`).
