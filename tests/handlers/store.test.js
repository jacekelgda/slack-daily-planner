jest.mock('firebase')

import * as storeHandler from '../../handlers/store'

test('it should fetch list metadata by user id and list id', async () => {
  const data = await storeHandler.getListMetadata(1, 1)
  expect(data).toEqual({ts: '123', channel: 'abc123'})
})
