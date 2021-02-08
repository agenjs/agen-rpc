export default ({

  // This method accepts just one parameter and returns a single response object.
  async sayHello({ name }) {
    return { greeting: `Hello, ${name}` };
  },

  async* generateMessages({ count = 0 }) {
    for (let i = 0; i < count; i++) {
      yield { idx: i, message: `Ping ${i}` };
    }
  },

  // This method accepts a "stream" of requests and it respones for each recieved message
  async* pingPong(requests) {
    for await (let req of requests) {
      const { id, message } = req;
      yield { ...req, id, message: `Pong for ${message}` };
    }
  }
})
