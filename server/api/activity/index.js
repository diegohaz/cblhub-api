'use strict'

import { Router } from 'express'
import { Types } from 'mongoose'
import { middleware as querymen } from 'querymen'
import { index, show, create, update, destroy } from './activity.controller'
import { bearer } from '../../services/auth'

const router = new Router()

router.get('/',
  querymen({
    user: [Types.ObjectId],
    challenge: [Types.ObjectId],
    guide: {
      type: Types.ObjectId,
      paths: ['guides']
    }
  }),
  index)
router.get('/:id', show)
router.post('/', bearer({ required: true }), create)
router.put('/:id', bearer({ required: true }), update)
router.patch('/:id', bearer({ required: true }), update)
router.delete('/:id', bearer({ required: true }), destroy)

export default router
