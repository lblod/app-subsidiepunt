# Changelog
## Unreleased
- fix op consumer config to avoid accidental deletes
- reset OP-consumer
### Deploy notes
```
drc stop;
```
Update `docker-compose.override.yml` to remove the config of `op-public-consumer` and replace it by:
```
  op-public-consumer:
    environment:
      DCR_SYNC_BASE_URL: "https://organisaties.abb.vlaanderen.be" # or another endpoint
      DCR_LANDING_ZONE_DATABASE: "virtuoso" # for the initial sync, we go directly to virtuoso
      DCR_REMAPPING_DATABASE: "virtuoso" # for the initial sync, we go directly to virtuoso
      DCR_DISABLE_INITIAL_SYNC: "false"
      DCR_DISABLE_DELTA_INGEST: "false"
```
Then:
```
drc up -d virtuoso migrations
drc up -d database op-public-consumer
# Wait until success of the previous step
```
Then, update `docker-compose.override.yml` to:
```
  op-public-consumer:
    environment:
      DCR_SYNC_BASE_URL: "https://organisaties.abb.vlaanderen.be" # or another endpoint
      DCR_LANDING_ZONE_DATABASE: "database"
      DCR_REMAPPING_DATABASE: "database"
      DCR_DISABLE_DELTA_INGEST: "false"
      DCR_DISABLE_INITIAL_SYNC: "false"
```
```
drc up -d
```
## v1.3.0
- fix the required bicycle infrastructure file uploads
- update e-inclusion verantwoording form
- add db-cleanup
- update frontend
## v1.2.0
### login
- add organization environment variables
## v1.2.0
### General
- Add verenigingen support in subsidiepunt
## v1.1.3
### Frontend
- v1.1.3
## v1.1.2
### Frontend
- v1.1.2
## v1.1.1 HOTFIX
- Add missing rdf types to exisiting form-data
## v1.1.0
### General
#### Migrations
- append-loket-admin-rights-to-abb
#### Delta-producer
- Change graph match to subsidieGebruiker
## v1.0.0
### General
- Initial state loket data import
