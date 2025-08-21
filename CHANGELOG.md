# Changelog
## Unreleased
- extend deadline for e-inclusie
- Fix faulty status for LEKP 1.0 old submissions
- extend deadline LEKP 1.0 - last step
### Deploy instructions
`drc restart migrations subsidy-applications-management cache resource`


## 2.14.2
- stadsvernieuwing projectsubsidie fase 2
   - fix text
   - add missing subsidieprcedure step type triple
### Deploy instructions
`drc restart migrations subsidy-applications-management cache resource`

## 2.14.0
- add new step stadsvernieuwing - projectsubsidie - 2025
- `drc restart migrations; drc restart cache resource subsidy-application-flow-management subsidy-applications-management`
  
### Deploy instructions
## 2.13.0
- cleanup dispatcher rules (restrict)
- introduce subsidiedatabank frontend
- Add subsidiedatabank graph populated by migrations & db-cleanup
- update subsidies producer config 
- Add concept-scheme for filter-form dropdowns
- update frontend images to use static-file
- add reverse-host for correct frontend routing

### Deploy instructions
`git pull`
task: frontend-subsidiedatabank override:
```
  frontend-subsidiedatabank:
    environment:
      VIRTUAL_HOST: "subsidiedatabank.abb.vlaanderen.be"
      LETSENCRYPT_HOST: "subsidiedatabank.abb.vlaanderen.be"
      LETSENCRYPT_EMAIL: "support+servers@redpencil.io"
      STATIC_FOLDERS_REGEX: "^/(assets|font|files|@appuniversum)/"
      EMBER_ACMIDM_CLIENT_ID: "49df4086-d456-4bac-8162-1e89c983e5a1"
      EMBER_ACMIDM_SCOPE: "openid vo rrn profile abb_subsidiedatabank"
      EMBER_ACMIDM_AUTH_URL: "https://authenticatie-ti.vlaanderen.be/op/v1/auth"
      EMBER_ACMIDM_LOGOUT_URL: "https://authenticatie-ti.vlaanderen.be/op/v1/logout"
      EMBER_ACMIDM_AUTH_REDIRECT_URL: "https://subsidiedatabank.abb.vlaanderen.be/authorization/callback"
      EMBER_ACMIDM_SWITCH_REDIRECT_URL: "https://subsidiedatabank.abb.vlaanderen.be/switch-login" 
``` 
`drc up -d`
`drc restart dispatcher migrations delta-producer-publication-graph-maintainer-subsidies`
!important: migrations might take longer then usual
`drc restart database cache resource form-data-management subsidy-application-flow-management subsidy-applications-management`


## 2.11.0
### Backend
 - Added basic ldes producer for LDES-based data exchange with Kalliope see also: DGS-475
 - fix op consumer config to avoid accidental deletes
 - reset OP-consumer

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
