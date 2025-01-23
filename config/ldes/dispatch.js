import { moveTriples } from "../support";
import { query, sparqlEscapeUri } from 'mu';

export default async function dispatch(changesets) {
	for (const changeset of changesets) {
		const subjects = new Set(changeset.inserts.map((insert) => insert.subject.value));
		for (const subject of subjects) {
			const { results: { bindings } } = await query(`
        PREFIX adms: <http://www.w3.org/ns/adms#>
  
        CONSTRUCT {
          ?subsidieApplication a <http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelConsumptie>
              adms:status ?status
        } WHERE {
          ?subsidieApplication a <http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelConsumptie>
            adms:status ?status.
        }
			`);
      if(bindings.length){
        console.log('SUCCESS')
        await moveTriples([
          {
            inserts: bindings.map(({ s, p, o}) => { return { subject: s, predicate: p, object: o} }),
          }
        ])
      }
		}
	}
}