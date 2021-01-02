import { UserData } from '../../../src/entities/user-data'
import { UserRepository } from '../../../src/use-cases/ports/user-repository'
import { InMemoryUserRepository } from '../in-memory-user-repository'
import { Encoder } from '../../../src/use-cases/ports/encoder'
import { FakeEncoder } from './fake-encoder'
import { SignUp } from '../../../src/use-cases/sign-up/sign-up'
import { ExistingUserError } from '../../../src/use-cases/sign-up/errors/existing-user-error'

describe('Sign up use case', () => {
  const validEmail = 'any@mail.com'
  const validPassword = '1validpassword'
  const invalidEmail = 'invalid_email'
  const invalidPassword = '1abc'
  const validUserSignUpRequest: UserData = { email: validEmail, password: validPassword }
  const emptyUserRepository: UserRepository = new InMemoryUserRepository([])
  const userDataArrayWithSingleUser: UserData[] = new Array(validUserSignUpRequest)
  const singleUserUserRepository: UserRepository = new InMemoryUserRepository(userDataArrayWithSingleUser)
  const encoder: Encoder = new FakeEncoder()

  test('should sign up user with valid data', async () => {
    const sut: SignUp = new SignUp(emptyUserRepository, encoder)
    const userSignUpResponse = (await sut.perform(validUserSignUpRequest))
    expect((userSignUpResponse.value as UserData).email).toEqual(validEmail)
    expect((userSignUpResponse.value as UserData).id).not.toBeUndefined()
    expect((await emptyUserRepository.findAll()).length).toEqual(1)
    expect((await emptyUserRepository.findByEmail(validEmail)).password).toEqual(validPassword + 'ENCRYPTED')
  })

  test('should not sign up existing user', async () => {
    const sut: SignUp = new SignUp(singleUserUserRepository, encoder)
    const error = await sut.perform(validUserSignUpRequest)
    expect(error.value).toEqual(new ExistingUserError(validUserSignUpRequest))
  })

  test('should not sign up user with invalid email', async () => {
    const userSignupRequestWithInvalidEmail: UserData = { email: invalidEmail, password: validPassword }
    const sut: SignUp = new SignUp(emptyUserRepository, encoder)
    const error = await sut.perform(userSignupRequestWithInvalidEmail)
    expect((error.value as Error).name).toEqual('InvalidEmailError')
  })

  test('should not sign up user with invalid password', async () => {
    const userSignupRequestWithInvalidPassword: UserData = { email: validEmail, password: invalidPassword }
    const sut: SignUp = new SignUp(emptyUserRepository, encoder)
    const error = await sut.perform(userSignupRequestWithInvalidPassword)
    expect((error.value as Error).name).toEqual('InvalidPasswordError')
  })
})