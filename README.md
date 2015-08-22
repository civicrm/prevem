# Prevem: Open source preview manager for emails

Prevem is a batch manager for email previews. It provides a RESTful CRUD API
which works with two agents:

 * *Composer* - The mail user-agent (MUA) in which a user prepares a mailing.
   Generally, the Composer submits a `PreviewBatch` and polls to track its progress.
 * *Renderer* - The backend service which prepares a screenshot of how an email would
   appear when read in different MUAs. Generally, a Renderer polls for a pending
   `PreviewTask` record, prepares a screenshot, and then marks it as completed.

All three components (prevem, the composer, and the renderer) have been/are being developed as a part of a project called Email Preview Cluster which is meant to help users (of CiviCRM) to generate previews (screenshots) of their emails to see what they'll look like to receivers on various email clients.

# Getting Started

### 1. Setup the Preview Manager (prevem)

  The *preview manager* (`prevem`) is based on [Loopback](http://loopback.io/), an open-source framework for creating RESTful APIs in NodeJS. It stores the list of pending jobs as well as the resulting image files. To set up `prevem` on your machine, follow these steps:

  ```bash
  $ git clone https://github.com/civicrm/prevem
  ...
  $ cd prevem
  $ npm install
  ...
  $ node .
  Browse your REST API at http://0.0.0.0:3000/explorer
  Web server listening at: http://0.0.0.0:3000/
  ```

### 2. Setup the Webmail Renderer

  The [Webmail Renderer](www.github.com/utkarshsharma/webmail-renderer.git) is a Node.js application which periodically polls `prevem` to claim a pending preview task, prepare a screenshot, and upload the final image. Currently, there are two webmail renderers (Gmail and YahooMail). The renderer depends on [Selenium Server](http://www.seleniumhq.org/) for browser automation.

  The webmail-renderer is automatically downloaded by `npm install`, but you must configure and start it:
  
  ```bash
  $ cd node_modules/webmail-renderer
  ## If you don't already have Selenium Standalone Server installed on your machine, run the following 2 commands.
  ## You can skip them otherwise.
  $ npm install selenium-standalone@latest -g
  $ selenium-standalone install
  
  ## Create a config file
  $ cp config.json.template config.json
  $ vi config.json   (<== Put in gmail and yahoo credentials==>)
  ## The sender credentials should be of a gmail account with reduced security, i.e., "Allow Less Secure Apps" should be ON.
  ## You don't need to change the prevemURL and prevemCredentials fields.
  ## These entries match the default Prevem URL and the credentials that the renderers use to login to the Prevem.
  
  ## Run the renderers
  $ nodejs gmail.js
  $ nodejs yahoo.js ##In a new Terminal tab
  ##These nodejs scripts will keep running in the background and render any tasks pitched up to them.
  ```

### 3. Setup CiviCRM

  * Pull [this](https://github.com/utkarshsharma/civicrm-core) branch of civicrm-core to your machine.
  * Now in your CiviCRM, navigate to `Administer > CiviMail > CiviMail Component Settings`.
  * Set your `Prevem URL` from there.
  * Alternatively, you can use the CLI to configure the `prevem_url`:
  
  ```bash
  $ drush cvapi setting.create prevem_url="http://consumerId:consumerPass@localhost:3000"
  ```
  
  The prevemURL is to be written in the said format. Here's what those terms in it's definition mean.
  
  `consumerId`
  Your consumer ID on the Prevem. Every preview batch you request would be carrying this Id to distinguish your preview batches from the others. This will also be used to login to the Prevem.
  
  `consumerPass`
  Your secret password which will be used to login to the Prevem.
  
  `localhost:3000`
  Change this if you are hosting your Prevem somewhere other than localhost:3000

### 4. Create a prevem user account

  Start your prevem, by doing `node .` as given in section 1 of the setup.
  Go to `prevem_url`/explorer/#!/Users/create (e.g. http://0.0.0.0:3000/explorer/#!/Users/create). You'll find your REST APIs there. In POST Users/ section, inside the data input box enter your details in the following format and then click on the `Try it Out` box.
  
  ```
  {
    "email":"consumerId@foo.com",
    "password":"consumerPass"
  }
  ```
  
  That completes your setup. You are now ready to use your Email Preview Cluster Service.
  You can simply go to your CiviCRM mailing page and request previews.

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

 * The [midterm](https://civicrm.org/blogs/utkarshsharma/email-preview-cluster-midterm-blogpost) and [endterm](https://civicrm.org/blogs/utkarshsharma/email-preview-cluster-gsoc-completion-blog) blog posts regarding this GSoC project talk about it in more detail.
 * The project is generated by [LoopBack](http://loopback.io) which has its own [LoopBack documentation](http://docs.strongloop.com/display/public/LB/LoopBack)
 * The tests generally follow the approach from https://strongloop.com/strongblog/how-to-test-an-api-with-node-js/,
   but `make test` and `Makefile` have been replaced with `gulp develop` and `gulpfile.js`.
