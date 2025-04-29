export const getHealingConfig = async () => {
  return {
    public: {
      entities: {
        "http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelConsumptie": {
          healingPredicates: [
            "http://purl.org/dc/terms/modified",
            "http://www.w3.org/ns/adms#status"
          ],
          instanceFilter: ""
        }
      }
    }
  };
};
