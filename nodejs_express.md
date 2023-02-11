# The NodeJS/Express Summary <img src="https://nodejs.org/static/images/logo.svg" width="50px">

**This is fairly incomplete!**

## When should I use this tech for my backend?
Here's my quick and dirty and unexperienced answer:  

++ You should use NodeJS/Express when you want to serve your data to a lot of users really fast without requiring too many resources.  

-- You should not use NodeJS whenever you need to run complex operations in the backend, because it's single-threaded and complex stuff would block the event loop. Also, security might not be the best, and you still have a some breaking changes between versions.

Apart from that, it's also a good tool to get up to productivity quickly, because it's written with JavaScript, which means it's easy to get your frontenders into the project to make them fullstackers.

## How to get started
*NodeJS/Express* is fairly unopinionated, which means there may not be a single best way to setup your project. A lot of the choices will be left to you, so it's hard to give you a lot of advice. It seems there is way less structure to be taught here, as compared to, for example, *Angular*. This summary is inspired by a summary of the [MDN's article on it](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Tutorial_local_library_website), which is a tutorial to building a library application, but I only try to adapt concepts and apply them directly to our Raumplaner application, meaning it only serves as a backend to an *Angular* frontend application.

I will structure this document into several sections: A Quickstart, which includes details about the things you need/should install, how to setup a database (because I'm not following the articles instructions here and I find this quite cumbersome) and how to configure your project so that running it is easy.

Another section will concern things related to the database (MongeDB accessed through Mongoose): A guide to populating it with initial/test/mock data and whatever else might come up as I work my way through the article.

Then there will be a section discussing the various topics around *Express*, so stuff like routing and accessing your database.

## Quickstart
_To be done_

## Database (MongoDB through Mongoose)
### Creating Data
#### Defining your schema
Example code from [the tutorial](https://mongoosejs.com/docs/guide.html):
```javascript
import mongoose from 'mongoose';
const { Schema } = mongoose;

const blogSchema = new Schema({
  title:  String, // String is shorthand for {type: String}
  author: String,
  body:   String,
  comments: [{ body: String, date: Date }],
  date: { type: Date, default: Date.now },
  hidden: Boolean,
  meta: {
      votes: Number,
      favs:  Number
  }
});
```

#### Creating a model
```javascript
const Blog = mongoose.model('Blog', blogSchema);
```
(an `_id` property is automatically added to your schemas)

### Permitted SchemaTypes
- String
- Number
- Date
- Buffer
- Boolean
- Mixed
- ObjectId
- Array
- Decimal128
- Map

### Updating and locating data &hyphen; Queries and operators
I don't have enough overview to structure this nicely, yet, but let's start how we can build a nice query, which selects (find) only documents that fulfill our criteria, and then display them in the way we want (project):  
(This is `mongosh` syntax)  
```mongosh
db.myCollection.find(
  // selection parameters
  { 
    "fieldNameIsArray":
      $size: 20, // exact length of array
      $all: ["stuff", "this", "must", "contain"]
    }
  },
  // projection parameters
  {
    "price": 1, // 1 includes, 0 excludes: Don't use both in one query, EXCEPT to exclude the _id
    "address": 1,
  }
).sort(
  {
    "price": 1 // increasingly ordered by price
  }
).limit(
  10 // only show the first 10 results
).pretty() // Display human-readable
```
#### MQL operators (this is the simple stuff)
This is a list of update operators, don't know if these are all. Visit the [mongoDB docs page](https://docs.mongodb.com/manual/reference/operator/update/#id1) for more information.

**Fields:**
- `{ $currentDate: { <field1>: <typeSpecification1>, ... } }`  
Sets the value of a field to the current date, either as a Date or a timestamp. The default type is Date.
- `{ $inc: { "pop": 10, "<field2>": <increment value>, ... } }`  
Increments the specified fields by the specified amounts
- `{ $min: { <field1>: <value1>, ... } }`  
Updates the value of the field to a specified value if the specified value is less than the current value of the field.
- `{ $max: { <field1>: <value1>, ... } }`  
Updates the value of the field to a specified value if the specified value is greater than the current value of the field.
- `{ $mul: { <field1>: <number1>, ... } }`  
Multiply the value of a <em>numeric</em> field by a number.
- `{$rename: { <field1>: <newName1>, <field2>: <newName2>, ... } }`  
Updates the name of a field.
- `{ $set: { pop: 17630, <field2>: <new value>, ... } }`  
Replaces the value of a field with the specified value.
- `
  db.collection.update(
   <query>,
   { $setOnInsert: { <field1>: <value1>, ... } },
   { upsert: true }
  )`  
If an update operation with `upsert: true` results in an insert of a document, then `$setOnInsert` assigns the specified values to the fields in the document. If the update operation does not result in an insert, `$setOnInsert` does nothing.
- `{ $unset: { <field1>: "this string does't matter", ... } }`  
Deletes a particular field.

**Array:**
- `$`  
If you want to extend your query to match up to <em>elements of arrays</em>, this is for you. Check [this](https://docs.mongodb.com/manual/reference/operator/update/positional/). (I think it always modifies the first element)
- `$[]`  
Helps you to apply an update operation on all elements of an array. Check [this](https://docs.mongodb.com/manual/reference/operator/update/positional-all/).
- `[<identifier>]`  
Let's you apply update of array elements <em>that fulfill a certain condition</em>. Check [this](https://docs.mongodb.com/manual/reference/operator/update/positional-filtered/).
- `{ $addToSet: { <field1>: <value1>, ... } }`  
Adds a value to an array unless the value is already present.
- `{ $pop: { <field>: <-1 | 1>, ... } }`  
Removes the first or last element of an array. Pass `$pop` a value of `-1` to remove the first element of an array and `1` to remove the last element in an array.
- `{ $pull: { <field1>: <value|condition>, <field2>: <value|condition>, ... } }` 
Removes from an existing array all instances of a value or values that match a specified condition.
- `{ $push: { <field1>: <value1>, ... } }`  
Appends a specified value to an array.
- `{ $pullAll: { <field1>: [ <value1>, <value2> ... ], ... } }`  
Removes all instances of the specified values from an existing array. Unlike the `$pull` operator that removes elements by specifying a query, `$pullAll` removes elements that match the listed values.

**Array query operators:**  
- `{ <array field> : [<value1>,<value2>,...] }`  
Return only documents in which `array field` is *the exact array* your specified.
- `{ <array field> : { $size : <number> } }`  
Return only documents in which `array field` is an array of length `number`.
- `{ <array field> : { $all : [<value1>,<value2>,...] } }`  
Return all documents in which `array field` is an array that *contains all the values* you specified.
- `{ <array field> : { $elemMatch : { <field> : <value> } } }`  
Matches only those documents, in which an element of the `array field` contains a `field` that has a certain `value`.


**Modifiers:**
- `$each`  
[Extend `$addToSet` and `$push`](https://docs.mongodb.com/manual/reference/operator/update/each/) to multiple values.
- `$position`  
[Specify the position at which `$push` inserts values.](https://docs.mongodb.com/manual/reference/operator/update/position/)
- `$slice`  
[Check this.](https://docs.mongodb.com/manual/reference/operator/update/slice/)
- `$sort`  
[Check this.](https://docs.mongodb.com/manual/reference/operator/update/sort/)

**Bitwise:**
- `$bit`  
[Bitwise `and`, `or` and `xor`.](https://docs.mongodb.com/manual/reference/operator/update/bit/)

**Comparison:**
All these operators use the syntax `{ <field>: { <operator>: <value> } }`
- `$eq`  
Equal to
- `$ne`  
Not equal to
- `$gt`  
Greater than
- `$lt`  
Less than
- `gte`  
Greater than or equal to
- `$lte`  
Less than or equal to

**Logic:**  
- `{ $and : [{ <statement1> },{ <statement2> },...] }`
- `{ $or : [{ <statement1> },{ <statement2> },...] }`
- `{ $nor : [{ <statement1> },{ <statement2> },...] }`
- `{ $not : { <statement> } }`


#### The aggregation framework (this is the powerful stuff)

## Express
### Routing
Theoretically, you could build your entire website with Express by serving HTML. This is not our goal here. We want it to only (and ideally in a reactive fashion) serve data, which will be interpreted by our frontend. Eventually, we'll want to use websockets to establish a life connection between the data in our database and that cached in the client, but let's take this step by step and first implement a standard HTTP REST API (or something like that).

Routing, in principle, is very easy to implement. The steps required to bring an endpoint to life include
- Define the route in a `.js` file under `/routes/`
- Implement a controller to handle requests in a `.js` file under `/controllers/`
- Register your routes in `/app.js`

Again, Express is very flexible, so these are not musts but best practices. Let's see how that works in detail.

#### Defining a new route
Routes are typically grouped together by concerns (I guess). This happens in separate files, two of which exist if you have created the skeleton project using the ???. They are `/routes/index.js` and `/routes/users.js`. For our API we'll create another one, let's say it's called `/routes/plaetze-feature.js`. It could look like this:

```javascript
var express = require('express');
var router= express.Router();

// defined in the next example file
var plaetze_controller = require('../controllers/plaetze.controller');

// router.protocol_method('subURL', controller_function);
router.get('/', plaetze_controller.allPlaetze);
// ... more routes

module.exports = router;
```

So, you require *Express*, get the router from it, import your controllers (which I'll tell you about next), define your routes and what should happen when they are called by passing a callback function, and then export the router back to ... well ... whatever is interested, which you'll also learn soon.

As you can see, we have used the `router.get()` method, here, which is called if a `GET` request is received. There are methods for all other HTTP verbs, and a few more. Here they are: `get()`, `post()`, `put()`, `delete()`, `options()`, `lock()`, `mkcol()`, `move()`, `purge()`, `propfind()`, `proppatch()`, `unlock()`, `report()`, `mkactivity()`, `checkout()`, `merge()`, `m-search()`, `notify()`, `subscribe()`, `patch()`, `search()`, `connect()`.

Your URLs can also contain parameters, defined in the same fashion as with *Angular*, by preceding a fragment of the URL with a colon `:` like `/path-fragment1/:parameter1/more-static-path/:another-param`. The value of the `parameter-x` can later be accessed by `req.params.parameter-x`.

Let's see what those controllers or handlers are:
```javascript
// if you need it
var Gebaeude = require('../models/gebaeude');
// ...

exports.allPlaetze = function(req, res, next) {
  // implement your logic like accessing a database or othewise
  // creating your response data
  // ...

  // EITHER
  // Send your answer. For now, just a message
  res.send(`NOT IMPLEMENTED: Alle Plätze: ${req.params.id}`);
  // OR
  // Modify the request in some way and pass it on
  next()
};
```

Here, we have used the `res.send()` method to answer the request with a `string`. Other important response methods are `json()`, `sendFile()`, or `render()`. The last one we won't need often, since it's used to transform some view template to HTML and answer with that (I think). You can find all response methods with descriptions [here](https://expressjs.com/en/guide/routing.html#response-methods).

Now that we have our logic set up, we'll need to register these routes so that our application is aware of them:

Inside of `/app.js`, where the other route files are setup, well add our own
```javascript
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
// Here we are
app.use('/plaetze-feature', plaetzeRouter);
```

So, all the routes we defined inside `plaetzeRouter` actually reside below `/plaetze-feature`. Had we defined the route `/best-plaetze` inside `plaetzeRouter`, we'd access that via `/plaetze-feature/best-plaetze`.