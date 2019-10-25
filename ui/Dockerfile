
FROM node:10 as builder
RUN npm install -g pug pug-cli jstransformer-markdown-it
COPY ./pug /opt/build/pug/
# TODO: optional base url
RUN pug /opt/build/pug/pages -O "{base_url: ''}" --out /opt/build/html


FROM alpine:3.8
RUN apk add nginx
COPY js /opt/www/js
COPY css /opt/www/css
COPY --from=builder /opt/build/html /opt/www/html
# Install nginx configuration
RUN rm -r /etc/nginx/conf.d/*
COPY nginx/arrp.conf /etc/nginx/conf.d/arrp.conf
#RUN mkdir -p /etc/nginx/sites-enabled && ln -s /etc/nginx/sites-available/arrp /etc/nginx/sites-enabled/arrp
RUN mkdir /run/nginx

CMD nginx -g "daemon off;"
