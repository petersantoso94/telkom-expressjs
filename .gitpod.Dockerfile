FROM gitpod/workspace-full

# Install postgres & Redis
RUN sudo apt-get update && sudo apt-get install -y \
        postgresql \
        postgresql-contrib \
    && sudo apt-get clean && sudo rm -rf /var/cache/apt/* && sudo rm -rf /var/lib/apt/lists/* && sudo rm -rf /tmp/*

# Setup postgres server for user gitpod
ENV PATH="$PATH:/usr/lib/postgresql/12/bin"
ENV PGDATA="/workspace/.pgsql/data"
RUN mkdir -p ~/.pg_ctl/bin ~/.pg_ctl/sockets \
 && printf '#!/bin/bash\n[ ! -d $PGDATA ] && mkdir -p $PGDATA && initdb -D $PGDATA\npg_ctl -D $PGDATA -l ~/.pg_ctl/log -o "-k ~/.pg_ctl/sockets" start\n' > ~/.pg_ctl/bin/pg_start \
 && printf '#!/bin/bash\npg_ctl -D $PGDATA -l ~/.pg_ctl/log -o "-k ~/.pg_ctl/sockets" stop\n' > ~/.pg_ctl/bin/pg_stop \
 && chmod +x ~/.pg_ctl/bin/*

# Add required env
ENV PATH="$PATH:$HOME/.pg_ctl/bin"
ENV PGHOSTADDR="127.0.0.1"
ENV PGDATABASE="db"
ENV DATABASE_URL="postgres://postgres@localhost:5432/db"
ENV NODE_ENV="development"
ENV PORT="3000"
