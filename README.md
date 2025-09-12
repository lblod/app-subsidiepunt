# app-subsidiepunt

The `app-subsidiepunt` project is a web application developed with Ember.js. It is part of the Lokale Besturen Linked Open Data (LBLod) ecosystem and provides a public-facing portal to explore and access subsidies relevant to Flemish municipalities and associations.

## Description

Subsidiepunt enables users to search for and view government subsidies applicable to their type of organization. It supports both local government entities (bestuurseenheden) and associations (verenigingen), offering tailored information based on organizational context.

The application is data-driven, integrating with RDF-based sources and consuming updates via Linked Data Event Streams (LDES) to ensure up-to-date information.

## What's Included

This repository includes two Docker Compose configurations:

- `docker-compose.yml`: The main configuration providing backend components and a build-ready frontend for deployment (usually behind a proxy).
- `docker-compose.dev.yml`: Tailored for development purposes:
  - Exposes backend services on port `90`
  - Publishes the triplestore (Virtuoso) on port `8890`
  - Includes a mock-login backend to bypass ACM/IDM during development

## System Requirements

- Machine with at least 16 GB RAM
- Docker and Docker Compose

## Setup Instructions

### Clone the Repository

```bash
git clone https://github.com/lblod/app-subsidiepunt.git
cd app-subsidiepunt
```

### Configuration

Create a `docker-compose.override.yml` file:

```yaml
version: '3.7'
subsidiepunt:
  ports:
    - 4205:80
```

Create an `.env` file:

```
COMPOSE_FILE=docker-compose.yml:docker-compose.dev.yml:docker-compose.override.yml
```

### Start the Application

```bash
docker-compose up # or use -d for detached mode
docker-compose logs -f --tail=100 migrations
```

Visit the app at `http://localhost:4205` (or change port if needed).

### Development with Ember

To develop the frontend:

```bash
ember serve --proxy http://localhost:90/
```

Refer to [frontend-subsidiepunt](https://github.com/lblod/frontend-subsidiepunt) for details.

## Data Producer and LDES

LDES integration enables live and historical subsidy data to be shared.

Default stream:
```
http://localhost:90/streams/ldes/subsidies/public/1
```

To generate historical data:

1. In `docker-compose.override.yml`:

```yaml
ldes-delta-pusher:
  environment:
    WRITE_INITIAL_STATE: "true"
```

2. Start services:
```bash
docker-compose up -d ldes-delta-pusher ldes-backend virtuoso database
```

3. Check logs:
```bash
docker-compose logs -f --tail=200 ldes-delta-pusher
```

4. Set `WRITE_INITIAL_STATE` back to `false` after sync.

## Delta Producers

The application supports external publishing via delta-producers.

### Workflow Stages

1. **Initial Sync**: Publishes historical data to consumers
2. **Normal Operation**: Real-time updates
3. **Healing Mode**: Periodic consistency checks
4. **Dumps**: Regular snapshots for fast onboarding

### Trigger Initial Sync

Update your `docker-compose.override.yml`:

```yaml
delta-producer-background-jobs-initiator-subsidies:
  environment:
    START_INITIAL_SYNC: 'true'
```

Then:
```bash
docker-compose up -d delta-producer-background-jobs-initiator-subsidies
```

### Healing and Dumps

Healing jobs are scheduled by default. One job at a time. Delete existing jobs before triggering new ones.

Dump files are written to:
```
data/files/delta-producer-dumps
```

Control frequency via `CRON_PATTERN_DUMP_JOB`.

### Publication Triplestore

Used for separating published data from app internals. Improve performance and simplify internal DB logic.

Optional: share files (e.g., attachments) by setting a `KEY` env variable.

## Bestuurseenheden and Verenigingen

Unique to this app, we allow access to both **bestuurseenheden** and **verenigingen**. The application accommodates both by primarily using the parent type: `org:Organization`.

### Bestuurseenheden
- These are public administrative units.
- They are imported via the **OP-consumer** service.

### Verenigingen
- These are not known beforehand.
- A `vereniging` is created **ad hoc** when a user logs in for the first time.
- A corresponding **mock-login account** is also generated automatically upon detecting a new `org:Organization`.
- This process is managed by:
  - A **custom login service**
  - A **mock-account-generation service**

## Maintenance & Troubleshooting

### Upgrade

```bash
docker-compose down
git pull origin master
docker-compose up
```

### Reset Database

```bash
docker-compose down
rm -Rf data/db
git checkout data/db
docker-compose up
```

### Virtuoso Production Settings

For production ingestion, add to override file:

```yaml
virtuoso:
  volumes:
    - ./data/db:/data
    - ./config/virtuoso/virtuoso-production.ini:/data/virtuoso.ini
    - ./config/virtuoso/:/opt/virtuoso-scripts
```

### Data integrity checks
#### Their should be no subsidies with stats sent & having an active step set
```sparql
SELECT DISTINCT * WHERE {

  ?s a <http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelConsumptie> ;
    <http://www.w3.org/2007/uwa/context/common.owl#active> ?active; 
    <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/2ea29fbf-6d46-4f08-9343-879282a9f484>

} LIMIT 10
```

## Additional Services

- `delta-producer-report-generator`: Config dependent on deployment
- `deliver-email-service`: Requires credentials to function

## License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.

## Contact

Maintained by the Agentschap Binnenlands Bestuur and the LBLod team.

More at: [https://github.com/lblod](https://github.com/lblod)
