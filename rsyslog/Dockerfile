FROM alpine:3.3
RUN apk add --no-cache rsyslog
COPY ./rsyslogd.conf /etc/
EXPOSE 514
ENTRYPOINT ["rsyslogd", "-n", "-f", "/etc/rsyslogd.conf"]
