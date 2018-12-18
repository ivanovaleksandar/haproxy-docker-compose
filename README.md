# About

A sample setup to test [HAProxy][haproxy] configuration with [nodejs][nodejs] applications as backends while logging with [rsyslog][rsyslog] deployed with [docker-compose][compose].

## Getting Started

First we need to build all docker images and start the containers we are going use for this setup.

        # make install

At the end we should see all containers up and running:

                Name                            Command               State           Ports
        --------------------------------------------------------------------------------------------------
        haproxy-docker-compose_app1_1      node index.js                    Up      0.0.0.0:3000->3000/tcp
        haproxy-docker-compose_app2_1      node index.js                    Up      0.0.0.0:3001->3000/tcp
        haproxy-docker-compose_haproxy_1   /docker-entrypoint.sh /bin ...   Up      0.0.0.0:8080->8080/tcp
        haproxy-docker-compose_rsyslog_1   rsyslogd -n -f /etc/rsyslo ...   Up      514/tcp

Now we can test if the haproxy container is redirecting our requests to one of our backend services:

        # make test
        curl -i localhost:8080
        HTTP/1.1 200 OK
        X-Powered-By: Express
        Content-Type: text/html; charset=utf-8
        Content-Length: 45
        ETag: W/"2d-MkIV9HD2MPle5+by/x6XB59zLEs"
        Date: Thu, 13 Dec 2018 15:18:53 GMT

        Response from container 8cdc81db5fe1 | app1

By sending a request to `/off` endpoint, we should force our application to send `500` responses. HAProxy should detect this and subsequently remove that application from the load balancing round-robin mechanism and the only responses should be coming from the other application eg. `app1`. 

        # curl localhost:8080/off
        Container cde3e75d93b0 | app2  is turned OFF

### Logging

HAProxy logs all the requests through rsyslog container. We can dive into the logs more:

        docker logs haproxy-docker-compose_rsyslog_1 -f
        2018-12-14T10:29:50+00:00 haproxy-docker-compose_haproxy_1.haproxy-docker-compose_default haproxy[10]: Proxy http-in started.
        2018-12-14T10:29:50+00:00 haproxy-docker-compose_haproxy_1.haproxy-docker-compose_default haproxy[10]: Proxy servers started.
        2018-12-14T10:29:50+00:00 haproxy-docker-compose_haproxy_1.haproxy-docker-compose_default haproxy[10]: Proxy server1 started.
        2018-12-14T10:29:50+00:00 haproxy-docker-compose_haproxy_1.haproxy-docker-compose_default haproxy[10]: Proxy server2 started.
        2018-12-14T10:29:50+00:00 haproxy-docker-compose_haproxy_1.haproxy-docker-compose_default haproxy[11]: Server servers/s1 is DOWN, reason: Layer4 connection problem, info: "Connection refused", check duration: 0ms. 1 active and 0 backup servers left. 0 sessions active, 0 requeued, 0 remaining in queue.
        2018-12-14T10:29:54+00:00 haproxy-docker-compose_haproxy_1.haproxy-docker-compose_default haproxy[11]: Server servers/s1 is UP, reason: Layer7 check passed, code: 200, info: "OK", check duration: 2ms. 2 active and 0 backup servers online. 0 sessions requeued, 0 total in queue.
        2018-12-14T10:37:18+00:00 haproxy-docker-compose_haproxy_1.haproxy-docker-compose_default haproxy[11]: 192.168.96.1:59914 [14/Dec/2018:10:37:18.186] http-in servers/s2 1/0/0/4/5 200 250 - - --NN 1/1/0/1/0 0/0 "GET / HTTP/1.1"
        2018-12-14T10:37:19+00:00 haproxy-docker-compose_haproxy_1.haproxy-docker-compose_default haproxy[11]: 192.168.96.1:59922 [14/Dec/2018:10:37:19.225] http-in servers/s1 1/0/0/3/4 200 250 - - --NN 1/1/0/1/0 0/0 "GET / HTTP/1.1"
        2018-12-14T10:37:20+00:00 haproxy-docker-compose_haproxy_1.haproxy-docker-compose_default haproxy[11]: 192.168.96.1:59932 [14/Dec/2018:10:37:20.263] http-in servers/s2 0/0/0/2/2 200 250 - - --NN 1/1/0/1/0 0/0 "GET / HTTP/1.1"
        2018-12-14T10:37:33+00:00 haproxy-docker-compose_haproxy_1.haproxy-docker-compose_default haproxy[11]: 192.168.96.1:59986 [14/Dec/2018:10:37:33.400] http-in servers/s1 1/0/0/1/2 200 250 - - --NN 1/1/0/1/0 0/0 "GET / HTTP/1.1"
        2018-12-14T10:37:34+00:00 haproxy-docker-compose_haproxy_1.haproxy-docker-compose_default haproxy[11]: 192.168.96.1:59996 [14/Dec/2018:10:37:34.431] http-in servers/s2 0/0/0/1/1 200 250 - - --NN 1/1/0/1/0 0/0 "GET / HTTP/1.1"
        2018-12-14T10:37:35+00:00 haproxy-docker-compose_haproxy_1.haproxy-docker-compose_default haproxy[11]: 192.168.96.1:60002 [14/Dec/2018:10:37:35.464] http-in servers/s1 0/0/0/1/1 200 250 - - --NN 1/1/0/1/0 0/0 "GET / HTTP/1.1"
        2018-12-14T10:37:36+00:00 haproxy-docker-compose_haproxy_1.haproxy-docker-compose_default haproxy[11]: 192.168.96.1:60012 [14/Dec/2018:10:37:36.501] http-in servers/s2 0/0/0/1/1 200 250 - - --NN 1/1/0/1/0 0/0 "GET / HTTP/1.1"
        2018-12-14T10:37:44+00:00 haproxy-docker-compose_haproxy_1.haproxy-docker-compose_default haproxy[11]: 192.168.96.1:60048 [14/Dec/2018:10:37:44.443] http-in servers/s1 0/0/0/1/1 200 250 - - --NN 1/1/0/1/0 0/0 "GET / HTTP/1.1"

        
As we discussed before, after forcing one of the applications to send 500 responses, HAProxy logs this, saying that `s2` (in this case the name of the `app2` from HAProxy config perspective) is down, so it is removed from the load balancing.

        2018-12-14T10:37:52+00:00 haproxy-docker-compose_haproxy_1.haproxy-docker-compose_default haproxy[11]: Server servers/s2 is DOWN, reason: Layer7 timeout, check duration: 2000ms. 1 active and 0 backup servers left. 1 sessions active, 0 requeued, 0 remaining in queue.
        2018-12-14T10:37:57+00:00 haproxy-docker-compose_haproxy_1.haproxy-docker-compose_default haproxy[11]: 192.168.96.1:60054 [14/Dec/2018:10:37:45.476] http-in servers/s2 0/0/0/-1/12003 504 194 - - sHNN 0/0/0/0/0 0/0 "GET / HTTP/1.1"
        2018-12-14T10:37:58+00:00 haproxy-docker-compose_haproxy_1.haproxy-docker-compose_default haproxy[11]: 192.168.96.1:60106 [14/Dec/2018:10:37:58.515] http-in servers/s1 0/0/0/4/4 200 250 - - --NN 1/1/0/1/0 0/0 "GET / HTTP/1.1"
        2018-12-14T10:37:59+00:00 haproxy-docker-compose_haproxy_1.haproxy-docker-compose_default haproxy[11]: 192.168.96.1:60112 [14/Dec/2018:10:37:59.554] http-in servers/s1 0/0/0/1/1 200 250 - - --NN 1/1/0/1/0 0/0 "GET / HTTP/1.1"
      

[haproxy]: http://www.haproxy.org/
[compose]: https://docs.docker.com/compose/overview/
[nodejs]: https://nodejs.org/en/
[rsyslog]: https://www.rsyslog.com/
