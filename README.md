# JSON Server ( custom ) 

Just a custom docker image that run a json server auth with a custom route to reset database
Based on Json Server (https://github.com/typicode/json-server)) and json-server-auth (https://github.com/jeremyben/json-server-auth)

<h2 align="center">Quick brief:</h2>

* 1.- Create desired resources in the database/initial_database.json in json format, one entry => one collection

* 2.- Start docker container: docker-compose up -d 

* 3.- Go to the url http://localhost:8080


<h2 align="center">Quick overview about options:</h2>

* Json server allows you to GET,POST,PUT,DELETE over resources and allow as well filter them by attributes,pagination,sort,etc.. (more info in the json-server documentation above)

* You can protect routes using the linux file format http://localhost:8080/XYZ/resources and only access them using
a jwt token in the header ( see json-server-auth documentation above)

* To reset database consume endpoint: http://localhost:8080/resetdatabase it will dump the content of the file initial_database.json into the current_database.json

<h2 align="center">json-server docs</h2>

## Table of contents

<!-- toc -->

- [Routes](#routes)
  * [Plural routes](#plural-routes)
  * [Singular routes](#singular-routes)
  * [Filter](#filter)
  * [Paginate](#paginate)
  * [Sort](#sort)
  * [Slice](#slice)
  * [Operators](#operators)
  * [Full-text search](#full-text-search)
  * [Relationships](#relationships)
  * [Database](#database)
  * [Homepage](#homepage)
- [Extras](#extras)
  * [Static file server](#static-file-server)
  * [Alternative port](#alternative-port)
  * [Access from anywhere](#access-from-anywhere)
  * [Remote schema](#remote-schema)
  * [Generate random data](#generate-random-data)
  * [HTTPS](#https)
  * [Add custom routes](#add-custom-routes)

<!-- tocstop -->


## Routes

Based on the previous `db.json` file, here are all the default routes. You can also add [other routes](#add-custom-routes) using `--routes`.

### Plural routes

```
GET    /posts
GET    /posts/1
POST   /posts
PUT    /posts/1
PATCH  /posts/1
DELETE /posts/1
```

### Singular routes

```
GET    /profile
POST   /profile
PUT    /profile
PATCH  /profile
```

### Filter

Use `.` to access deep properties

```
GET /posts?title=json-server&author=typicode
GET /posts?id=1&id=2
GET /comments?author.name=typicode
```

### Paginate

Use `_page` and optionally `_limit` to paginate returned data.

In the `Link` header you'll get `first`, `prev`, `next` and `last` links.


```
GET /posts?_page=7
GET /posts?_page=7&_limit=20
```

_10 items are returned by default_

### Sort

Add `_sort` and `_order` (ascending order by default)

```
GET /posts?_sort=views&_order=asc
GET /posts/1/comments?_sort=votes&_order=asc
```

For multiple fields, use the following format:

```
GET /posts?_sort=user,views&_order=desc,asc
```

### Slice

Add `_start` and `_end` or `_limit` (an `X-Total-Count` header is included in the response)

```
GET /posts?_start=20&_end=30
GET /posts/1/comments?_start=20&_end=30
GET /posts/1/comments?_start=20&_limit=10
```

_Works exactly as [Array.slice](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/slice) (i.e. `_start` is inclusive and `_end` exclusive)_

### Operators

Add `_gte` or `_lte` for getting a range

```
GET /posts?views_gte=10&views_lte=20
```

Add `_ne` to exclude a value

```
GET /posts?id_ne=1
```

Add `_like` to filter (RegExp supported)

```
GET /posts?title_like=server
```

### Full-text search

Add `q`

```
GET /posts?q=internet
```

### Relationships

To include children resources, add `_embed`

```
GET /posts?_embed=comments
GET /posts/1?_embed=comments
```

To include parent resource, add `_expand`

```
GET /comments?_expand=post
GET /comments/1?_expand=post
```

To get or create nested resources (by default one level, [add custom routes](#add-custom-routes) for more)

```
GET  /posts/1/comments
POST /posts/1/comments
```

### Database

```
GET /db
```

### Homepage

Returns default index file or serves `./public` directory

```
GET /
```

## Extras

### Static file server

You can use JSON Server to serve your HTML, JS and CSS, simply create a `./public` directory
or use `--static` to set a different static files directory.

```bash
mkdir public
echo 'hello world' > public/index.html
json-server db.json
```

```bash
json-server db.json --static ./some-other-dir
```

### Alternative port

You can start JSON Server on other ports with the `--port` flag:

```bash
$ json-server --watch db.json --port 3004
```

### Access from anywhere

You can access your fake API from anywhere using CORS and JSONP.

### Remote schema

You can load remote schemas.

```bash
$ json-server http://example.com/file.json
$ json-server http://jsonplaceholder.typicode.com/db
```

### Generate random data

Using JS instead of a JSON file, you can create data programmatically.

```javascript
// index.js
module.exports = () => {
  const data = { users: [] }
  // Create 1000 users
  for (let i = 0; i < 1000; i++) {
    data.users.push({ id: i, name: `user${i}` })
  }
  return data
}
```

```bash
$ json-server index.js
```

__Tip__ use modules like [Faker](https://github.com/faker-js/faker), [Casual](https://github.com/boo1ean/casual), [Chance](https://github.com/victorquinn/chancejs) or [JSON Schema Faker](https://github.com/json-schema-faker/json-schema-faker).

### HTTPS

There are many ways to set up SSL in development. One simple way is to use [hotel](https://github.com/typicode/hotel).

### Add custom routes

Create a `routes.json` file. Pay attention to start every route with `/`.

```json
{
  "/api/*": "/$1",
  "/:resource/:id/show": "/:resource/:id",
  "/posts/:category": "/posts?category=:category",
  "/articles?id=:id": "/posts/:id"
}
```

Start JSON Server with `--routes` option.

```bash
json-server db.json --routes routes.json
```

Now you can access resources using additional routes.

```sh
/api/posts # → /posts
/api/posts/1  # → /posts/1
/posts/1/show # → /posts/1
/posts/javascript # → /posts?category=javascript
/articles?id=1 # → /posts/1
```



<h2 align="center">json-server-auth docs</h2>


## Authentication flow 🔑

JSON Server Auth adds a simple [JWT based](https://jwt.io/) authentication flow.

### Register 👥

Any of the following routes registers a new user :

- **`POST /register`**
- **`POST /signup`**
- **`POST /users`**

**`email`** and **`password`** are required in the request body :

```http
POST /register
{
  "email": "olivier@mail.com",
  "password": "bestPassw0rd"
}
```

The password is encrypted by [bcryptjs](https://github.com/dcodeIO/bcrypt.js).

The response contains the JWT access token (expiration time of 1 hour), and the user data (without the password) :

```http
201 Created
{
  "accessToken": "xxx.xxx.xxx",
  "user": {
    "id": 1,
    "email": "olivier@mail.com"
  }
}
```

###### Other properties

Any other property can be added to the request body without being validated :

```http
POST /register
{
  "email": "olivier@mail.com",
  "password": "bestPassw0rd",
  "firstname": "Olivier",
  "lastname": "Monge",
  "age": 32
}
```

###### Update

Any update to an existing user (via `PATCH` or `PUT` methods) will go through the same process for `email` and `password`.

### Login 🛂

Any of the following routes logs an existing user in :

- **`POST /login`**
- **`POST /signin`**

**`email`** and **`password`** are required, of course :

```http
POST /login
{
  "email": "olivier@mail.com",
  "password": "bestPassw0rd"
}
```

The response contains the JWT access token (expiration time of 1 hour), and the user data (without the password) :

```http
200 OK
{
  "accessToken": "xxx.xxx.xxx",
  "user": {
    "id": 1,
    "email": "olivier@mail.com",
    "firstname": "Olivier",
    "lastname": "Monge"
  }
}
```

#### JWT payload 📇

The access token has the following claims :

- **`sub` :** the user `id` (as per the [JWT specs](https://tools.ietf.org/html/rfc7519#section-4.1.2)).
- **`email` :** the user `email`.

## Authorization flow 🛡️

JSON Server Auth provides generic guards as **route middlewares**.

To handle common use cases, JSON Server Auth draws inspiration from **Unix filesystem permissions**, especialy the [numeric notation](https://en.wikipedia.org/wiki/File_system_permissions#Numeric_notation).

- We add **`4`** for **read** permission.
- We add **`2`** for **write** permission.

_Of course CRUD is not a filesystem, so we don't add 1 for execute permission._

Similarly to Unix, we then have three digits to match each user type :

- First digit are the permissions for the **resource owner**.
- Second digit are the permissions for the **logged-in users**.
- Third digit are the permissions for the **public users**.

For example, **`640`** means that only the owner can write the resource, logged-in users can read the resource, and public users cannot access the resource at all.

#### The resource owner 🛀

A user is the owner of a resource if that resource has a **`userId`** property that matches his `id` property. Example:

```js
// The owner of
{ id: 8, text: 'blabla', userId: 1 }
// is
{ id: 1, email: 'olivier@mail.com' }
```

Private guarded routes will use the JWT `sub` claim (which equals the user `id`) to check if the user actually owns the requested resource, by comparing `sub` with the `userId` property.

_Except for the actual `users` collection, where the JWT `sub` claim must match the `id` property._

### Guarded routes 🚥

Guarded routes exist at the root and can restrict access to any resource you put after them :

|    Route     | Resource permissions                                                                                 |
| :----------: | :--------------------------------------------------------------------------------------------------- |
| **`/664/*`** | User must be logged to _write_ the resource. <br> Everyone can _read_ the resource.                  |
| **`/660/*`** | User must be logged to _write_ or _read_ the resource.                                               |
| **`/644/*`** | User must own the resource to _write_ the resource. <br> Everyone can _read_ the resource.           |
| **`/640/*`** | User must own the resource to _write_ the resource. <br> User must be logged to _read_ the resource. |
| **`/600/*`** | User must own the resource to _write_ or _read_ the resource.                                        |
| **`/444/*`** | No one can _write_ the resource. <br> Everyone can _read_ the resource.                              |
| **`/440/*`** | No one can _write_ the resource. <br> User must be logged to _read_ the resource.                    |
| **`/400/*`** | No one can _write_ the resource. <br> User must own the resource to _read_ the resource.             |

#### Examples

- Public user (not logged-in) does the following requests : 

| _Request_                               | _Response_         |
| :-------------------------------------- | :----------------- |
| `GET /664/posts`                        | `200 OK`           |
| `POST /664/posts`<br>`{text: 'blabla'}` | `401 UNAUTHORIZED` |

- Logged-in user with `id: 1` does the following requests :

| _Request_                                                  | _Response_      |
| :--------------------------------------------------------- | :-------------- |
| `GET /600/users/1`<br>`Authorization: Bearer xxx.xxx.xxx`  | `200 OK`        |
| `GET /600/users/23`<br>`Authorization: Bearer xxx.xxx.xxx` | `403 FORBIDDEN` |

### Setup permissions 💡

Of course, you don't want to directly use guarded routes in your requests.
We can take advantage of [JSON Server custom routes feature](https://github.com/typicode/json-server#add-custom-routes) to setup resource permissions ahead.

Create a `routes.json` file :

```json
{
  "/users*": "/600/users$1",
  "/messages*": "/640/messages$1"
}
```

Then :

```bash
json-server db.json -m ./node_modules/json-server-auth -r routes.json
# with json-server installed globally and json-server-auth installed locally
```

##### 📢 but wait !

As a convenience, **`json-server-auth`** CLI allows you to define permissions in a more succinct way :

```json
{
  "users": 600,
  "messages": 640
}
```

Then :

```bash
json-server-auth db.json -r routes.json
# with json-server-auth installed globally
```

You can still add any other _normal_ custom routes :

```json
{
  "users": 600,
  "messages": 640,
  "/posts/:category": "/posts?category=:category"
}
```

## Module usage 🔩

If you go the programmatic way and [use JSON Server as a module](https://github.com/typicode/json-server#module), there is an extra step to properly integrate JSON Server Auth :

⚠️ You must bind the router property `db` to the created app, like the [JSON Server CLI does](https://github.com/typicode/json-server/blob/master/src/cli/run.js#L74), and you must apply the middlewares in a specific order.

```js
const jsonServer = require('json-server')
const auth = require('json-server-auth')

const app = jsonServer.create()
const router = jsonServer.router('db.json')

// /!\ Bind the router db to the app
app.db = router.db

// You must apply the auth middleware before the router
app.use(auth)
app.use(router)
app.listen(3000)
```

#### Permisssions Rewriter

The custom rewriter is accessible via a subproperty :

```js
const auth = require('json-server-auth')

const rules = auth.rewriter({
  // Permission rules
  users: 600,
  messages: 640,
  // Other rules
  '/posts/:category': '/posts?category=:category',
})

// You must apply the middlewares in the following order
app.use(rules)
app.use(auth)
app.use(router)
```

