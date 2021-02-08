// Main methods providing client/server stubs
export { default as newServerStub } from './newServerStub.js';
export { default as newClientStub } from './newClientStub.js';
export { default as newJsonSerd } from './newJsonSerd.js';

// Returns individual method adapters to call functionality on the client or on the server
export { default as newServerMethodProvider } from './newServerMethodProvider.js';
export { default as newClientMethodProvider } from './newClientMethodProvider.js';


// Utility methods    
export { default as getJsServiceMethodName } from './getJsServiceMethodName.js';
export { default as getServiceMethod } from './getServiceMethod.js';
