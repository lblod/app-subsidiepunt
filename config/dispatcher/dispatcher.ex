defmodule Dispatcher do
  use Matcher

  define_accept_types [
    html: ["text/html", "application/xhtml+html"],
    json: ["application/json", "application/vnd.api+json"],
    upload: ["multipart/form-data"],
    any: [ "*/*" ],
  ]

  @html %{ accept: %{ html: true } }
  @json %{ accept: %{ json: true } }
  @upload %{ accept: %{ upload: true } }
  @any %{ accept: %{ any: true } }

  #############################################################################
  # Frontend resources
  #############################################################################

  get "/organizations/*path", @json do
    forward conn, path, "http://cache/organizations/"
  end

  get "/organization-classification-codes/*path", @json do
    forward conn, path, "http://cache/organization-classification-codes/"
  end

  get "/bestuurseenheden/*path", @json do
    forward conn, path, "http://cache/bestuurseenheden/"
  end

  # match "/werkingsgebieden/*path" do
  #   forward conn, path, "http://cache/werkingsgebieden/"
  # end

  get "/bestuurseenheid-classificatie-codes/*path", @json do
    forward conn, path, "http://cache/bestuurseenheid-classificatie-codes/"
  end

  # match "/bestuursorganen/*path" do
  #   forward conn, path, "http://cache/bestuursorganen/"
  # end

  # match "/bestuursorgaan-classificatie-codes/*path" do
  #   forward conn, path, "http://cache/bestuursorgaan-classificatie-codes/"
  # end

  # TODO: remove?
  # match "/personen/*path" do
  #   forward conn, path, "http://cache/personen/"
  # end

  # match "/document-statuses/*path" do
  #   forward conn, path, "http://cache/document-statuses/"
  # end

  get "/submission-document-statuses/*path", @json do
    forward conn, path, "http://cache/submission-document-statuses/"
  end

  # match "/file-addresses/*path" do
  #   forward conn, path, "http://resource/file-addresses/"
  # end

  # match "/file-address-cache-statuses/*path" do
  #   forward conn, path, "http://resource/file-address-cache-statuses/"
  # end

  # match "/datasets/*path" do
  #   forward conn, path, "http://cache/datasets/"
  # end

  # match "/distributions/*path" do
  #   forward conn, path, "http://cache/distributions/"
  # end

  # NOTE: resources
  get "/remote-urls/*path", @json do
    forward conn, path, "http://resource/remote-urls/"
  end

  #############################################################################
  # Frontend dashboard resources
  #############################################################################

  # NOTE: resources
  get "/reports/*path", @json do
    forward conn, path, "http://resource/reports/"
  end

  # NOTE: resources
  # get "/form-data/*path" do
  #   forward conn, path, "http://resource/form-data/"
  # end

  # get "/concept-schemes/*path" do
  #   forward conn, path, "http://cache/concept-schemes/"
  # end

  # get "/concepts/*path" do
  #   forward conn, path, "http://cache/concepts/"
  # end

  get "/jobs/*path", @json do
    forward conn, path, "http://cache/jobs/"
  end

  get "/tasks/*path", @json do
    forward conn, path, "http://cache/tasks/"
  end

  get "/data-containers/*path", @json do
    forward conn, path, "http://cache/data-containers/"
  end

  get "/job-errors/*path", @json do
    forward conn, path, "http://cache/job-errors/"
  end

  #############################################################################
  # Files
  #############################################################################

  get "/files/:id/download" do
    forward conn, [], "http://file/files/" <> id <> "/download"
  end

  # NOTE: resources
  get "/files/*path", @json do
    forward conn, path, "http://resource/files/"
  end

  # NOTE: resources
  patch "/files/*path", @json do
    forward conn, path, "http://resource/files/"
  end

  post "/files/*path" do
    forward conn, path, "http://file/files/"
  end

  delete "/files/*path" do
    forward conn, path, "http://file/files/"
  end

  # TODO: find all usage of this endpoint and replace it with `POST /files`
  # This is kept to maintain compatibility with code that uses the "old" endpoint.
  # UPDATE: nothing found in the frontend on 2025-06-11
  # post "/file-service/files/*path" do
  #   forward conn, path, "http://file/files/"
  # end

  #############################################################################
  # Session management
  #############################################################################

  match "/impersonations/*path", @json do
    forward conn, path, "http://impersonation/impersonations/"
  end

  match "/mock/sessions/*path", @json do
    forward conn, path, "http://mocklogin/sessions/"
  end

  match "/sessions/*path", @json do
    forward conn, path, "http://login/sessions/"
  end

  get "/gebruikers/*path", @json do
    forward conn, path, "http://cache/gebruikers/"
  end

  # NOTE: resources
  match "/accounts/*path", @json do
    forward conn, path, "http://resource/accounts/"
  end

  #############################################################################
  # Job management
  #############################################################################

  match "/job-initiator/*path" do
    forward conn, path, "http://delta-producer-background-jobs-initiator-subsidies/"
  end

  #############################################################################
  # delta-files-share
  #############################################################################

  get "/delta-files-share/download/*path" do
    forward conn, path, "http://delta-files-share/download/"
  end

  #############################################################################
  # loket-subsidies sync
  #############################################################################

  post "/sync/subsidies/login/*path" do
    forward conn, path, "http://delta-producer-publication-graph-maintainer-subsidies/login/"
  end

  get "/sync/subsidies/files/*path" do
    forward conn, path, "http://delta-producer-publication-graph-maintainer-subsidies/files/"
  end

  #############################################################################
  # LDES-producer
  #############################################################################

  get "/streams/ldes/subsidies/*path" do
    forward conn, path, "http://ldes-backend/"
  end

  #############################################################################
  # subsidy-applications: resources
  #############################################################################

  match "/subsidy-measure-consumptions/*path", @json do
    forward conn, path, "http://cache/subsidy-measure-consumptions/"
  end

  get "/subsidy-measure-consumption-statuses/*path", @json do
    forward conn, path, "http://cache/subsidy-measure-consumption-statuses/"
  end

  # match "/subsidy-requests/*path" do
  #   forward conn, path, "http://cache/subsidy-requests/"
  # end

  # match "/monetary-amounts/*path" do
  #   forward conn, path, "http://cache/monetary-amounts/"
  # end

  get "/subsidy-measure-offers/*path", @json do
    forward conn, path, "http://cache/subsidy-measure-offers/"
  end

  get "/subsidy-measure-offer-series/*path", @json do
    forward conn, path, "http://cache/subsidy-measure-offer-series/"
  end

  get "/subsidy-application-flows/*path", @json do
    forward conn, path, "http://cache/subsidy-application-flows/"
  end

  get "/subsidy-application-flow-steps/*path", @json do
    forward conn, path, "http://cache/subsidy-application-flow-steps/"
  end

  get "/subsidy-procedural-steps/*path", @json do
    forward conn, path, "http://cache/subsidy-procedural-steps/"
  end

  get "/periods-of-time/*path", @json do
    forward conn, path, "http://cache/periods-of-time/"
  end

  # match "/criteria/*path" do
  #   forward conn, path, "http://cache/criteria/"
  # end

  # match "/requirement-groups/*path" do
  #   forward conn, path, "http://cache/requirement-groups/"
  # end

  # match "/criterion-requirements/*path" do
  #   forward conn, path, "http://cache/criterion-requirements/"
  # end

  match "/participations/*path", @json do
    forward conn, path, "http://cache/participations/"
  end

  match "/subsidy-application-forms/*path", @json do
    forward conn, path, "http://cache/subsidy-application-forms/"
  end

  #############################################################################
  # subsidy-applications: custom API endpoints
  #############################################################################

  match "/management-form-file/*path" do
    forward conn, path, "http://subsidy-applications-retrieval/form-file/"
  end

  match "/case-number-generator/*path" do
    forward conn, path, "http://case-number-generator/"
  end

  # NOTE: does not exist in the service
  # get "/management-active-form-file/*path", @json do
  #   forward conn, path, "http://subsidy-applications-management/active-form-file/"
  # end

  get "/management-application-forms/*path", @json do
    forward conn, path, "http://subsidy-applications-management/semantic-forms/"
  end

  put "/management-application-forms/*path", @json do
    forward conn, path, "http://subsidy-applications-management/semantic-forms/"
  end

  delete "/management-application-forms/*path", @json do
    forward conn, path, "http://subsidy-applications-management/semantic-forms/"
  end

  post "/management-application-forms/:id/submit", @json do
    forward conn, [], "http://subsidy-applications-management/semantic-forms/" <> id <> "/submit"
  end

  match "/flow-management/*path" do
    forward conn, path, "http://subsidy-application-flow-management/flow/"
  end

  #############################################################################
  # Others
  #############################################################################

  match "/*_", @any do
    send_resp( conn, 404, "Route not found.  See config/dispatcher.ex" )
  end

end
