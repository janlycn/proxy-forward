#!/bin/bash
tsc && npm start
rm -rf /var/run/squid.pid
squid -z && squid -N -d1
docker rmi $(docker images | grep "none" | awk '{print $3}')
