# Hosting on Render

The repository includes a Render Blueprint that builds one Docker web service for the React app and Spring Boot API, plus a PostgreSQL database. The app and API share one origin, so session cookies work without cross-origin configuration.

## Deploy

1. Open the repository in the Render Dashboard and choose **New Blueprint Instance**.
2. Connect `pankajmogare93/my-first-react-project` and select the `main` branch.
3. Review the `good-slowly` web service and `good-slowly-db` PostgreSQL database, then apply the Blueprint.
4. When the service finishes deploying, open its `onrender.com` URL and create an account.

The Blueprint uses free plans. Free web services can sleep after 15 minutes without traffic and may take about a minute to wake up. The free PostgreSQL database has a 1 GB limit, no backups, and expires after 30 days; upgrade it before then to keep account and task data.

This setup is intended for a portfolio demo, not production use. The app permits public registration and does not yet include email verification, rate limiting, or password recovery.