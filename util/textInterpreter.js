export const lookForCompletedTask = (text) => {
  const re = /\[\s(.*?)\s\]/i;
  let potentialTask = null
  if (text.search(re) != -1) {
    let title = text.match(re)
    potentialTask = title[1]
  }

  return potentialTask
}
