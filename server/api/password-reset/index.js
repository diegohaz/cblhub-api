'use strict'

import { Router } from 'express'
import { create, show, update } from './password-reset.controller'

const router = new Router()

router.post('/', create)
router.get('/:token', show)
router.put('/:token', update)
router.patch('/:token', update)

export default router
