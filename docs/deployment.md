# Deploying

Conceptually, installation of these applications require:
- deploying the front-end as content to be served on the web
  - configure it to use the correct path for the back end (typically `/api`)
  - also configure API keys for GlitchTip and MapTiler services
- deploying the back end to be run as a persistent node process
  - configure it to use the right path to the data folder
- deploy the data in the path expected by the back-end
- reverse-proxying the back end to be accessible on the same domain as the front end

## Deploying on a DCC server, manually

DCC deployment uses a Linux server running Apache, an appropriate
installation of NodeJS, with SystemD that supports user-mode
services. A dedicated user is used to deploy the application, and this
is exposed to Apache via configuration.

This situation currently set up via some Ansible playbooks in the DCC
`technology-and-infrastructure` project. The instructions following
assume this context.

For the descriptions below, we make the following assumptions for generality:

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

Likewise, an example of the contents of the file `$DEPLOY_ENV`, but
with actual secret values redacted:

    export USERDIR=/home/$USER
    export DEPLOY_DEST=$USERDIR/deploy
    export PROXY_PORT=1$UID
    export PROXY_PATH=/api
    export DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$UID/bus
    export GLITCHTIP_KEY=*REDACTED*
    export MAPTILER_API_KEY=*REDACTED*

*Note: paths here should be absolute - relative paths will not work in
general.*

*Note, the environment variables `USER` and `UID` should already be
set by your shell by default.  `DBUS_SESSION_BUS_ADDRESS` should also
be set in principle be if you are logged in as that user - but in
practise is not. This is needed for the deploy script to run
`systemctl` in user-mode.*
   

### Install

All these steps assume that `$DEPLOY_ENV` has been created and
populated appropriately, as per the example above.

#### With elevated privileges

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
   user group or global access; perhaps by `chmod ~$USER a+x`.)

The steps:

    # source this file to get the shared configuration
    . $DEPLOY_ENV
    
    # Link the content to serve into place
    ln -sfn $APP_ROOT $GIT_WORKING/app/front-end/dist/

    # Configure reverse proxying, and symlink following.
    cat >$VHOST_CONF <<EOF
    <Directory $WWW_ROOT/..>
      Options FollowSymLinks Indexes
    </Directory>
    ProxyPass /api http://localhost:$PROXY_PORT
    ProxyPassReverse /api http://localhost:$PROXY_PORT
    EOF
    
    systemctl reload apache2
    
    loginctl enable-linger $USER # Ensure the users DBUS session starts on boot

#### As the application user

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

### Update

The update process goes like this, and should be done as the application user:

    ssh $SERVER      # log-in as root
    su - $USER       # change to the target user
    
    cd $GIT_WORKING  # change to the deployed directory
    . $DEPLOY_ENV    # set the configuration
    git pull         # typically you will need to update the source files in some way
    ./deploy.sh      # run the deploy script

The `deploy.sh` script will do the rest, including writing the `.env`
files in the applications, which should never be stored in source control.

