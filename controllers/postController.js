const Post = require('../models/Post')

exports.viewCreateScreen = function(req, res) {
   res.render('create-post') 
}


exports.create = function(req, res) {
   let post = new Post(req.body, req.session.user._id)
   post.create().then(function() {
      res.send("new post created")
   }).catch(function(errors) {
      res.send(errors)
   })   
}

exports.viewSingle = async function(req, res) {
   try {
      let post = await Post.findSingleById(req.params.id, req.visitorId)
      res.render('single-post-screen', {post: post})
   } catch {
    res.render('404')   
   }
}


exports.viewEditScreen = async function(req, res) {

   try {
      // get the current post
      let post = await Post.findSingleById(req.params.id)
      // create an edit screen template
      res.render("edit-post", {post: post})

   } catch {
      res.render("404")
   }


}

exports.edit = function(req, res) {
   let post = new Post(req.body, req.visitorId, req.params.id)
   post.update().then((status) => {
      // the post was succesfully updated in the database
      // or the user has access to the post but the post does not validate
      if (status == "success") {
         // post was updated in the database
         req.flash("success", "Post successfully updated.")
         req.session.save(function() {
            res.redirect(`/post/${req.params.id}/edit`)
         })
      } else {
         // redirect user back to edit screen and show the validation errors
         post.errors.forEach(function(error) {
            req.flash("errors", error)
         })
         req.session.save(function() {
            res.redirect(`/post/${req.params.id}/edit`)
         })
      }
   }).catch(() => {
      // a post with the requested id does not exist
      // or if the current visitor is not the owner of the requested post
      req.flash("errors", "You do not have permission to perform that action")
      req.session.save(function() {
         res.redirect('/')
      })
   })
}
