'use strict'

import {Router} from 'express'
import {middleware as querymen} from 'querymen'
import {index, search, show, update, destroy} from './photo.controller'
import {bearer} from '../../services/auth'

const router = new Router()

router.get('/', querymen({sort: 'createdAt'}), index)
router.get('/search', search)
router.get('/:id', show)
router.put('/:id', bearer({required: true, roles: ['admin']}), update)
router.patch('/:id', bearer({required: true, roles: ['admin']}), update)
router.delete('/:id', bearer({required: true, roles: ['admin']}), destroy)

export default router
