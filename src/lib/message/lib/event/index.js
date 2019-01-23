'use strict'

import Event from './event'
import Boom from 'boom'
import Mailgun from '../../../mailgun/'

module.exports = self => {
  return {
    add (data) {
      return Event.add(data)
    },

    async remove (id) {
      try {
        const event = new Event(id)
        const eventRm = await event.remove()

        return Promise.resolve(eventRm)
      } catch (e) {
        return Promise.reject(new Boom(e))
      }
    },

    async getAll () {
      try {
        const messageData = await self.get()
        const events = await Event.getAllBy('message', messageData.id)

        return Promise.resolve(events)
      } catch (e) {
        return Promise.reject(new Boom(e))
      }
    },
    
    async asyncProvider () {
      try {
        const messageData = await self.get()
        const providerId = messageData.provider.id
        
        const pMessage = new Mailgun(providerId)
        const pEvents = await pMessage.events()
        
        const formatEvents = pEvents.map(e => {
          e.message = messageData.id
          return Event.format('mailgun', e)
        })
        
        const events = []
        
        for (let i in formatEvents) {
          const eventData = formatEvents[i]
            
          const newEvent = await Event.add(eventData)
          events.push(newEvent)
        }
        
        return Promise.resolve(events)
      } catch (e) {
        return Promise.reject(new Boom(e))
      }
    }
  }
}
