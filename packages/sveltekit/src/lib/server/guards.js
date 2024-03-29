import { error } from '@sveltejs/kit'

export const nonSubscriber = (handler) => predicate(handler, (session) => !session?.subscription)

export const subscriber = (handler) => predicate(handler, (session) => !!session?.subscription)

subscriber.active = (handler) =>
  predicate(handler, (session) => session?.subscription?.status == 'active')

subscriber.pastDue = (handler) =>
  predicate(handler, (session) => session?.subscription?.status == 'past_due')

subscriber.unpaid = (handler) =>
  predicate(handler, (session) => session?.subscription?.status == 'unpaid')

subscriber.trialing = (handler) =>
  predicate(handler, (session) => session?.subscription?.status == 'trialing')

subscriber.canceled = (handler) =>
  predicate(handler, (session) => session?.subscription?.status == 'canceled')

subscriber.plan = (plan, handler) =>
  predicate(
    handler,
    (session) =>
      session?.subscription?.status != 'canceled' && session?.subscription?.plan?.id == plan
  )

subscriber.plans = (plans, handler) =>
  predicate(
    handler,
    (session) =>
      session?.subscription?.status != 'canceled' && plans.includes(session?.subscription?.plan?.id)
  )

function predicate(handler, filter) {
  return async (event) => {
    const session = await event.locals.getSession()

    if (filter(session)) {
      return await handler(event)
    }

    error(403, 'Forbidden')
  }
}
