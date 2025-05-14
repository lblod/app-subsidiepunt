import { moveTriples } from "../support";
import { Changeset } from "../types";
import { sparqlEscapeUri } from "mu";
import { querySudo } from "@lblod/mu-auth-sudo";

function getSafeSubjects(subjects) {
  return Array.from(subjects)
    .map((subject) => {
      return sparqlEscapeUri(subject);
    });
}

async function constructSubsidieMaatregelConsumptieData(subjects) {
  const safeSubjects = getSafeSubjects(subjects).join('\n');
  const queryStr = `
    CONSTRUCT {
      ?target a <http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelConsumptie>;
       <http://www.w3.org/ns/adms#status> ?status;
       <http://purl.org/dc/terms/modified> ?modified.
    }
    WHERE {
     VALUES ?target { ${safeSubjects} }
     ?target a <http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelConsumptie>;
       <http://www.w3.org/ns/adms#status> ?status;
       <http://purl.org/dc/terms/modified> ?modified.
   }`;

  const { results: { bindings } } = await querySudo(queryStr);

  if(bindings?.length) {
    return bindings.map(({ s, p, o }) => {
      return { subject: s, predicate: p, object: o };
    });
  } else return [];
}

async function constructTombstoneData(subjects) {
  const safeSubjects = getSafeSubjects(subjects).join('\n');
  const queryStr = `
    CONSTRUCT {
      ?target a <http://www.w3.org/ns/activitystreams#Tombstone>.
    }
    WHERE {
      VALUES ?target { ${safeSubjects} }
      FILTER NOT EXISTS {
        ?target a <http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelConsumptie>;
          <http://www.w3.org/ns/adms#status> ?status.
      }
    }`;

  const { results: { bindings } } = await querySudo(queryStr);

  if(bindings?.length) {
    return bindings.map(({ s, p, o }) => {
      return { subject: s, predicate: p, object: o };
    });
  } else return [];
}

async function filterSubjectsOfInterest(changesets) {
  //Note: this is taken from delta-publication-graph-maintainer.

  let allFilteredSubjects = [];

  // Get types from the delta: (For "DELETE" statement might be the only place containing this info)
  for (let changeSet of changesets) {
    const triples = [...changeSet.inserts, ...changeSet.deletes];

    const filteredSubjects = triples
      .filter(t =>
          t.predicate.value == 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
          &&
          t.object.value == 'http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelConsumptie')
      .map(t => t.subject.value);

    allFilteredSubjects = [ ...allFilteredSubjects, ...filteredSubjects ];
  }

  console.log(`Found ${allFilteredSubjects.length} in delta, checking tripleStore for rdf:type`);

  // Get types from the store; we're not guaranteed having type information in the delta, hence the double check.
  for (let changeSet of changesets) {
    const triples = [...changeSet.inserts, ...changeSet.deletes];

    let subjects = triples.map(t => t.subject.value)
    subjects  = [ ...new Set(subjects) ]; //avoid doubles

    for(const subject of subjects) {
      const result = await querySudo(`
        ASK {
          ${sparqlEscapeUri(subject)} a <http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelConsumptie>.
        }
      `);

      if(result.boolean) {
        allFilteredSubjects.push(subject);
      }
    }
  }

  allFilteredSubjects = [ ...new Set(allFilteredSubjects) ]; //ensure unique values
  return allFilteredSubjects;
}

export default async function dispatch(changesets) {
  //TODO: we could bundle the changesets with a sleep or something
  const subjects = await filterSubjectsOfInterest(changesets);
  const subsidieMaatRegelConsumptieData  = await constructSubsidieMaatregelConsumptieData(subjects);
  const tombstoneData = await constructTombstoneData(subjects);
  const data = [ ...subsidieMaatRegelConsumptieData, ...tombstoneData ];

  await moveTriples([ { inserts: data } ]);
}
