import { moveTriples } from "../support";
import { Changeset } from "../types";

// This dispatch function processes each changeset and moves the relevant triples
export default async function dispatch(changesets) {
  for (const changeset of changesets) {
    await moveTriples([
      {
        inserts: changeset.inserts,
        deletes: changeset.deletes,
        query: `
          PREFIX adms: <http://www.w3.org/ns/adms#>
          PREFIX subsidie: <http://data.vlaanderen.be/ns/subsidie#>

          CONSTRUCT {
            ?subsidieApplication adms:status ?status .
          }
          WHERE {
            ?subsidieApplication a subsidie:SubsidiemaatregelConsumptie ;
                                 adms:status ?status .
          }
        `
      }
    ]);
  }
}
