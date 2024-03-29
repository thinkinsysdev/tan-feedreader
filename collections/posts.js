Posts = new Meteor.Collection('post_items');

Posts.allow({
  update: ownsDocument,
  remove: ownsDocument
});

Posts.deny({
  update: function(userId, post, fieldNames) {
    // may only edit the following two fields:
    return (_.without(fieldNames, 'url', 'title').length > 0);
  }
});

Meteor.methods({
  post: function(postAttributes) {
     //console.log('In the post function');
    var user = Meteor.user(),
      postWithSameLink = Posts.findOne({url: postAttributes.url});

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to post new stories");

    // ensure the post has a title
    if (!postAttributes.title)
      throw new Meteor.Error(422, 'Please fill in a headline');

    // check that there are no previous posts with the same link
    if (postAttributes.url && postWithSameLink) {
      throw new Meteor.Error(302, 
        'This link has already been posted', 
        postWithSameLink._id);
    }

    // pick out the whitelisted keys
    var post = _.extend(_.pick(postAttributes, 'url', 'title', 'message'), {
      userId: user._id, 
      author: user.username, 
      content: '',
      imgUrl: '',
      submitted: new Date().getTime(),
        commentsCount: 0,
       upvoters: [], 
  votes: 0
    });

    var postId = Posts.insert(post);

    return postId;
  },
   upvote: function(postId) {
     
    
    var user = Meteor.user();
    // ensure the user is logged in
    if (!user)
    {
      throw new Meteor.Error(401, "You need to login to upvote");
    }
   
    
     try
    {
      
     Posts.update({
      _id: postId, 
      upvoters: {$ne: user._id}
    }, {
      $addToSet: {upvoters: user._id},
      $inc: {votes: 1}
    });
    }
     catch (err)
     {
       throw new Meteor.Error('505', "You cannot upvote your own post");
       }
  }
});