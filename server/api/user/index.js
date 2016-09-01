'use strict'

import { Router } from 'express'
import { middleware as querymen } from 'querymen'
import { basic, bearer } from '../../services/auth'
import {
  index,
  showMe,
  show,
  create,
  createFromFacebook,
  update,
  updatePassword,
  destroy
} from './user.controller'

const router = new Router()

router.get('/', bearer({ required: true, roles: ['admin'] }), querymen(), index)
router.get('/me', bearer({ required: true }), showMe)
router.get('/:id', show)
router.post('/', create)
router.post('/facebook', createFromFacebook)
router.put('/:id', bearer({ required: true }), update)
router.patch('/:id', bearer({ required: true }), update)
router.put('/:id/password', basic(), updatePassword)
router.patch('/:id/password', basic(), updatePassword)
router.delete('/:id', bearer({ required: true, roles: ['admin'] }), destroy)

export default router
