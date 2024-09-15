const { test, after,beforeEach,describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
var assert = require('assert')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)


beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({});

  let user = await User.findOne({ username: 'root' });

  if (!user) {
    // Create a new user if one does not exist
    user = new User({ username: 'root' });
    user.passwordHash = await bcrypt.hash('sekret', 10); 
    await user.save();
  }

  // Assign the single user to all blogs
  const blogsWithUser = initialBlogs.map(blog => ({
    ...blog,
    user: user._id, 
  }));

  // Save blogs with user
  const blogPromises = blogsWithUser.map(blog => new Blog(blog).save());
  await Promise.all(blogPromises);
  
})


const initialBlogs = [
  {
    title: 'tekken 7',
    author: 'Jme',
    url: 'asdf.com',
    likes: 227
  },
  {
    title: 'street fighter',
    author: 'D double e',
    url: 'asgd.com',
    likes: 90
  },
]



test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('right amount of blogs', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('unique identifier is named id', async () => {

  const response = await api.get('/api/blogs')

for(let i=0;i<response.body.length;i++){
  assert(response.body[i].hasOwnProperty('id'))
}
  
})

test('new blog created successfully',async ()=>{
  const newBlog={
    title: "adventure",
    author: "finn",
    url: 'jake',
    likes: 74
  }
  
  const testLogin = await api
  .post('/api/login') 
  .send({ username: "root", password: "sekret" }) 
  .expect(200);

  console.log('Login response:', testLogin.body);

  const authToken = testLogin.body.token;

  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', `Bearer ${authToken}`)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const contents = response.body.map(r => r.content)

  assert.strictEqual(response.body.length, initialBlogs.length + 1)
  
})

test('likes are missing so the value is 0',async ()=>{
  const newBlog={
    title: "regular",
    author: "mordecai",
    url: 'rigby'
  }

  const testLogin = await api
  .post('/api/login') 
  .send({ username: "root", password: "sekret" }) 
  .expect(200);

  console.log('Login response:', testLogin.body);

  const authToken = testLogin.body.token;

  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', `Bearer ${authToken}`)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    for(let i=0;i<response.body.length;i++){
      if(!response.body[i].hasOwnProperty('likes')){
response.body[i].likes=0
console.log(response.body[i],'yelloq')
      }
    }
  
})

test('blog without title or url is not added', async () => {
  const newBlog = {
    author: "boldy",
    likes: 227
  }

  const response = await api.get('/api/blogs')

  for(let i=0;i<response.body.length;i++){
    if(!response.body[i].hasOwnProperty('author') || !response.body[i].hasOwnProperty('url'))
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
  }
})

test('deletion of a blog', async ()=>{

  const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]
      console.log(blogsAtStart,'wopwopowopow')

      console.log(blogToDelete.id,'ililili')

      const testLogin = await api
  .post('/api/login') 
  .send({ username: "root", password: "sekret" }) 
  .expect(200);

  console.log('Login response:', testLogin.body);

  const authToken = testLogin.body.token;

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204)

        const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

      const titles = blogsAtEnd.map(r => r.title)
      console.log('contents after delete', titles)
      assert(!titles.includes(blogToDelete.title))
})

test('updating of a blog', async ()=>{
  
 
  const response = await api.get('/api/blogs')
  const blogToUpdate= response.body[1]

  console.log('ID of blog to update:', blogToUpdate)

  const testLogin = await api
  .post('/api/login') 
  .send({ username: "root", password: "sekret" }) 
  .expect(200);

  console.log('Login response:', testLogin.body);

  const authToken = testLogin.body.token;

  await api
  .get(`/api/blogs/${blogToUpdate.id}`)
  
  .expect(200)

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .set('Authorization', `Bearer ${authToken}`)
    .send({ likes: 480 })
    .expect(200)

    const updatedResponse = await api.get('/api/blogs')
  const updatedBlog = updatedResponse.body.find(blog => blog.id === blogToUpdate.id)

 
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root',name: 'Superuser', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with proper status code and message if username or password is too short', async () => {
    const usersAtStart = await helper.usersInDb()
  
    // Test with username too short
    const newUserShortUsername = {
      username: 'ro', // Username too short
      password: 'validpassword', // Valid password
    }
  
    let result = await api
      .post('/api/users')
      .send(newUserShortUsername)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  
    //expect(result.body.error).toContain('Both username and password must be provided and at least 3 characters long.')
  
    // Test with password too short
    const newUserShortPassword = {
      username: 'validusername', // Valid username
      password: 'pw', // Password too short
    }
  
    result = await api
      .post('/api/users')
      .send(newUserShortPassword)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  
   // expect(result.body.error).toContain('Both username and password must be provided and at least 3 characters long.')
  
    const usersAtEnd = await helper.usersInDb()
    //expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

})


after(async () => {
  await mongoose.connection.close()
})