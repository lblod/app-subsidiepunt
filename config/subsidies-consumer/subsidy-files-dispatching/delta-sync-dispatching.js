const {
  BATCH_SIZE,
  MAX_DB_RETRY_ATTEMPTS,
  SLEEP_BETWEEN_BATCHES,
  SLEEP_TIME_AFTER_FAILED_DB_OPERATION,
  INGEST_GRAPH,
} = require('./config');

const { processFileDeltas, DELETE_OPERATION, DOWNLOAD_OPERATION } = require('./file-processor');
const { batchedDbUpdate, deleteFromAllGraphs} = require('./utils');



/**
 * Dispatch the fetched information to a target graph. The function consists of 3 parts:
 * - Regular inserts/deletes
 * - Meta ttl inserts/deletes
 * - Attachment inserts
 * @param { mu, muAuthSudo, fetch } lib - The provided libraries from the host service.
 * @param { termObjectChangeSets: { deletes, inserts } } data - The fetched changes sets, which objects of serialized Terms
 *          [ {
 *              graph: "<http://foo>",
 *              subject: "<http://bar>",
 *              predicate: "<http://baz>",
 *              object: "<http://boom>^^<http://datatype>"
 *            }
 *         ]
 * @return {void} Nothing
 */
async function dispatch(lib, data) {
  const { mu, muAuthSudo, fetch } = lib;

  for (const { deletes, inserts } of data.termObjectChangeSets) {
    await processFileDeltas(deletes, fetch, DELETE_OPERATION)
    await processFileDeltas(inserts, fetch, DOWNLOAD_OPERATION)
  }
}

module.exports = {
  dispatch,
};
