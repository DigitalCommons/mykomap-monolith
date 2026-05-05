# Coolify / Docker deployment

> [!NOTE]
> 
> Dear reader: it is assumed here that you know what "Docker", "Docker
> Compose" and "Dockerfiles" are. If not, see [Writing a Dockerfile][]
> for the basics about Dockerfiles and [What is Docker Compose][] for
> the basic about Docker Compose. These also include links to more
> documentation and references.
>
> Likewise, it is assumed you know what "Coolify" is. If not, the
> Coolify website is [here][Coolify], and an introduction to it is
> [here][What is Coolify].

For deployment via [Coolify][], we needed to "dockerise" Mykomap.

Prior to this Mykomap was designed to be installed in a dedicated
Linux user account, with the public files served by Apache, and the
back-end API reverse-proxied by Apache to a user-mode [SystemD][]
service. This worked fine, but could only handle one deployment per
user account (we had two, one each for the `dev` and `main` branches).
Whereas we found a need to deploy an arbitrary number of feature
branches for QA on pull-requests. Coolify supports this using
"[Preview Deployments][]", was available as a Hetzner application
image, claimed to be a self-hostable, Vercel/Netlify alternative, and
importantly supported backing-up and upgrading itself - so it seemed a
viable application to deploy as we do Cloudron - i.e. without using
infrastructure-as-code tools like Ansible.

In principle Coolify supports un-dockerised deployment of
applications using a tool called "Nixpacks" (that shims them into a
dockerised form). But since an experiment found Nixpacks didn't appear
to be able to infer all the necessary details from the existing
information in the `mykomap-monolith` repository, it seemed expedient
to provide a Docker Compose configuration and do that explicitly.

Therefore, the repository now includes:
- `apps/front-end/Dockerfile`: this defines how to build a container for the front-end
- `apps/back-end/Dockerfile`: ditto, for the back-end application
- `.dockerignore`: a file which tells Docker what *not* to include in images
- `docker-compose.yml`: a Docker Compose configuration which supplies
  the appropriate parameters for the build and defines how to run the
  containers

The dockerised Mykomap application can thus be built and run both from
your repository's working directory, and by Coolify's build system.

The rest of this document describes those files, how to build and run
the dockerised Mykomap application locally, how it can be deployed
using Coolify. Plus some hints and principles for future maintenance.


## Running Docker Compose locally

The docker-compose configuration is intended for deploying the Mykomap
service using Coolify. But you can also be able to use it locally,
which is necessary for maintaining the Coolify deployment. Using it
for Mykomap development is a secondary aim at the moment - most
development to date has been done in the Git working directory, and
this is expected to continue.

### Synopsis

To run the application this way, first ensure the prerequisites are in
place (see the section below), and the required environment variables
are defined correctly (ditto: you will need to create a local `.env`
file).

Then in your console, navigate to the project root folder where the
`docker-compose.yml` file is, then run the following commands to build
and start the containers:

    docker compose up -d --build

The application will be available on the host / port you've set in the
aforementioned `.env` file.

But remember to append a `datasetId=` parameter or you won't see an
data points! For example, if your host is `localhost` and port `8000`:

> http://localhost:8000/?datasetId=dataset-A

To halt it (and any lingering containers) use:

    docker compose down --remove-orphans

> [!INFO]
> 
> If you find docker is failing due to insufficient space after some
> usage, look into using one or all of `docker $entity prune` where
> `$entity` can be one of `volume`, `image` or `system`.)


### Prerequisites

> [!NOTE]
>
> It is assumed you are running on Linux - this may not be required,
> but it has not been tested on other OSes at the time of writing.

First install `docker-compose`, using the method appropriate to your
system's requirements. For that, see the documentation
[here](https://docs.docker.com/compose/).

#### Docker parameters / environment variables

There are a number of mandatory parameters which need to be set for
the application to work correctly. But by design, few if any
environment variable values are included in the compose file: they
must be supplied from elsewhere.  Typically this is because they
depend on your circumstance, and therefore can't reliably be
predicted, and/or are sensitive values which should not be published
along with the code.

When the application is run via Coolify, these values are supplied by
the build environment, and are manually configured in the Coolify
dashboard panel for the application - they cannot be supplied in an
`.env` file, although you may be able to paste the `.env` file
contents using the "developer view". Opt to use Docker secrets if
possible.

But when it is being run locally for development, the simplest way is
to supply an `.env` file containing all the values needed for the
application. Docker Compose loads this file prior to interpreting the
`docker-compose.yml` file - which means unlike `env_file` directives,
they will be available for defining Dockerfile build arguments. (See
[here][Build args from env_files] and [here][Setting build args using
env_file])

As to what to put there, the general principle is: you must supply
values for all of mandatory the build args named in the
`docker-compose.yml` file (those defined with a trailing question
mark).

When maintaining the application, try to make sure any new values are
included here, and any obsolete ones get removed. Ensure that
mandatory values mandatory - omission should be an error. Validate
where possible. And obviously, try to keep it all consistent.
(Apologies for any current inconsistencies!)

Having said that, here is a brief example with sensible defaults in
use at the time of writing. However:

- You will need to check and update these values for your time and situation
- Redacted values need to be obtained from other sources. Details can
  be found elsewhere, for example:
  - in each application workspace (back-end and front-end), within these files:
     - `.env.example` 
     - `Dockerfile` comments
  - comments within the deploy.sh script in the repository root.
- Values used for Docker/Coolify deployments may differ from those used for code development.
- Commented values are used for those that can be useful, but may be omitted.

(In general you can find information by searching the code-base for
the parameter name.)

```
# Defines the version of node to use. Should match the NodeJS value in .tool-version
NODE_VERSION=22.4.1

# CADDY_VERSION=2.11

# Support for development (see comments in ./docker-compose-dev.yml)
COMPOSE_FILE=docker-compose.yml:docker-compose-dev.yml
CADDY_HOSTNAME=localhost

# Map tiles API key
MAPTILER_API_KEY=<redacted>

# Glitchtip tracing
# SENTRY_ORG=digital-commons-coop
# SENTRY_URL=https://app.glitchtip.com
# FE_SENTRY_PROJECT=mykomapfront-end
# FE_GLITCHTIP_KEY=<redacted>
# FE_SENTRY_AUTH_TOKEN=<redacted>
# BE_SENTRY_PROJECT=mykomapback-end
# BE_GLITCHTIP_KEY=<redacted>
# BE_SENTRY_AUTH_TOKEN=<redacted>

# Umami tracing
# UMAMI_ID=70f00aee-ba60-4893-bce2-f90a328f5d94
UMAMI_URL=https://umami.digitalcommons.coop/script.js

# Only ever needed when changing the deployed location
# BASE_URL_PATH=/cwm/
# API_PATH_PREFIX=/cwm/api

```

> [!WARNING]
>
> I've noticed the back-end tracing values (`BE_...`) have not been
> added to the Dockerfile at the time of writing. This is not
> important for development but may be for production deployments.
> See TODOs / sub issues on [#141]

> [!WARNING]
> 
> Beware that environment variables are not secure, so (strictly!) API
> keys shouldn't be passed using them. Saying that, historically they
> have been nevertheless: sometimes circumstances makes this hard to
> avoid.  We should be using secure alternatives like Docker compose
> secrets whenever possible.
> See TODOs / sub issues on
> [#141]

#### Mykomap Datasets

Once your application is installed, it needs at least one dataset to
view. See the following section.

### Installing Mykomap Datasets

Deploying those is currently manual. Automating this is an obvious
next step, some thoughts about that below.

Conceptually, the general process is:

- Obtain the input files
- Convert these into a Mykomap dataset
- Deploy this in the folder that Mykomap is configured to load them from
- Restart the back-end application to make it re-load its data.

However, if you already have a converted dataset - perhaps one in the
`cwm-test-data` repository, you have the option of just downloading it
as-is in the right location.  But because datasets are directory
trees, typically you'd want to download an archive and unpack it. Then
you just need to restart the container afterwards.

You can download an archive from a Github repository using the link at
the bottom of the "Code" drop-down on the project page. Zip isn't
installed by default in the back-end container, so if you don't want
to install it (`apk add zip`), you can instead download a TAR file:
simply amend the `.zip` suffix to `.tar.gz`, which can be unpacked
with `tar xf <file>`.

#### Obtain the input files

These are:
- A CSV with the data you want to display on the map.
- A `config.json` file appropriate for the deployed version of
  Mykomap and the CSV's schema.
- An `about.md` file describing the map (ideally this would be
  included as part of `config.json`)

They need to be accessible via an URL on the web, ideally. This is
most convenient, as they can then just be downloaded using `wget`.

The latter two will get copied into the resulting dataset verbatim.

#### Convert these into a Mykomap dataset

Use the `dataset` CLI application for that which has been built
and installed in the back-end container.

To do that, you need to open a root shell in the back-end container.

When running locally:
- Make sure you're in the directory in which `docker-compose.yml` resides
- Run `docker compose exec -u root back-end sh`

On a Coolify deployment, do this on the server on which the app is
deployed (not the Coolify server itself). But because the Coolify UI's
terminal is always run as the application user (node), you'll need to
open the terminal from a shell on the server itself... within the
directory in which Coolify has installed the application's
docker-compose config.

Typically this directory is `/data/coolify/applications/<application ID>`

Having changed into that directory, you can run the `docker compose
exec` command (as above).

The CLI should be installed in the directory the shell opens in by default (`/app/`)

Run it like this to get usage help:

    node dataset.js import --help

But for it to have anything to work on, first you need to download the
input files.

As root, you can write to the back-end container's filesystem - but it
will not persist when the container restarts, unless you write into
the `/data` directory (on which the `datasets` volume is mounted).

You can use `wget` to download the CSV and the other inputs into the
container.  You can also use `tar`, however if you need `git` or
`zip`, those packages can be installed (temporarily!) with:
 
    apk add git
    apk add zip

Other packages are available, as per the Alpine Linux distribution in use.

When these are present, you can make the conversion. The CLI takes the
`config.json` and the CSV, and will create a dataset folder at the
location you specify. The name of the folder designates the dataset
ID - not the contents.  And a stub `about.md` file will be created -
you will need to overwrite it with yours.
 
Once the dataset folder is complete, move it into `/data/datasets/` on
the back-end container.
  
#### Restart the back-end application

This will make it re-load its data.

Use docker compose to do this:

    docker compose restart back-end

Check this has worked with:

    docker compose logs back-end

The dataset(s) should be listed in the logs.

#### Check it is working externally

Browse to the application, and specify the dataset ID. Locally, this will typically be something like:

    http://localhost/?datasetId=<your ID here>
    
    
Although URL will obviously need to be amended accordingly for the case.

#### Automation of this

It should be fairly straightforward to automate this - the trickier
question is how to select available input files in a convenient
way. There is a repository for Co-op World Map CSVs (these are built
by an action within the `data-pipelines` project and so available as
artifacts for download from there). However, the config.json files or
about.md files don't have a home, except for those committed into the
`cwm-test-data` repository, which I would suggest needs to be retired:
the size of the data alone makes it very unweildy, and the format of
the datasets will be specific to the version of Mykomap being
targetted at the time of deployment. That format is currently not easy
to infer by inspection. 

So my (Nick's) suggestion is that:
- The Mykomap API version should be made explicit in the `config.json` files
- These files should be published somewhere with their `about.md`
  files and any metadata which helps with their use and
  identification.
- A MM deployment should include a list of URLs to input files to download and deploy automatically

Note that when deploying, as the `config.json` assumes certain CSV
schema, not all CSV files will work with it. Our CSVs tend to have
certain preserved fields which can reliably be expected to exist, but
some maps will require supplemental fields, and of course, this will
all inevitably evolve over time.


### Building

The application is built within the relevant docker containers defined
by the relevant `Dockerfile` files, because that is necessary in the
context of Coolify. Coolify will download the source code, and then
run `docker compose build` with the required environment variables
defined. But it seems not to successfully make any bind mounts you
might define for run-time operation. Therefore, everything the
container needs has to be either included in the image itself, via the
Dockerfile, or installed into Docker volume mounts at runtime, by
something which runs inside the container.

> [!NOTE]
>
> The front and back end applications have some duplication of build
> steps, because they both need to build shared code. This seems
> only to be avoidable if we built both applications into one
> container, but that goes against the Docker design principle of
> "one proces per container". Although there are ways around that,
> so it might be possible to implemenet in future iterations. This
> might also mean that Docker Compose is not required - although at
> the time of writing, it's not yet clear if that's (enough of) an
> advantage.



> [!NOTE]
>
> Note that it seems a wise design principle to pass any variables
> needed for the run-time or build-time operation *explicitly* into
> the Dockerfile as ARGs, as opposed to allowing them to be passed
> out of band as environment variables set here or in Coolify.
>
> This helps to avoid errors that can be encountered due to
> variables being unset, or lost due to omissions, Dockerfile
> scoping or other problems. All of which can happen due to various
> factors that aren't always obvious and can result in a running app
> which just doesn't quite work right, whilst being hard to track
> down to boot.
>
> We therefore go to some lengths to ensure these required
> arguments/variables are set by defining them with a trailing
> question mark, making omission an error. Optional variables are also
> included explicitly, for documentation purposes.

# First-time setup of Coolify

Coolify can be self-hosted, or rented from the
[Coolfy cloud SAAS](https://coolify.io/cloud).

We chose to self-host, using the Hetzner 
["Apps" image](https://docs.hetzner.com/cloud/apps/list/coolify/) 
(see that link for more details).

The process for doing this is fairly straightforward, so I won't go
into huge detail.

But just to know what to expect, the steps are:

- Create a new Hetzner Cloud VPS as usual, by going to the list of
  servers, and selecting the "Add server" button. It doesn't need to
  have a high-powered specification, in fact I selected the bottom of
  the range. There's the option of rescaling it later.
- At the bottom of that initial page, before submitting and triggering
  Hetner to provision the host, where you typically choose the OS to
  be installed, select the Coolify app instead.
- On provisioning, the host will come up as normal, except that it
  will be primed to run a deployment script when you first log in.
- This script will ask a few questions, then launch the app and direct
  you to a URL on a non-standard port on the raw IP address of the
  host (which typically won't have a hostname assigned yet).

If you follow this process, you should end up with a running Coolify
server, and admin access, via a temporary URL.  You can use that to
continue to set up the Cooify server.

Prequisites for setting up Coolify futher:
- An API for the DCC Hezner account we deploy to, on
  https://console.hetzner.cloud
- Access to the DCC GitHub organisation account, with "Owner"
  privileges, so that a GH app can be deployed on it. This is at
  https://github.com/DigitalCommons
- Access to the DCC DNS dashboard, on on https://domains.coop

Log-ins are recorded in the DCC Bitwarden account.

Once a server is running, you'll be able to get its IP address from
the dashboard.  You'll need to use this to create some DNS A records
for it (in the steps below.) To start with I created them all with a
short TTL of one minute (60 seconds), to allow for rapid mistake
correction. Later they should all be set to something relatively long
(typically 86400 seconds, i.e. a day).

What I did at that point was:
- Set the hostname to `coolify.digitalcommons.coop`
  - This requires creating the `coolify` A record on the DNS
    dashboard, pointing to to the server's IP address.
  - You may want to update the reverse-IP (PTR) record so that the IP maps
    back to this subdomain - because this is sometimes used as metric
    of DNS good practice. Do that on the Hetzner dashboard for the
    server.
- Created a deployment server called `dev-3.digitalcommons.coop` -
  Coolify needs the Hetzner API to do that, but then it can provision
  it and install Docker Compose, and create a remote control
  connection to it without manual help.
  - This requires creating the `dev-3` A record on the DNS dashboard,
    as above, although with the appropiate IP.
  - To facilitate preview deployments, also create a wildcard A record
    for the subdomain `*.dev-3`, pointing at the same IP address.
  - As above you should probably set the reverse-IP record correctly
    too. 
- Note: later should add another Coolify deployment server which for
  production applications (with the hostnames
  `prod-3.digitalcommons.coop` and `*.prod-3.digitalcommons.coop`)
- Leave the pre-created "localhost" target server as is (we typically won't use it)
- Leave the pre-created "Root Team" team as is.
- Created a project: "Testing" (for experimentation, nothing here of import, can be deleted later)
- Created a project: "DevTeam" (for general DCC use), withing which:
  - Created a resource "production" (for production apps, nothing here yet)
  - Created a resource "development" (for development apps), within which:
    - Created an app
      `mykomap-monolith:containerisation-ai41g710i22dh8vj07qoqel5`,
      using a GitHub app as the source.
      - This required adding a connection to the DCC GitHub account,
        via a GitHub app which Coolify can deploy for the purpose. You
        will need to authorise this, and then make sure it's under the
        remit of the organisation, not your personal account
      - In my experience, this was plain sailing the first time, and
        frustratingly difficult thereafter, for no reason I can
        explain.
      - The app source could then be selected from the
        `containerisation` branch of `mykomap-monolith`
      - Note: It should in future be updated to track the `dev`
        branch, when this work is merged. See TODOs / sub issues on
        [#141]
      - The app name name was generated by Coolify, and although a better
        one might be chosen, it will do for now.
      - The environment variables are set as per instructions
        elsewhere in this document.
      - I also enabled Preview builds (more or less with default
        parameters, and inheriting the same environment as the main
        build).
- Ensured that automatic upgrades were enabled (both of Coolify, and
  the OS underlying it)

Note that the back-up location needs access to S3 storage, which we
don't have at the time of writing. But we should add that and enable
back-ups. See TODOs / sub issues on
[#141]

- Coolify: https://coolify.io/
- What is Coolify: https://coolify.io/docs/get-started/introduction
- SystemD: https://en.wikipedia.org/wiki/Systemd
- Writing a Dockerfile: https://docs.docker.com/get-started/docker-concepts/building-images/writing-a-dockerfile/
- What is Docker Compose: https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-docker-compose/
- Preview Deployments: https://coolify.io/docs/applications/ci-cd/github/preview-deploy
- Build args from env_files: https://github.com/docker/compose/issues/4618
- Setting build args using env_file: https://stackoverflow.com/a/50593180
- #141: https://github.com/DigitalCommons/technology-and-infrastructure/issues/141 

# TODO

Most of these points have been moved to TODOs / sub issues on [#141],
but the following are notes on what will require more thought and
research.

- facilitate better dataset deployment
  - dataset publication (standard.csv files or equivalent)
  - MM config pulication (config.json+about.md or config.yaml files)
  - retire cwm-test-data (instead I suggest publishing the upstream
    input files listed above and consuming those in a deployment
    script to generate the correct format dataset for the deployed
    application)
- taskfile vs Nx? https://taskfile.dev/
  - data-pipelines uses Nx, but perhaps taskfiles are simpler?
  - either way, perhaps we would benefit from more granular
    dependencies on the standard.csv files: currently only one needs
    to change to trigger downloading them all.


# Hints and Suggestions

This is a brain-dump of my (Nick's) thoughts following my post-install
reflections. They could be used as a prompt for questions at handover,
but might otherwise be deleted or integrated elsewhere.

- Dockerfiles need to be reachable in the scope of docker-compose.yml
  (which means docker-compose.yml needs to go in the root directory, not in a subfolder)
- Dockerfiles should do their best to ensure required values are
  supplied (and ideally also valid)
  - prefer `${FOO?}` over `${FOO}`
- Dockerfiles have their own scoping rules which can sabotage you by rendering variables undefined
  - Specifically,
    - `FROM` creates a scope for `ARG`
    - `ENV` has a different scope to `ARG`
    - Nested script blocks have a scope, but the external scope takes precedence
- Dockerfiles should aim to create one process
  - Or if not, must manage their own processes WRT unix signals
  - This would be relevant if we ever decide to host the API server
    and an HTTP server in the same container.
- Coolify is a bit fragile/capricious!
  - Variables can be duplicated, and thence become hard to delete in
    the UI
    - Therefore, avoid that!
  - Preview build variables are common to *all* previews
    - Therefore, seems you can't put PR deployments on sub-paths, as
      that requres environment parameters being set to indicate the
      path to use
  - Coolify's application/project URLs are "quirky", see https://coolify.io/docs/knowledge-base/domains
    - They're not a literal URL
    - For instance, the port component is *not* literal
  - The github app deployment went fine the first time (deployed as wu-lee), utter nightmare subsequently (deployed as digitalcommons-coolify).
    - Coolify needs owner perms to deploy it, apparently
    - Perhaps these can be turned off afterwards?
    - The app needs to be deployed in the organisation, not in the users' "space" (FWOABW)
  - Avoid localhost for deployment for non-evaluation usage
- Test your docker-compose locally for faster turnaround
  - e.g. You can use this to check that variables are being set correctly
- But your docker config needs to work within Coolify's build system
  - Some Coolify magic variables can help
  - But they don't behave consistently with normal variables (the
    assignment is a hint to Coolify, not set literally)
  - Check the docs for more information.
    - https://coolify.io/docs/knowledge-base/environment-variables#magic-environment-variables
    - I tend to agree with criticism here https://news.ycombinator.com/item?id=43594613
- Don't load any local bind mount volumes.
  - You can't bind-mount your source code, except for the build-time execution.
- With Dockerfiles, you can use multiple `FROM` directives to create a
  labelled build image which has more tools and extra data access
  (i.e. the sourcecode)
  - And then create a deploy image which omits these
  - This is how you can get node and the source code into a front-end image that needs them for
    building the deployed JS/HTML files, but ultiately omit them
  - See https://stackoverflow.com/questions/49754286/multiple-images-one-dockerfile
- We need to install `git` during the build
  - This allows the build to inspect tags and and set the version info
- Make sure you use the right version of Node and the right Typescript config (etc.) in the container!
  - Failing to may mean `export.meta` is not available
  - And/or import does not work
  - The code may build but the app will fail at runtime
- When building ESM nodejs bundles using Vite, you may need to work
  around a bug which results in calls to `require`
  - I've added a workaround to avoid 'Error: Dynamic require of "os"
    is not supported'.
  - (Find the commit by searching for that message)
  - Adapted from: https://github.com/evanw/esbuild/issues/1921#issuecomment-3453406735
  - This uses the trick of defining a global `require` function
  - (instead of adding a header which defines it to each module, as in
    the linked issue above)
- Coolify attempts to infer your docker-compose listening port from
  the `ports` directive of the services
  - But this also means it may expose internal services!
  - And it puts all your containers on an external-facing network it creates!
  - So in general don't: just assume that containers can see each other on this external network
  - To avoid exposing internal services you must explicitly bind them on localhost
  - and/or use a firewall on the host
  - then tell Coolify which ports to proxy using the configured
    application URL (which abuses the port for that, as mentioned
    above)
  - For local development, you then need to override the exposed ports
    - I've done this in a `docker-compose-dev.yml` file, which is
      loaded as an override by defining `COMPOSE_FILE=docker-compose.yml:docker-compose-dev.yml`
- Coolify rewrites your docker-compose file!
  - Find its rewritten version on the deployment server (`dev-3` in this
    case) at `/data/coolify/applications/<application ID>/` (the ID
    for the development deployment of Mykomap is
    `ai41g710i22dh8vj07qoqel5`)
- I am not convinced that Coolify's build time vs runtime checkboxes
  for variables/parameters work as expected
  - My variables needed at built-time only don't get set unless set to be available at runtime
Your front-end container will need to know its own hostname
  - And this needs to be supplied at build time (or maybe runtime)
    from Coolify
    
## Troubleshooting tips

- Some tools are frequently pre-installed in the base Docker image
  - `curl` and `wget` are useful for downloading data via HTTP/FTP
  - `netstat -plant` is very useful to check what processes are listening on
    which port
  - `nmap` is  essential for checking what ports are visible on other
    containers
  - `ip link`, `ip a`, `ip route` etc. are useful for checking network
    device names, addresses, and routes 
- You can install tools which are not pre-installed into a container
  using `apk` (assuming they're based on Alpine Linux, else it'll be
  another package manager)
  - e.g. `apk add nmap`
  - they don't persist after a re-build
- you can `docker exec` into your compose containers to inspect them
  - This gains terminal access to the containers
  - It's an alternative to using the Coolify dashboard (which has a
    pretty shonky terminal with peculiar wrapping, and always logs you
    in as the app's user, in our case `node`)
  - For example:
    - `cd /data/coolify/applications/ai41g710i22dh8vj07qoqel5`
      (substitute your application ID as required)
    - `docker compose exec back-end` (substitute your
      container name as required)
    - `docker compose exec back-end -u root` gets you in as the root
      user, and therefore with write access to the whole container
      filesystem and more.
