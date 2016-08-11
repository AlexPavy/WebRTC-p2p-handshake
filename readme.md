Solution inspired from :
[a-dead-simple-webrtc-example](https://shanetully.com/2014/09/a-dead-simple-webrtc-example/)

Creating a messaging server

According to the WebRTC specification, peers need to exchange messages before being 
able to connect to each other. However, the implementation of the signaling exchange is 
unspecified [1].

The purpose of the exercise is to implement such a service:

● if A sends a message M to B and B is known by the service, the service should 
deliver M to B

● the client should be implementable in a web browser

● The implementation technology is open: any language or middleware (databases, 
messaging system...) can be used. However, if a third-party system is used, the 
implementation must include a standalone version.