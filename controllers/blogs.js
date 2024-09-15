const blogsRouter=require('express').Router()
const Blog=require('../models/blog')
const User=require('../models/user')
const jwt = require('jsonwebtoken')
const middleware= require('../utils/middleware')


blogsRouter.get('/',async (request, response) => {

  try {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
    response.json(blogs);
  } catch (error) {
    response.status(500).json({ error: 'An error occurred while fetching blogs.' });
  }
  })

  
  
  blogsRouter.post('/', middleware.userExtractor ,async (request, response,next) => {
    
    const body = request.body

    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    console.log('jwt verify ',decodedToken)
    
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)

    

    if (!user) {
      return response.status(404).json({ error: 'User not found' });
    }

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
      user: request.user.id
    })
  
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    
    response.status(201).json(savedBlog)
 
  })

  blogsRouter.delete('/:id', middleware.userExtractor , async (request, response, next) => {


    try {
      const blog = await Blog.findById(request.params.id);
  
      if (!blog) {
        return response.status(404).json({ error: 'Blog not found' });
      }
      console.log('blog._id.toString()',blog)
      console.log('request user id to string',request.user)
  
      // Check if the user is the creator of the blog
      if (blog.user.toString() !== request.user._id.toString()) {
        return response.status(403).json({ error: 'Permission denied' });
      }
  
      await Blog.findByIdAndDelete(request.params.id);
      response.status(204).end();
    } catch (exception) {
      next(exception);
    }

    })

    

    blogsRouter.put('/:id', async (request, response, next) => {
      const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  Blog.findByIdAndUpdate(request.params.id, blog, { new:true  })
    .then(updatedBlog => {
      response.json(updatedBlog)
    })
    .catch(error => next(error))
    })

    

    blogsRouter.get('/:id', (request, response, next) => {
      Blog.findById(request.params.id)
        .then(blog => {
          if (blog) {
            response.json(blog)
          } else {
            response.status(404).end()
          }
        })
        .catch(error => next(error))
    })

  module.exports = blogsRouter