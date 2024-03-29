import { subscriber, nonSubscriber } from './guards'

const callback = vi.fn()

beforeEach(() => vi.restoreAllMocks())

describe('nonSubscriber()', () => {
  test('when no session, calls callback', async () => {
    const handler = nonSubscriber(callback)
    const event = {
      locals: {
        async getSession() {
          return null
        }
      }
    }

    await handler(event)

    expect(callback).toHaveBeenCalledWith(event)
  })

  test('when no subscription, calls callback', async () => {
    const handler = nonSubscriber(callback)
    const event = {
      locals: {
        async getSession() {
          return {}
        }
      }
    }

    await handler(event)

    expect(callback).toHaveBeenCalledWith(event)
  })

  test('when user has a subscription, returns error', async () => {
    const handler = nonSubscriber(callback)
    const event = {
      locals: {
        async getSession() {
          return { subscription: {} }
        }
      }
    }

    const response = handler(event)

    await expect(response).toError(403, 'Forbidden')

    expect(callback).not.toHaveBeenCalled()
  })
})

describe('subscriber()', () => {
  test('when subscription, calls callback', async () => {
    const handler = subscriber(callback)
    const session = {
      subscription: {}
    }
    const event = {
      locals: {
        async getSession() {
          return session
        }
      }
    }

    await handler(event)

    expect(callback).toHaveBeenCalledWith(event)
  })

  test('when no subscription, raises error', async () => {
    const handler = subscriber(callback)
    const event = {
      locals: {
        async getSession() {
          return {}
        }
      }
    }

    const response = handler(event)

    await expect(response).toError(403, 'Forbidden')

    expect(callback).not.toHaveBeenCalled()
  })
})

describe('subscriber.active()', () => {
  test('when subscription is active, calls callback', async () => {
    const event = mockEvent({ status: 'active' })
    const handler = subscriber.active(callback)

    await handler(event)

    expect(callback).toHaveBeenCalledWith(event)
  })

  test('when subscription is not active, raises error', async () => {
    const event = mockEvent({ status: 'canceled' })
    const handler = subscriber.active(callback)

    const response = handler(event)

    await expect(response).toError(403, 'Forbidden')

    expect(callback).not.toHaveBeenCalled()
  })
})

describe('subscriber.pastDue()', () => {
  test('when subscription is past_due, calls callback', async () => {
    const event = mockEvent({ status: 'past_due' })
    const handler = subscriber.pastDue(callback)

    await handler(event)

    expect(callback).toHaveBeenCalledWith(event)
  })

  test('when subscription is not past_due, raises error', async () => {
    const event = mockEvent({ status: 'canceled' })
    const handler = subscriber.pastDue(callback)

    const response = handler(event)

    await expect(response).toError(403, 'Forbidden')

    expect(callback).not.toHaveBeenCalled()
  })
})

describe('subscriber.unpaid()', () => {
  test('when subscription is unpaid, calls callback', async () => {
    const event = mockEvent({ status: 'unpaid' })
    const handler = subscriber.unpaid(callback)

    await handler(event)

    expect(callback).toHaveBeenCalledWith(event)
  })

  test('when subscription is not unpaid, raises error', async () => {
    const event = mockEvent({ status: 'canceled' })
    const handler = subscriber.unpaid(callback)

    const response = handler(event)

    await expect(response).toError(403, 'Forbidden')

    expect(callback).not.toHaveBeenCalled()
  })
})

describe('subscriber.canceled()', () => {
  test('when subscription is canceled, calls callback', async () => {
    const event = mockEvent({ status: 'canceled' })
    const handler = subscriber.canceled(callback)

    await handler(event)

    expect(callback).toHaveBeenCalledWith(event)
  })

  test('when subscription is not canceled, raises error', async () => {
    const event = mockEvent({ status: 'active' })
    const handler = subscriber.canceled(callback)

    const response = handler(event)

    await expect(response).toError(403, 'Forbidden')

    expect(callback).not.toHaveBeenCalled()
  })
})

describe('subscriber.trialing()', () => {
  test('when subscription is trialing, calls callback', async () => {
    const event = mockEvent({ status: 'trialing' })
    const handler = subscriber.trialing(callback)

    await handler(event)

    expect(callback).toHaveBeenCalledWith(event)
  })

  test('when subscription is not trialing, raises error', async () => {
    const event = mockEvent({ status: 'canceled' })
    const handler = subscriber.trialing(callback)

    const response = handler(event)

    await expect(response).toError(403, 'Forbidden')

    expect(callback).not.toHaveBeenCalled()
  })
})

describe('subscriber.plan()', () => {
  const plan = {
    id: 'pro'
  }

  test('when subscription plan matches, calls callback', async () => {
    const event = mockEvent({ status: 'active', plan })
    const handler = subscriber.plan('pro', callback)

    await handler(event)

    expect(callback).toHaveBeenCalledWith(event)
  })

  test('when subscription plan doesnt match, calls callback', async () => {
    const event = mockEvent({ status: 'active', plan })
    const handler = subscriber.plan('basic', callback)

    const response = handler(event)

    await expect(response).toError(403, 'Forbidden')

    expect(callback).not.toHaveBeenCalled()
  })

  test('when subscription is canceled, raises error', async () => {
    const event = mockEvent({ status: 'canceled', plan })
    const handler = subscriber.plan('pro', callback)

    const response = handler(event)

    await expect(response).toError(403, 'Forbidden')

    expect(callback).not.toHaveBeenCalled()
  })
})

describe('subscriber.plans()', () => {
  const plan = {
    id: 'pro'
  }

  test('when subscription plan matches, calls callback', async () => {
    const event = mockEvent({ status: 'active', plan })
    const handler = subscriber.plans(['basic', 'pro'], callback)

    await handler(event)

    expect(callback).toHaveBeenCalledWith(event)
  })

  test('when subscription plan doesnt match, calls callback', async () => {
    const event = mockEvent({ status: 'active', plan })
    const handler = subscriber.plans(['basic'], callback)

    const response = handler(event)

    await expect(response).toError(403, 'Forbidden')

    expect(callback).not.toHaveBeenCalled()
  })

  test('when subscription is canceled, raises error', async () => {
    const event = mockEvent({ status: 'canceled', plan })
    const handler = subscriber.plan(['pro'], callback)

    const response = handler(event)

    await expect(response).toError(403, 'Forbidden')

    expect(callback).not.toHaveBeenCalled()
  })
})

function mockEvent(subscription = null) {
  const session = { subscription }

  return {
    locals: {
      async getSession() {
        return session
      }
    }
  }
}
