const postsCollection = require('../db').db().collection('posts')
const ObjectID = require('mongodb').ObjectID
const User = require('./User')

let Post = function(data, userid, requestedPostId) {
  this.data = data
  this.errors = []
  this.userid = userid
  this.requestedPostId = requestedPostId
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

Post.prototype.update = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await Post.findSingleById(this.requestedPostId, this.userid)
      // if 
      if (post.isVisitorOwner) {
        // actually update the database
        let status = await this.actuallyUpdate()
        resolve(status)
      } else {
        reject()
      }
    } catch {
      reject()
    }
  })
}


Post.prototype.actuallyUpdate = function() {
  return new Promise(async (resolve, reject) => {
    this.cleanUp()
    this.validate()
    if (!this.errors.length) {
      // no validation errors, update the entry
      await postsCollection.findOneAndUpdate({_id: new ObjectID(this.requestedPostId)}, {$set: {
        title: this.data.title,
        body: this.data.body
      }})
      resolve("success")
    } else {
      resolve("failure")
    }
  })
}

Post.reuseablePostQuery = function(uniqueOperations, visitorId) {
  return new Promise(async function(resolve, reject) {

    let aggOperations = uniqueOperations.concat([
      {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
      {$project: {
        title:1,
        body: 1,
        createdDate: 1,
        authorId: "$author",
        author: {$arrayElemAt: ["$authorDocument", 0]}
      }}
    ])

    // get the post and get the author of it using aggregate
    let posts = await postsCollection.aggregate(aggOperations).toArray()

    // clean up the author property in each post object
    posts = posts.map(function(post) {
      // check if the post is owned by the current user
      post.isVisitorOwner = post.authorId.equals(visitorId) 

      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar
      }
      return post
    })
    resolve(posts)
  })
}

Post.findSingleById = function(id, visitorId) {
  return new Promise(async function(resolve, reject) {
    // check id is safe
    if (typeof id != 'string' || !ObjectID.isValid(id)) {
      reject()
      return
    }

    let posts = await Post.reuseablePostQuery([
      {$match: {_id: new ObjectID(id)}}
    ], visitorId)

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