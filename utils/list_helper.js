

const dummy = (blogs) => {
    return 1
  }

  
    const totalLikes = (blogs) => {
        if (blogs[0].likes && blogs.length === 1) {
          return blogs[0].likes
        } else if (blogs[0].likes === undefined) {
          return 0
        } else {
          return blogs.map((b) => b.likes).reduce((a, b) => a + b)
        }
      }

      const favoriteBlog = (blogs) => {
        if (!blogs.length) return null
    
        return blogs.reduce(
            (favorite, blog) => {
                return blog.likes > favorite.likes ? blog : favorite
            },
            { title: '', author: '', likes: 0 }
        )
    }

    const mostBlogs=(blogs)=>{
      blogs.sort((a,b)=>a-b)
      let count=1
      let max=0

      for(let i=1;i<blogs.length;i++){
        if(blogs[i].author===blogs[i-1].author){
          count++
        }else{
          count=1
        }
        if(count>max){
          max=count
        }
      }
      return ("author: "+blogs[max].author +" blogs: " +max)
    }

    const mostLikes=(blogs)=>{
      
      
      
      let max=0 
      let names=""
      
      list=[{author:"",likes:0}]
      

      for(let i=0;i<blogs.length;i++){
        if(list.find((name)=>name.author===blogs[i].author)){
          const result=list.find((name)=>name.author===blogs[i].author)
          let add=list[list.indexOf(result)].likes+blogs[i].likes
          list.splice(list.indexOf(result),1,{author:blogs[i].author,likes:add})
          
        }else{
          list.push({author:blogs[i].author,likes:blogs[i].likes})
          
        }
        
      }
      for(let i=0;i<list.length;i++){
        if(list[i].likes>max){
          max=list[i].likes
          names=list[i].author
        }
      }

      return ("author: "+names+" likes: "+max)
    }

    

  
  
  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
  }