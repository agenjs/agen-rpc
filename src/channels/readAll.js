export default async function readAll(it) {
  for await (let _ of it) { // eslint-disable-line no-unused-vars
    /* Do nothing */
    // console.log('- ', _)
  } 
}