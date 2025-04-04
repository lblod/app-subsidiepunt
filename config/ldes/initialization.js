const regularTypes = {
  "http://www.w3.org/ns/adms#Status": "public",
  "http://www.w3.org/ns/adms#Identifier": "abb",
  "http://schema.org/ContactPoint": "abb",
  "http://www.w3.org/ns/locn#Address": "abb",
};

export const initialization = {
  public: {
    "http://lblod.data.gift/vocabularies/subsidie/ApplicationForm": {
      filter: `
        OPTIONAL { ?s <http://www.w3.org/ns/adms#status> ?status. }
        FILTER(!BOUND(?status) || ?status != <http://lblod.data.gift/concepts/9bd8d86d-bb10-4456-a84e-91e9507c374c>)`,
    }
  },
  abb: {
    "http://lblod.data.gift/vocabularies/subsidie/ApplicationForm": {},
    "http://www.w3.org/ns/adms#Status": {},
  },
  internal: {
    "http://lblod.data.gift/vocabularies/subsidie/ApplicationForm": {},
    "http://www.w3.org/ns/adms#Status": {},
  },
};

Object.keys(regularTypes).forEach((type) => {
  const level = regularTypes[type];
  if (level === "public") {
    initialization.public[type] = {};
    initialization.organization[type] = {};
  } else if (level === "organization") {
    initialization.organization[type] = {};
  }
});