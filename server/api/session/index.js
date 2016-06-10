'use strict'

import {Router} from 'express'
import {middleware as querymen} from 'querymen'
import {index, create, destroy} from './session.controller'
import {basic, bearer} from '../../services/auth'

const router = new Router()

router.get('/', bearer({required: true, roles: ['admin']}), querymen({user: String}), index)
router.post('/', basic(), create)
router.delete('/:token?', bearer({required: true}), destroy)

export default router