'use strict'

import { Router } from 'express'
import { middleware as querymen } from 'querymen'
import { index, show, create, update, destroy } from './tag.controller'
import { bearer } from '../../services/auth'

const router = new Router()

router.get('/', querymen({ sort: 'name' }), index)
router.get('/:id', show)
router.post('/', bearer({ required: true, roles: ['admin'] }), create)
router.put('/:id', bearer({ required: true, roles: ['admin'] }), update)
router.patch('/:id', bearer({ required: true, roles: ['admin'] }), update)
router.delete('/:id', bearer({ required: true, roles: ['admin'] }), destroy)

export default router
