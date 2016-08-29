'use strict'

import { Router } from 'express'
import { middleware as querymen } from 'querymen'
import { index, showMe, show, create, createFromFacebook, update, destroy } from './user.controller'
import { bearer } from '../../services/auth'

const router = new Router()

router.get('/', bearer({ required: true, roles: ['admin'] }), querymen(), index)
router.get('/me', bearer({ required: true }), showMe)
router.get('/:id', show)
router.post('/', create)
router.post('/facebook', createFromFacebook)
router.put('/:id', bearer({ required: true }), update)
router.patch('/:id', bearer({ required: true }), update)
router.delete('/:id', bearer({ required: true, roles: ['admin'] }), destroy)

export default router
