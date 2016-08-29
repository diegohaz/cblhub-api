'use strict'

import { Router } from 'express'
import { create, submit } from './password-reset.controller'

const router = new Router()

router.post('/', create)
router.post('/:token', submit)

export default router
