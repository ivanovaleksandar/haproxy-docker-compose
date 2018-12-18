FROM haproxy:1.6.9-alpine

# RUN apk add dig
RUN cd /etc/apk/keys && \
  wget http://alpine.adiscon.com/rsyslog@lists.adiscon.com-5a55e598.rsa.pub && \
  echo 'http://alpine.adiscon.com/3.7/stable' >> /etc/apk/repositories && \
  apk update && \
  apk add rsyslog

# ADD rsyslog.conf /etc/rsyslog.conf
COPY ./haproxy.cfg /usr/local/etc/haproxy/haproxy.cfg
