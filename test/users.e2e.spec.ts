import { Tweet } from '../src/entities/tweet.entity'
import { User } from '../src/entities/user.entity'
import { test, createTweet, createUser } from './jest.setup'

describe('Users', () => {
  describe('GET /users/:id', () => {
    const getUserRequest = (id: number) => test().get(`/users/${id}`)

    it('存在するユーザーの場合、ユーザー情報が取得できる', async done => {
      const user = await createUser()
      getUserRequest(user.id)
        .expect(200)
        .expect(res => expect(res.body).toMatchObject({ id: user.id, name: user.name }))
        .end(done)
    })

    it('存在しないユーザーの場合、404 エラーが返ってくる', done => {
      getUserRequest(1).expect(404, done)
    })
  })

  describe('POST /users', () => {
    const postUserRequest = (params: object) => test().post('/users').send(params)

    it('name, displayName, description を正しく指定した場合、作成したユーザーが返ってくる', done => {
      const params = { name: 'sasaki', displayName: '笹木', description: '自己紹介' }
      postUserRequest(params)
        .expect(201)
        .expect(res => expect(res.body).toMatchObject(params))
        .end(done)
    })

    it('description を省略した場合、 description が空でユーザーが作成される', done => {
      postUserRequest({ name: 'sasaki', displayName: '笹木' })
        .expect(201)
        .expect(res => expect(res.body).toMatchObject({ description: '' }))
        .end(done)
    })

    it('name を省略した場合、404 エラーが返ってくる', done => {
      postUserRequest({ displayName: '笹木', description: '自己紹介' }).expect(400, done)
    })

    it('displayName を省略した場合、400 エラーが返ってくる', done => {
      postUserRequest({ name: 'sasaki', description: '自己紹介' }).expect(400, done)
    })

    describe('既存ユーザーがいる場合', () => {
      it('name が重複してる場合、 400 エラーが返ってくる', async done => {
        const user = await createUser()
        postUserRequest({ name: user.name, displayName: '笹木', description: '自己紹介' }).expect(400, done)
      })
    })
  })

  describe('PATCH /users/:id', () => {
    let user: User
    beforeEach(async () => (user = await createUser()))
    const patchUserRequest = (id: number, params: object) => test().patch(`/users/${id}`).send(params)

    it('displayName を指定することでユーザー情報を更新できる', done => {
      patchUserRequest(user.id, { displayName: 'newDisplayName' })
        .expect(200)
        .expect(res => expect(res.body).toMatchObject({ displayName: 'newDisplayName' }))
        .end(done)
    })

    it('description を指定することでユーザー情報を更新できる', done => {
      patchUserRequest(user.id, { description: 'newDescription' })
        .expect(200)
        .expect(res => expect(res.body).toMatchObject({ description: 'newDescription' }))
        .end(done)
    })

    it('name を変更しようとすると、200 は返ってくるが変更が反映されていない', done => {
      patchUserRequest(user.id, { name: 'newName' })
        .expect(200)
        .expect(res => expect(res.body).not.toMatchObject({ name: 'newName' }))
        .end(done)
    })
    it('存在しないユーザーの場合、404 エラーが返ってくる', done => {
      patchUserRequest(0, { name: 'newName' }).expect(404, done)
    })
  })

  describe('DELETE /users/:id', () => {
    let user: User
    beforeEach(async () => (user = await createUser()))
    const deleteUserRequest = (id: number) => test().delete(`/users/${id}`)

    it('存在するユーザーの場合、200が返ってきて、ユーザーが削除されている', async done => {
      deleteUserRequest(user.id)
        .expect(200)
        .expect(async _ => {
          const result = await User.findOne(user.id)
          expect(result).toBeUndefined()
        })
        .end(done)
    })

    it('存在するユーザが、ツイートも行っている場合、ツイートも削除される', async done => {
      const tweet = await createTweet({ user })
      deleteUserRequest(user.id)
        .expect(200)
        .expect(async _ => {
          const result = await Tweet.findOne(tweet.id)
          expect(result).toBeUndefined()
        })
        .end(done)
    })

    it('存在しないユーザーの場合、404 エラーが返ってくる', done => {
      deleteUserRequest(0).expect(404, done)
    })
  })
})