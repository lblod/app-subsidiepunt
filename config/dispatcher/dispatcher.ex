defmodule Dispatcher do
  use Matcher
  define_accept_types []

  # In order to forward the 'themes' resource to the
  # resource service, use the following forward rule.
  #
  # docker-compose stop; docker-compose rm; docker-compose up
  # after altering this file.
  #
  # match "/themes/*path" do
  #   forward conn, path, "http://resource/themes/"
  # end


  match "/impersonations/*path" do
    forward conn, path, "http://impersonation/impersonations/"
  end

  match "/organizations/*path" do
    forward conn, path, "http://cache/organizations/"
  end

  match "/organization-classification-codes/*path" do
    forward conn, path, "http://cache/organization-classification-codes/"
  end

  match "/bestuurseenheden/*path" do
    forward conn, path, "http://cache/bestuurseenheden/"
  end
  match "/werkingsgebieden/*path" do
    forward conn, path, "http://cache/werkingsgebieden/"
  end
  match "/bestuurseenheid-classificatie-codes/*path" do
    forward conn, path, "http://cache/bestuurseenheid-classificatie-codes/"
  end
  match "/bestuursorganen/*path" do
    forward conn, path, "http://cache/bestuursorganen/"
  end
  match "/bestuursorgaan-classificatie-codes/*path" do
    forward conn, path, "http://cache/bestuursorgaan-classificatie-codes/"
  end

  #TODO: remove?
  # match "/personen/*path" do
  #   forward conn, path, "http://cache/personen/"
  # end
  match "/mock/sessions/*path" do
    forward conn, path, "http://mocklogin/sessions/"
  end
  match "/sessions/*path" do
    forward conn, path, "http://login/sessions/"
  end
  match "/gebruikers/*path" do
    forward conn, path, "http://cache/gebruikers/"
  end
  match "/accounts/*path" do
    forward conn, path, "http://resource/accounts/"
  end
  match "/document-statuses/*path" do
    forward conn, path, "http://cache/document-statuses/"
  end
  match "/submission-document-statuses/*path" do
    forward conn, path, "http://cache/submission-document-statuses/"
  end
  get "/files/:id/download" do
    forward conn, [], "http://file/files/" <> id <> "/download"
  end
  get "/files/*path" do
    forward conn, path, "http://resource/files/"
  end
  patch "/files/*path" do
    forward conn, path, "http://resource/files/"
  end
  post "/files/*path" do
    forward conn, path, "http://file/files/"
  end
  # TODO: find all usage of this endpoint and replace it with `POST /files`
  # This is kept to maintain compatibility with code that uses the "old" endpoint.
  post "/file-service/files/*path" do
    forward conn, path, "http://file/files/"
  end
  delete "/files/*path" do
    forward conn, path, "http://file/files/"
  end
  match "/file-addresses/*path" do
    forward conn, path, "http://resource/file-addresses/"
  end
  match "/file-address-cache-statuses/*path" do
    forward conn, path, "http://resource/file-address-cache-statuses/"
  end

  match "/reports/*path" do
    forward conn, path, "http://resource/reports/"
  end

  match "/remote-urls/*path" do
    forward conn, path, "http://resource/remote-urls/"
  end

  get "/form-data/*path" do
    forward conn, path, "http://resource/form-data/"
  end

  get "/concept-schemes/*path" do
    forward conn, path, "http://cache/concept-schemes/"
  end

  get "/concepts/*path" do
    forward conn, path, "http://cache/concepts/"
  end

  #################################################################
  # delta-files-share
  #################################################################
  get "/delta-files-share/download/*path" do
    forward conn, path, "http://delta-files-share/download/"
  end

  #################################################################
  # loket-subsidies sync
  #################################################################
  post "/sync/subsidies/login/*path" do
    forward conn, path, "http://delta-producer-publication-graph-maintainer-subsidies/login/"
  end

  #################################################################
  # loket-subsidies sync
  #################################################################
  get "/sync/subsidies/files/*path" do
    forward conn, path, "http://delta-producer-publication-graph-maintainer-subsidies/files/"
  end

  #################################################################
  # subsidy-applications: resources
  #################################################################

  match "/subsidy-measure-consumptions/*path" do
    forward conn, path, "http://cache/subsidy-measure-consumptions/"
  end

  match "/subsidy-measure-consumption-statuses/*path" do
    forward conn, path, "http://cache/subsidy-measure-consumption-statuses/"
  end

  match "/subsidy-requests/*path" do
    forward conn, path, "http://cache/subsidy-requests/"
  end

  match "/monetary-amounts/*path" do
    forward conn, path, "http://cache/monetary-amounts/"
  end

  match "/subsidy-measure-offers/*path" do
    forward conn, path, "http://cache/subsidy-measure-offers/"
  end

  match "/subsidy-measure-offer-series/*path" do
    forward conn, path, "http://cache/subsidy-measure-offer-series/"
  end

  match "/subsidy-application-flows/*path" do
    forward conn, path, "http://cache/subsidy-application-flows/"
  end

  match "/subsidy-application-flow-steps/*path" do
    forward conn, path, "http://cache/subsidy-application-flow-steps/"
  end

  match "/subsidy-procedural-steps/*path" do
    forward conn, path, "http://cache/subsidy-procedural-steps/"
  end

  match "/periods-of-time/*path" do
    forward conn, path, "http://cache/periods-of-time/"
  end

  match "/criteria/*path" do
    forward conn, path, "http://cache/criteria/"
  end

  match "/requirement-groups/*path" do
    forward conn, path, "http://cache/requirement-groups/"
  end

  match "/criterion-requirements/*path" do
    forward conn, path, "http://cache/criterion-requirements/"
  end

  match "/participations/*path" do
    forward conn, path, "http://cache/participations/"
  end

  match "/subsidy-application-forms/*path" do
    forward conn, path, "http://cache/subsidy-application-forms/"
  end

  #################################################################
  # subsidy-applications: custom API endpoints
  #################################################################

  match "/case-number-generator/*path" do
    forward conn, path, "http://case-number-generator/"
  end

  get "/management-active-form-file/*path" do
    forward conn, path, "http://subsidy-applications-management/active-form-file/"
  end

  get "/management-application-forms/*path" do
    forward conn, path, "http://subsidy-applications-management/semantic-forms/"
  end

  put "/management-application-forms/*path" do
    forward conn, path, "http://subsidy-applications-management/semantic-forms/"
  end

  delete "/management-application-forms/*path" do
    forward conn, path, "http://subsidy-applications-management/semantic-forms/"
  end

  post "/management-application-forms/:id/submit" do
    forward conn, [], "http://subsidy-applications-management/semantic-forms/" <> id <> "/submit"
  end

  match "/flow-management/*path" do
    forward conn, path, "http://subsidy-application-flow-management/flow/"
  end

  match "/jobs/*path" do
    forward conn, path, "http://cache/jobs/"
  end

  match "/tasks/*path" do
    forward conn, path, "http://cache/tasks/"
  end

  match "/data-containers/*path" do
    forward conn, path, "http://cache/data-containers/"
  end

  match "/job-errors/*path"  do
    forward conn, path, "http://cache/job-errors/"
  end

  match "/datasets/*path" do
    forward conn, path, "http://cache/datasets/"
  end

  match "/distributions/*path" do
    forward conn, path, "http://cache/distributions/"
  end

  match "/*_" do
    send_resp( conn, 404, "Route not found.  See config/dispatcher.ex" )
  end
end
