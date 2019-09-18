FROM node:10.16-stretch
LABEL maintainer="Johnlee"
ENV REFRESHED_AT 2019-08-01

RUN apt-get update && apt-get install -y squid apache2-utils
RUN sed -i 's/http_access deny all/#http_access deny all/g' /etc/squid/squid.conf \
    && sed -i 's/#cache_dir ufs \/var\/spool\/squid 100 16 256/cache_dir ufs \/var\/spool\/squid 200 16 256/g' /etc/squid/squid.conf \
    && sed -i 's/# cache_swap_low 90/cache_swap_low 90/g' /etc/squid/squid.conf \
    && sed -i 's/# cache_swap_high 95/cache_swap_high 95/g' /etc/squid/squid.conf \
    && sed -i 's/# cache_mem 256 MB/cache_mem 256 MB/g' /etc/squid/squid.conf \
    && sed -i 's/http_port 3128/http_port 3010/g' /etc/squid/squid.conf \
    && sed -i 's/# logfile_rotate 0/logfile_rotate 2/g' /etc/squid/squid.conf \
    && echo 'auth_param basic program /usr/lib/squid/basic_ncsa_auth /etc/squid/passwd'>>/etc/squid/squid.conf \
    && echo 'acl auth_user proxy_auth REQUIRED'>>/etc/squid/squid.conf \
    && echo 'http_access allow auth_user'>>/etc/squid/squid.conf \
    && echo 'http_access deny all'>>/etc/squid/squid.conf \
    && cp /etc/squid/squid.conf /etc/squid/squid.conf.tpl \
    && htpasswd -bc /etc/squid/passwd johnlee fdas1234sDFthjbytert54y364DSf234d23d890B

COPY . /proxy-forword
WORKDIR /proxy-forword
RUN npm config set registry http://registry.npm.taobao.org \
    && npm i -g pm2

EXPOSE 3009 3010