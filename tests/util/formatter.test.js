import * as formatterUtil from '../../util/formatter'

test('it should remove spaces of processed chat message', () => {
  const message = { text: 'Title: desc ; 2;three ' }
  expect(formatterUtil.processMessage(message)).toEqual(
    [
      "Title: desc",
      "2",
      "three"
    ]
  )
})

test('it should process chat message into separate task items', () => {
  const message = { text: '1;2;3' }
  expect(formatterUtil.processMessage(message)).toEqual(["1","2","3"])
})

test('it should generate list with checkboxes', () => {
  const list = [
    {achieved: false, name: '1'},
    {achieved: false, name: '2'},
    {achieved: false, name: '3'}
  ]
  expect(formatterUtil.generateList(list)).toEqual(["[ ] 1\n","[ ] 2\n","[ ] 3\n"])
})

test('it should format list to chat message', () => {
  const list = ["[ ] 1\n","[ ] 2\n","[ ] 3\n"]
  expect(formatterUtil.formatListToSlackText(list)).toEqual("[ ] 1\n[ ] 2\n[ ] 3\n")
})

test('it should format chat message to quoted text', () => {
  const text = "[ ] 1\n[ ] 2\n[ ] 3\n"
  expect(formatterUtil.formatJournalListText(text)).toEqual("```Today\'s todos:\n\n[ ] 1\n[ ] 2\n[ ] 3\n```")
})
