# Dynatrace Ingestion Setup Guide

## Quick Start

### 1. Configure Environment Variables

Add these to your `.env` file:

```bash
# Dynatrace API
DT_ENVIRONMENT_URL=https://hmc05194.apps.dynatrace.com
DT_API_TOKEN=dt0c01.your_token_here

# Ingestion Settings
INGESTION_RETENTION_DAYS=90
INGESTION_MAX_STORAGE_GB=100
ENABLE_CRON_JOBS=true
```

### 2. Run Setup

```bash
npm run setup-ingestion
```

This creates collections and indexes.

### 3. Test Manual Sync

```bash
npm run sync-dynatrace
```

### 4. Start Server with Cron Jobs

```bash
npm run dev
```

---

## Scheduled Jobs

| Job             | Time  | Description                   |
| --------------- | ----- | ----------------------------- |
| Daily Ingestion | 00:00 | Syncs problems from Dynatrace |
| Data Retention  | 02:00 | Archives/cleans old data      |

---

## Configuration Options

### Ingestion (`INGESTION_*`)

| Variable                   | Default | Description    |
| -------------------------- | ------- | -------------- |
| `INGESTION_RETENTION_DAYS` | 90      | Days to retain |
| `INGESTION_MAX_PROBLEMS`   | 500     | Max per run    |
| `INGESTION_MAX_STORAGE_GB` | 100     | Storage limit  |
| `INGESTION_DAILY_TIME`     | 00:00   | Sync time      |

### Retention (`RETENTION_*`)

| Variable             | Default | Description          |
| -------------------- | ------- | -------------------- |
| `RETENTION_DAYS`     | 90      | Active data days     |
| `ARCHIVE_AFTER_DAYS` | 90      | Archive threshold    |
| `DELETE_AFTER_DAYS`  | 180     | Delete archived data |

---

## Troubleshooting

### Connection Failed (401)

- Verify `DT_API_TOKEN` is correct
- Token should start with `dt0c01.`
- Check token has `problems.read` scope

### Storage Limit Reached

The system automatically:

1. Removes duplicates
2. Archives old data
3. Frees storage

Force cleanup:

```bash
# Currently handled automatically
```

### Cron Jobs Not Running

- Set `ENABLE_CRON_JOBS=true`
- Or use production mode: `NODE_ENV=production`
