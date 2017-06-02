const faunadb = require('faunadb');
const q = faunadb.query;

// We are assuming you created a database using https://dashboard.fauna.com
// and have pasted the secret for a server key to that database into
// MY_FAUNADB_SERVER_SECRET
// You also need to create a client key to paste into FAUNADB_CLIENT_SECRET
// in src/Login.js
const client = new faunadb.Client({
  secret: MY_FAUNADB_SERVER_SECRET
});

client.query(
  q.CreateClass({
    name: "users",
    permissions: { create: "public" }
  }))
  .then(() => client.query(
    q.Create(q.Ref('indexes'), {
      name: 'users_by_login',
      source: q.Class("users"),
      terms: [{ field: ['data', 'login'] }],
      unique: true,
      permissions: {
        read : "public"
      }
  })))
  .then(() => client.query(
    q.Create(q.Ref('indexes'), {
      // this index is optional but useful in development for browsing users
      name: `all_users`,
      source: q.Class("users")
  })))
  .then(() => client.query(
    q.Create(q.Ref("classes"), {
      name: "todos",
      permissions: {
        create : q.Class("users")
      }
  })))
  .then(() => client.query(
    q.Create(q.Ref("indexes"), {
      name: "all_todos",
      source: q.Class("todos"),
      permissions: {
        read : q.Class("users")
      }
  })))
  .then(console.log.bind(console))
  .catch(console.error.bind(console))
