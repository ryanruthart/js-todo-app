const postsCollection = require('../db').db().collection('posts')
const ObjectID = require('mongodb').ObjectID
const User = require('./User')

let Post = function(data, userid) {
  this.data = data
  this.errors = []
  this.userid = userid
}

Post.prototype.cleanUp = function() {
  if (typeof(this.data.title) != "string") {this.data.title = ""}
  if (typeof(this.data.body) != "string") {this.data.body = ""}

  // get rid of bogus properties
  this.data = {
    title: this.data.title.trim(),
    body: this.data.body.trim(),
    createdDate: new Date(),
    author: ObjectID(this.userid)
  }
}

Post.prototype.validate = function() {
  if (this.data.title == "") {this.errors.push("The post needs a title")}
  if (this.data.body == "") {this.errors.push("The post needs a body")}
}

Post.prototype.create = function() {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    this.validate()
    if (!this.errors.length) {
      postsCollection.insertOne(this.data).then(() => {
        resolve()
      }).catch(() => {
        this.errors.push("Please try again later")
        reject(this.errors)
      })
    } else {
      reject(this.errors)
    }
  }) 

}


Post.reuseablePostQuery = function(uniqueOperations) {
  return new Promise(async function(resolve, reject) {

    let aggOperations = uniqueOperations.concat([
      {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
      {$project: {
        title:1,
        body: 1,
        createdDate: 1,
        author: {$arrayElemAt: ["$authorDocument", 0]}
      }}
    ])

    // get the post and get the author of it using aggregate
    let posts = await postsCollection.aggregate(aggOperations).toArray()

    // clean up the author property in each post object
    posts = posts.map(function(post) {
      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar
      }
      return post
    })
    resolve(posts)
  })
}

Post.findSingleById = function(id) {
  return new Promise(async function(resolve, reject) {
    // check id is safe
    if (typeof id != 'string' || !ObjectID.isValid(id)) {
      reject()
      return
    }

    let posts = await Post.reuseablePostQuery([
      {$match: {_id: new ObjectID(id)}}
    ])

    if (posts.length) {
      resolve(posts[0])
    } else {
      reject()
    }

  })
}

Post.findByAuthorId = function (authorId) {
  return Post.reuseablePostQuery([
    {$match: {author: authorId}},
    {$sort: {createdDate: -1}}
  ])
}


module.exports = Post