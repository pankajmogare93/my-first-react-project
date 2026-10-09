#!/bin/sh
set -eu

if [ -n "${DB_HOST:-}" ]; then
  export SPRING_DATASOURCE_URL="jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}"
  export SPRING_DATASOURCE_DRIVER_CLASS_NAME="org.postgresql.Driver"
fi

exec java -XX:MaxRAMPercentage=75.0 -jar /app/app.jar