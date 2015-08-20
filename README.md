# Prevem: Open source preview manager for emails

Prevem is a batch manager for email previews. It provides a RESTful CRUD API
which may be used for two types of agents:

 * *Composer* - The mail user-agent (MUA) in which a user prepares a mailing.
   Generally, the Composer submits a `PreviewBatch` and polls to track its progress.
 * *Renderer* - The backend service which prepares a screenshot of how an email would
   appear when read in different MUAs. Generally, a Renderer polls for a pending
   `PreviewTask` record, prepares a screenshot, and then marks it as completed.

# Setup

```
$ git clone https://github.com/civicrm/prevem
...
$ cd prevem
$ npm install
...
$ node .
Browse your REST API at http://0.0.0.0:3000/explorer
Web server listening at: http://0.0.0.0:3000/
```
# Webmail Renderer Setup
The file package.json also contains the [Webmail Renderer](www.github.com/utkarshsharma/webmail-renderer.git) package which gets installed when you do npm install.

```
$ cd node_modules/webmail-renderer

## Create a config file
$ cp config.json.template config.json
$ vi config.json   (<== Put in gmail and yahoo credentials==>)
## The sender credentials should be of a gmail account with reduced security, i.e., "Allow Less Secure Apps" should be ON.
## You don't need to change the prevemURL and prevemCredentials fields.
##These entries match the default Prevem URL and the credentials that the renderers use to login to the Prevem.

## Run the renderers
$ nodejs gmail.js
$ nodejs yahoo.js ##In a new Terminal tab
##These nodejs scripts will keep running in the background and renderer and tasks pitched up to them.
```
# PrevemURL configuration

Now in CiviCRM, on the Navigation Bar, click Administer>CiviMail>CiviMail Component Settings.
Set your Prevem URL from there. It should be in the following format:
http://consumerId:consumerPass@localhost:3000
where:
consumerId-> Your consumer ID on the Prevem. Every preview batch you request would be carrying this Id to distinguish your preview batches from the others. This will also be used to login to the Prevem.
consumerPass-> Your secret password which will be used to login to the Prevem.
localhost:3000-> Change this if you are hosting your Prevem somewhere other than localhost:3000

That completes your setup. You are now ready to use your Email Preview Cluster Service.

<!-- # Preview Manager Configuration

The file server/config.json contains the configuration options for the Preview Manager. The host and port fields contain information regarding where the Preview Manager is being hosted. The 

# Data Model

The models are defined in JSON files under [common/models](common/models).



At this point, you can visit http://localhost:3000/explorer to examine
the available APIs.

# Development

Starting the service with `node .` should create a working environment,
but it's a bit cumbersome to develop on. For local development (and only
for local development), it's better to start via:

```
$ npm install -g gulp
$ gulp develop
```

This will launch the service and execute the test suite. If you make
any changes to the code, it will relaunch the service and re-execute
the test suite.

If you encounter a hard-crash during development, you may need to
manually restart `gulp develop`.

# Data Model

The model is defined in JSON files under [common/models](common/models).
To create additional models, see "Create Models" in [LoopBack: Getting Started](http://loopback.io/getting-started/).

# API Examples

The following sections discuss a bit about how other agents are
expected to interact with `prevem` with some example use-cases
and API calls. To follow along, it is best to open the API
explorer (http://localhost:3000/explorer) and run the commands.

*TYPOGRAPHICAL NOTE: Most API calls accept an input-document of
type `application/json`, and this is displayed in the examples.
However, in some cases, the input is passed as a URL parameter.
Such input should encoded twice (firstly, as JSON; secondly,
as URL data). For readability, we display the examples as if
 they were just JSON.*

## API Examples: Integrating with a Composer

A *Composer* should generally use two API calls. When the user wishes
to prepare a new preview, the *Composer* should create a new `PreviewBatch`
record:

```
POST /api/PreviewBatches
Content-Type: application/json
Accept: application/json

{
  "consumerId": "SOME-UNIQUE-ID"
  "batchId": "SOME-UNIQUE-ID",
  "message": {
    "subject": "Hello world",
    "body_html": "<html><body>Hello world (in <b>HTML</b>)</body></html>"
    "body_text": "Hello world (in text)"
  },
  "renderers": ["gmail", "outlook"]
}
```

The *Composer* may then poll periodically to determine how well the preview
has progressed by fetching a list of `PreviewTask` records filtered on the
`batchId`. The `filter` option accepts a JSON expression.

```
// TYPOGRAPHICAL NOTE: Escaping altered for readibility.
GET /api/PreviewTasks?filter={
  "where": {
    "batchId": "SOME-UNIQUE-ID"
  }
}

```

## API Examples: Integrating with a Renderer (WIP, NOT IMPLEMENTED, SPECULATIVE)

There may be several renderers (such as a Gmail renderer or a Microsoft
Outlook renderer). Each renderer should use two API calls. First, it
should periodically poll to see if any new tasks are waiting for it:

```
POST /api/PreviewTasks/claim
Content-Type: application/json
Accept: application/json

{
  "filter": {
    "where": {
      "renderer": "MY_SUPPORTED_RENDERING_TYPE"
    }
  }
}
```

The request will ordinarily return an empty object. However, if there are
any pending tasks, it will reserve and return the next available task.

After working on the task, the renderer should submit the resulting
screenshot:

```
POST /api/PreviewTasks/123
Content-Type: application/json
Accept: application/json

{
  "result": {
    "imageBase64": "...Base64-encoded image data..."
  }
}
```
 -->
# See also

 * The project is generated by [LoopBack](http://loopback.io) which has its own [LoopBack documentation](http://docs.strongloop.com/display/public/LB/LoopBack)
 * The tests generally follow the approach from https://strongloop.com/strongblog/how-to-test-an-api-with-node-js/,
   but `make test` and `Makefile` have been replaced with `gulp develop` and `gulpfile.js`.
