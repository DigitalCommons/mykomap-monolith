# Deploying

Conceptually, installation of these applications require:

- deploying the front-end as content to be served on the web
  - configure it to use the correct path for the back end (typically `/api`)
  - also configure API keys for GlitchTip and MapTiler services
- deploying the back end to be run as a persistent node process
  - configure it to use the right path to the data folder
- deploy the data in the path expected by the back-end
- reverse-proxying the back end to be accessible on the same domain as the front end

This document describes the required steps to achieve the above, either for a first
time install or an update.

## DCC Server specifics

_Note: Although the application could be deployed in various scenarios in
principle, this is the only case we specifically cater for now._

### What a DCC Server provides

The parts relevant here are, broadly:

- A Ubuntu Linux server.
- With the Apache webserver.
- The NodeJS runtime (using [ASDF][asdf], the version of NodeJS can be
  specified in the app with [`.tool-versions`][asdf-config])
- User-mode SystemD services.
- A dedicated user for the application.

[asdf]: https://asdf-vm.com/
[asdf-config]: https://asdf-vm.com/manage/configuration.html

Without going into too much detail, this situation is currently set up
via some Ansible playbooks in the DCC
[technology-and-infrastructure][t-i] project.

The following instructions following assume this context.

[t-i]: https://github.com/DigitalCommons/technology-and-infrastructure

### Definitions, for convenience

For the descriptions below, we use the following placeholders for
generality. (We write them in the style of environment variables, but
you can equally see them as just labels.)

- `$SERVER` is the ssh URI used for the hostname being deployed to.
- `$USER` is the user being deployed to on that host.
- `$GIT_WORKING` is the directory where `mykomap-monolith` repository
  is checked out (or if not checked out, unpacked - in which case
  replace `git clone` or `git pull` with an appropriate unpacking
  process)
- `$DATA_DIR` is the path to the directory containing data for the back-end.
- A file exists at `$DEPLOY_ENV` defining the environment variables
  specifically needed for deployment.

Examples, at the time of writing, of the typical case for these are:

    SERVER=dev-2
    USER=broccoli
    GIT_WORKING=/home/$USER/gitworking/mykomap-monolith
    DEPLOY_ENV=/home/$USER/gitworking/deploy.env
    DATA_DIR=/home/$USER/deploy/data

## How to install for the first time

### Step 1: set environment variables (as the application user)

The `$DEPLOY_ENV` file defines some _actual_ environment variables
which the deployment process will use. What those are set to will
depend on your situation, so this is just a guide.

Here is an example of how the `$DEPLOY_ENV` file may be created as the
application user, but with secret values redacted:

    cat > $DEPLOY_ENV <<EOF
    export USERDIR=/home/$USER
    export GIT_WORKING=/home/$USER/gitworking/mykomap-monolith
    export DEPLOY_DEST=/home/$USER/deploy
    export DATA_DIR=/home/$USER/deploy/data
    export WWW_ROOT=/var/www/vhosts/maps.coop/www
    export APP_ROOT=/var/www/vhosts/maps.coop/www/cwm
    export VHOST_CONF=/var/www/vhosts/maps.coop/custom.conf
    export PROXY_PORT=1$UID
    export PROXY_PATH=/api
    export DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$UID/bus
    export FE_GLITCHTIP_KEY=*REDACTED*
    export BE_GLITCHTIP_KEY=*REDACTED*
    export MAPTILER_API_KEY=*REDACTED*
    EOF

This will hardcode the variables in the file according to the app
`$USER` and `$UID`, which should already be set by your shell by default.
The hardcoding is necessary for Step 3, when we load these environment
variables as a different user.

_Note: paths here should be absolute - relative paths will not work in
general._

_Note: `DBUS_SESSION_BUS_ADDRESS` should be set in principle be if you
are logged in as that user - but in practise is not. This is needed for
the deploy script to run `systemctl` in user-mode._

_Note: These variables don't strictly have to be defined in a file,
it's just convenient for this illustration. You could supply them via
other mechanisms._

### Step 2: setup Apache config (with elevated privileges)

This step requires elevated privileges, but as it is specific to this
application it is not performed via Ansible.

It assumes that:

- The root directory of the virtual host is at `$WWW_ROOT`
- A symlink can be created at `$APP_ROOT` to the directory that
  Apache should serve the application content from.
- A file `$VHOST_CONF` can be created which contains the Apache
  configuration in the context of the application's Virtual host.
- The user `$USER` exists already, and its home directory is
  accessible to the Apache user. (Typically this means that `~$USER`
  home directory has the "execute" flag set allowing the `www-data`
  user group or global access; perhaps by `chmod a+x ~$USER`.)
- The user has had linger mode enabled (`loginctl enable-linger
$USER`) to ensure that its DBUS session starts on boot, for use by
  user-mode systemd services.

The steps:

    # source this file to get the shared configuration
    . $DEPLOY_ENV

    # Link the content to serve into place
    ln -sfn $GIT_WORKING/apps/front-end/dist/ $APP_ROOT

    # Configure reverse proxying, and symlink following.
    cat > $VHOST_CONF <<EOF
    <Directory $WWW_ROOT/..>
      Options FollowSymLinks Indexes
    </Directory>
    ProxyPass /api http://localhost:$PROXY_PORT
    ProxyPassReverse /api http://localhost:$PROXY_PORT
    EOF

    systemctl reload apache2

### Step 3: install the app (as the application user)

It assumes that:

- The public SSH key of `$USER` has been added as a deploy key for
  the [`cwm-test-data`](https://github.com/DigitalCommons/cwm-test-data/settings/keys)
  private repository.
- This key is used when connecting to github.com. We recommend configuring this in the
  user's `~/.ssh/config` file, since you will may need fetch updates to the data on a regular
  basis.

The steps:

    # source this file to get the shared configuration
    . $DEPLOY_ENV

    # Create and populate the data directory (an example - the details may vary)
    # Amounts to a git clone --depth=1 git@github.com:DigitalCommons/cwm-test-data
    # Except it works when $GIT_WORKING exists already.
    mkdir -p $DATA_DIR
    cd $DATA_DIR
    git init
    git remote add origin git@github.com:DigitalCommons/cwm-test-data.git
    git fetch --depth=1 # --depth optional
    git checkout main

    # Create and deploy the application source code
    mkdir -p $GIT_WORKING

    cd $GIT_WORKING
    git init
    git remote add origin git@github.com:DigitalCommons/mykomap-monolith
    git fetch --depth=1 # --depth optional
    git checkout main


    ./deploy.sh

The `deploy.sh` script will do the rest, including writing the `.env`
files in the applications, which should never be stored in source control.

## How to make subsequent updates

After the initial install, deploying updates is simpler.

_Note: we assume `$DEPLOY_ENV` defines our environment, as before._

Log in as the application user:

    ssh $SERVER      # log-in as root
    su - $USER       # change to the target user

Then perform the update:

    cd $GIT_WORKING  # change to the deployed directory
    . $DEPLOY_ENV    # set the configuration
    git pull         # typically you will need to update the source files in some way
    ./deploy.sh      # run the deploy script

The `deploy.sh` script will do the rest, including writing the `.env`
files in the applications, which should never be stored in source control.
