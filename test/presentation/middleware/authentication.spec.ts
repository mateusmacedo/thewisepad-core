import { HttpResponse } from '@/presentation/controllers/ports'
import { Authentication } from '@/presentation/middleware'
import { FakeTokenManager } from '@test/doubles/authentication'
import { forbidden, ok, serverError } from '@/presentation/controllers/util/http-helper'
import { Payload, TokenManager } from '@/use-cases/authentication/ports'
import { Either } from '@/shared'

describe('Authentication middleware', () => {
  test('should return forbidden with invalid token error if access token is empty', async () => {
    const authMiddleware = new Authentication(new FakeTokenManager())
    const response: HttpResponse = await authMiddleware.handle({ accessToken: '' })
    expect(response).toEqual(forbidden(new Error('Invalid token.')))
  })

  test('should return forbidden with invalid token error if access token is null', async () => {
    const authMiddleware = new Authentication(new FakeTokenManager())
    const response: HttpResponse = await authMiddleware.handle({ accessToken: null })
    expect(response).toEqual(forbidden(new Error('Invalid token.')))
  })

  test('should return forbidden with invalid token error if access token is invalid', async () => {
    const tokenManager = new FakeTokenManager()
    const payload = { id: 'my id' }
    const token = await tokenManager.sign(payload)
    const invalidToken = token + 'some trash'
    const authMiddleware = new Authentication(tokenManager)
    const response: HttpResponse = await authMiddleware.handle({ accessToken: invalidToken })
    expect(response).toEqual(forbidden(new Error('Invalid token.')))
  })

  test('should return payload if access token is valid', async () => {
    const tokenManager = new FakeTokenManager()
    const payload = { id: 'my id' }
    const validToken = await tokenManager.sign(payload)
    const authMiddleware = new Authentication(tokenManager)
    const response: HttpResponse = await authMiddleware.handle({ accessToken: validToken })
    expect(response).toEqual(ok(payload))
  })

  test('should return server error if server throws', async () => {
    class ThrowingFakeTokenManager implements TokenManager {
      async sign (info: Payload, expiresIn?: string): Promise<string> {
        return 'a token'
      }

      async verify (token: string): Promise<Either<Error, Payload>> {
        throw new Error('An error.')
      }
    }
    const tokenManager = new ThrowingFakeTokenManager()
    const payload = { id: 'my id' }
    const validToken = await tokenManager.sign(payload)
    const authMiddleware = new Authentication(tokenManager)
    const response: HttpResponse = await authMiddleware.handle({ accessToken: validToken })
    expect(response).toEqual(serverError(new Error('An error.')))
  })
})