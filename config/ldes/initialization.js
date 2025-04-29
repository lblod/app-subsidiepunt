export const initialization = {
  public: {
    "http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelConsumptie": {
      filter: `
        ?s a <http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelConsumptie> ;
           <http://www.w3.org/ns/adms#status> ?status .
      `
    }
  },
  abb: {},
  internal: {}
};
