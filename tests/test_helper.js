const Blog=require ('../models/blog')
const User = require('../models/user')




const initialBlogs = [
    {
      title: 'tekken 7',
      author: 'Jme',
      url: 'asdf.com',
      likes: 64,
      user:null
    },
    {
      title: 'street fighter',
      author: 'D double e',
      url: 'asgd.com',
      likes: 90,
      user:null
    },
  ]

  
  const nonExistingId = async () => {
    const blog = new blog({ title: 'willremovethissoon',  author: 'SK',
        url: 'bafa.com',})
    await blog.save()
    await blog.deleteOne()
  
    return blog._id.toString()
  }

  const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
  }

  const usersInDb = async () => {
    const users = await User.find({})
    console.log('users test helper',users)
    return users.map(u => u.toJSON())

    
  }
  
  
  module.exports = {
    initialBlogs, nonExistingId, blogsInDb,usersInDb
  }