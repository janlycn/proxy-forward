#!/bin/bash
npm install --production
npm start
rm -rf /var/run/squid.pid
squid -z && squid -N -d1
