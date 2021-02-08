export default function newCallsAdapter(getRequest, getResponse) {
  return (method) => {
    const callMethod = async (value) => method(await value);
    return (value) => getResponse(callMethod(getRequest(value)));
  };
}
