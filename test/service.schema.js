export default `
// See here: https://github.com/grpc/grpc-web/blob/0.4.0/net/grpc/gateway/examples/echo/echo.proto

syntax = "proto3";

package test;

message Hello {
  message Request { string name = 1; }
  message Response { string greeting = 1; }
}

message GenerateMessage {
  message Request { int32 count = 1; }
  message Response { int32 idx = 1; string message = 2; }
}

message PingPong {
  message Request { int32 id = 1; string message = 2; }
  message Response { int32 id = 1; string message = 2; }
}

// A simple echo service.
service EchoService {

  rpc SayHello(Hello.Request) returns (Hello.Response);

  rpc GenerateMessages(GenerateMessage.Request) returns (stream GenerateMessage.Response);

  rpc PingPong(stream PingPong.Request) returns (stream PingPong.Response);

}

`