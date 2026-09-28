# Consistent backend status

## Changes

- Add a single backend health-state function to the existing API service.
- Treat a missing backend URL as **Backend — Demo / Mock Data** without making a request.
- When a URL exists, perform a real health request and show **Backend — Connected** only after success; otherwise show **Backend — Unavailable**.
- Expose that shared state through the existing app context so the header, sidebar, status panel, dashboard, and Settings use identical wording and indicator tones.
- Preserve all existing mock-data behavior, badges, pages, routes, layout, and theme.

## Technical details

- Use the configured API client's `/system/status` endpoint as the health check, with no mock fallback for health.
- Represent the check as `demo`, `checking`, `connected`, or `unavailable` and keep ordinary feature API fallbacks unchanged.
- Remove the hardcoded mock “Backend Connected” component row and render backend status from the shared health state instead.

## Verification

- Check the current no-URL configuration displays **Backend — Demo / Mock Data** everywhere.
- Run focused type checks and inspect the latest app build diagnostics.
- Browser-check Dashboard and Settings for matching text and no runtime errors.
