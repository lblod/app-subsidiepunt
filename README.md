# Subsidiepunt


## What's included?

This repository harvest two setups.  The base of these setups resides in the standard docker-compose.yml.

* *docker-compose.yml* This provides you with the backend components.  There is a frontend application included which you can publish using a separate proxy (we tend to put a letsencrypt proxy in front).
* *docker-compose.dev.yml* Provides changes for a good frontend development setup.
  - publishes the backend services on port 90 directly, so you can run `ember serve --proxy http://localhost:90/` when developing the frontend apps natively.
  - publishes the database instance on port 8890 so you can easily see what content is stored in the base triplestore
  - provides a mock-login backend service so you don't need the ACM/IDM integration.

## Running and maintaining

  General information on running and maintaining an installation

### Running your setup

#### system requirments
You'll need a beefy machine, with at least 16 GB of ram.

#### Running the dev setup
```
  # Clone this repository
  git clone https://github.com/lblod/app-digitaal-loket.git

  # Move into the directory
  cd app-subsidiepunt
```
To ease all typing for `docker-compose` commands, start by creating the following files in the directory of the project.
A `docker-compose.override.yml` file with following content:
```
version: '3.7'
```
And an `.env` file with following content:
```
COMPOSE_FILE=docker-compose.yml:docker-compose.dev.yml:docker-compose.override.yml
```
##### Starting the app
This should be your go-to way of starting the stack.
```
docker-compose up # or 'docker-compose up -d' if you want to run it in the background
```
Always double check the status of the migrations `docker-compose logs -f --tail=100 migrations`
Wait for everything to boot to ensure clean caches.

Probably the first thing you'll want to do, is see wether the app is running correctly. The fastest way forward is creating a `docker-compose.override.yml` file next to the other `docker-compose.yml` files, and add
```
# (...)
  subsidiepunt:
    ports:
      - 4205:80
```
This way, you can directly connect to a built version of the frontend on port `4205`. Note, you might have conflicts because the port is already busy.
you're free to change `4205` to whatever suits you.

Once the migrations have ran, you can start developing your application by connecting the ember frontend application to this backend.  See <https://github.com/lblod/frontend-subsidiepunt> for more information on development with the ember application.


#### Running the regular setup

  ```
  docker-compose up
  ```

  The stack is built starting from [mu-project](https://github.com/mu-semtech/mu-project).

  OpenAPI documentation can be generated using [cl-resources-openapi-generator](https://github.com/mu-semtech/cl-resources-openapi-generator).

### Ingesting external data
Currently no external data is to be ingested. This might change over time.

### Setting up the delta-producers related services

To ensure the app can share data, producers need to be set up. There is an initial sync that is potentially very expensive and must be started manually. In the case of this app, there is only one delta-stream: the one for sharing information about the existing subsidies-dossiers. Note, of course, this might evolve over time.
We will keep the procedure here for subsidies; SIMILAR procedure should be expected if other types of data need to be shared. Consider the following bits of text as a tutorial rather than general documentation.

:warning: We are currently referring to slightly older versions of the delta production services. If you go to the repositories of the respective services, ensure you are looking at the correct versions. :warning

#### High level description
Delta production consists of four stages.

The first stage is an initial sync of the publication graph. This stage takes the necessary data from the source graph and populates the publication graph. Afterward, it creates a dump file (as a `dcat:Dataset`) to make it available for consumers. The reasons for this stage are:
- Usually, there is already relevant data available in the database for consumers.
- Packaging it as a dump file speeds up the first sync for consumers compared to using small delta files.

The second stage, after the initial sync, is the 'normal operation mode'. In this stage, internal deltas come in, and the publication graph maintainer decides whether the data needs to be published to the outside world.

The third stage is 'healing mode', where a periodic job checks if any internal deltas were missed and corrects this by updating the published information. This can occur due to migration (not creating deltas), service crashes, premature shutdowns, etc.

The fourth stage involves creating a periodic dump file (or snapshot) of the published data. This allows new consumers to start from the latest snapshot instead of replaying all the small delta files from the beginning.

Note: All these steps can be turned off, but this is not the default setting.

#### Setting up producer for subsidies: initial sync
To ensure that the app can share data, it is necessary to set up the producers. First, ensure a significant dataset is present in the database.
The [delta-producer-background-jobs-initiator](https://github.com/lblod/delta-producer-background-jobs-initiator) is responsible for initiating the initial sync job. To trigger this job, follow the steps below.

1. make sure the app is up and running, the migrations have run
2. in docker-compose.override.yml, make sure the following configuration is provided:
```
  delta-producer-background-jobs-initiator-subsidies:
    environment:
      START_INITIAL_SYNC: 'true'
```
3. `drc up -d delta-producer-background-jobs-initiator-subsidies`
4. You can follow the status of the job, through the dashboard.

##### Troubleshooting
Please note that the system expects this initial sync job to run only once. If something fails (or gets stuck on busy for an excessive amount of time), delete the job through the dashboard. Assuming the configuration is still the same, simply run `drc restart delta-producer-background-jobs-initiator`.
There are also other ways to trigger this job; please refer to the docs of `delta-producer-background-jobs-initiator`.
Also; if something goes wrong; the first logs to check are these of the `delta-producer-publication-graph-maintainer-subsidies`.

#### Setting up mandatees-decisions 'normal operation mode'
If the initial sync is successful, it should automatically work. Note that if the healing job is running, it will temporarily disable normal operation mode until the healing is finished.

#### Setting up subsidies 'healing mode'
If the initial sync is successful, the default configuration will ensure healing kicks in periodically. The service for managing these jobs is again [delta-producer-background-jobs-initiator](https://github.com/lblod/delta-producer-background-jobs-initiator). :warning: again, make sure to look at the proper version.
For the exact parameters; check the configuration in the `docker-compose.yml`

##### Troubleshooting
Please note that the system expects only one healing job to run at a time. If you want to restart it, first delete the previous healing job through the dashboard. To restart the healing job manually, please refer to the documentation of `delta-producer-background-jobs-initiator`.

#### Setting up subsidies dumps
Dumps are used by consumers as a snapshot to start from, this is faster than consuming all delta's. They are generated by the [delta-producer-dump-file-publisher](https://github.com/lblod/delta-producer-dump-file-publisher) which is started by a task created by the [delta-producer-background-jobs-initiator](https://github.com/lblod/delta-producer-background-jobs-initiator). The necessary config is already present in this repository. It's recommended to set up dumps on a regular interval.
Check `CRON_PATTERN_DUMP_JOB` variable to control the cron-job

Make sure to re-created the background-job-initiator service after changing the config.

Dumps will be generated in [data/files/delta-producer-dumps](data/files/delta-producer-dumps/).

```bash
docker compose up -d delta-producer-background-jobs-initiator-subsidies
```
#### Troubleshooting
Please note that the system expects only one dump job to run at a time.
You can delete the respective job in the `jobs-dashboard`. To trigger it manually on the spot, refer to the `delta-producer-background-jobs-initiator` documentation. Also, if something goes wrong, the first logs to check are those of the `delta-producer-dump-file-publisher`.

##### Deltas producer: extra considerations
###### Why a Separate Triple Store: Publication Triplestore?

The publication triple store was introduced for several reasons:

- The data it contains is operational data (published info) which is not the source data of your app. This makes it easier to manage code-wise, as you don't need to account for this data in your original triplestore (e.g., migrations remain the same, and the code doesn't need to consider that graph).
- Performance-wise, it is usually better for the source database since it doesn't need to manage a potential duplicate of your data.
- In some apps, this triple store is also used as the store for the landing zone of the consumer, serving as a safe space for messy (incomplete) data, which you can filter out when storing in the source database. 

It's a bit of a workaround for the future features of mu-auth.

###### Sharing of attachments and other file data.
If files need to be shared over deltas (attachments, form-data, cached-files) you will need to set in a docker-compose.override.yml
```
#(...)
  delta-producer-publication-graph-maintainer-subsidies:
    KEY: "foo-bar
```
This will needs to be set in the consuming stack too. See [delta-producer-publication-graph-maintainer](https://github.com/lblod/delta-producer-publication-graph-maintainer) for more informmation on the implications.

##### Additional notes

###### Performance
- The default virtuoso settings might be too weak if you need to ingest the production data. Hence, there is better config, you can take over in your `docker-compose.override.yml`
```
  virtuoso:
    volumes:
      - ./data/db:/data
      - ./config/virtuoso/virtuoso-production.ini:/data/virtuoso.ini
      - ./config/virtuoso/:/opt/virtuoso-scripts
```
###### delta-producer-report-generator
Not all required parameters are provided, since deploy specific, see [report-generator](https://github.com/lblod/delta-producer-report-generator)
###### deliver-email-service
Should have credentials provided, see [deliver-email-service](https://github.com/redpencilio/deliver-email-service)

### Upgrading your setup

Once installed, you may desire to upgrade your current setup to follow development of the main stack.  The following example describes how to do this easily for both the demo setup, as well as for the dev setup.

#### Upgrading the dev setup
For the dev setup, we assume you'll pull more often and thus will most likely clear the database separately:
```
# This assumes the .env file has been set. Cf. supra in the README.md
# Bring the application down
docker-compose down
# Pull in the changes
git pull origin master
# Launch the stack
docker-compose up
```
  As with the initial setup, we wait for everything to boot to ensure clean caches.  You may choose to monitor the migrations service in a separate terminal to and wait for the overview of all migrations to appear: `docker-compose logs -f --tail=100 migrations`.

  Once the migrations have ran, you can go on with your current setup.

### Cleaning the database

At some times you may want to clean the database and make sure it's in a pristine state.

```
# This assumes the .env file has been set. Cf. supra in the README.md
# Bring down our current setup
docker-compose down
# Keep only required database files
rm -Rf data/db
git checkout data/db
# Bring the stack back up
docker-compose up
```
Notes:
  - virtuoso can take a while to execute its first run, meanwhile the database is inaccessible. Make also sure to wait for the migrations to run.
  - data from external sources need to be synced again.
