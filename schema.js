const faunadb = require('faunadb');
const q = faunadb.query;

// We are assuming you created a database using https://dashboard.fauna.com
// and have pasted the secret for a server key to that database into
// MY_FAUNADB_SERVER_SECRET
// You also need to create a client key to paste into FAUNADB_CLIENT_SECRET
// in src/Login.js
const client = new faunadb.Client({
  secret: "fnACW7GtaMACAYnZPsdbQ0u5M_EOFKBy8T61pgjd"
});

client.query(
    q.CreateClass({
      name: "users",
      permissions: {
        create: "public"
      }
    }))
  .then(() => client.query(
    q.Do(
      q.CreateClass({
        name: "todos",
        permissions: {
          create: q.Class("users")
        }
      }),
      q.CreateClass({
        name: "lists",
        permissions: {
          create: q.Class("users")
        }
      })
    )))
  .then(() => client.query(
    q.Do(
      q.CreateIndex({
        name: 'users_by_login',
        source: q.Class("users"),
        terms: [{
          field: ['data', 'login']
        }],
        unique: true,
        permissions: {
          read: "public"
        }
      }),
      q.CreateIndex({
        // this index is optional but useful in development for browsing users
        name: `all_users`,
        source: q.Class("users")
      }),
      q.CreateIndex({
        name: "all_todos",
        source: q.Class("todos"),
        permissions: {
          read: q.Class("users")
        }
      }),
      q.CreateIndex({
        name: "all_lists",
        source: q.Class("lists"),
        permissions: {
          read: q.Class("users")
        }
      }),
      q.CreateIndex({
        name: 'todos_by_list',
        source: q.Class("todos"),
        terms: [{
          field: ['data', 'list']
        }],
        permissions: {
          read: q.Class("users")
        }
      })
    )
  ))
  .then(console.log.bind(console))
  .catch(console.error.bind(console))
