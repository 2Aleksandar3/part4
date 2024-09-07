const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user.js')

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (!username || !password || username.length < 3 || password.length < 3) {
    return response.status(400).json({
      error: 'Both username and password must be provided and at least 3 characters long.'
    })
  }

  

    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return response.status(400).json({ error: 'expected `username` to be unique' });
      }


  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  
    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch (error) {
    response.status(500).json({ error: 'Internal server Error' })
  }
})

usersRouter.get('/', async (request, response) => {

  try {
    const users = await User.find({}).populate('blogs', { url: 1, title: 1, author: 1 });
    response.json(users);
  } catch (error) {
    response.status(500).json({ error: 'An error occurred while fetching users.' });
  }

  /*const users = await User.find({}).populate('blogs',{url:1,title:1,author:1})
  response.json(users)*/
})

module.exports = usersRouter