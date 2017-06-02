// const request = require('superagent');

const faunadb = require('faunadb');
const q = faunadb.query;

export default class TodoModel {
	constructor (key) {
		this.key = key;
		this.todos = [];
		// this.auth = {}
		this.onChanges = [];
		this.active = false; // todo add observer to client
	}
	subscribe(onChange) {
		this.onChanges.push(onChange);
	}
	inform(reload = true) {
		if (reload) {
			this.getServerTodos().then(()=>{
				this.onChanges.forEach(function (cb) { cb(); });
			})
		} else {
			Promise.resolve("ok").then(() => {
				this.onChanges.forEach(function (cb) { cb(); });
			})
		}
	}
	onAuthChange (auth, reload) {
		this.todos = [];
    this.client = new faunadb.Client({
      secret: auth.faunadb_secret
    });
		console.log("onAuthChange", auth, reload)
		if (reload) {
			this.inform()
		}
	}
	isActive(is) {
		// console.log('isActive', is);
		this.active = is
		this.inform(false)
	}
	getServerTodos() {
		return this.client.query(
      q.Map(
        q.Paginate(q.Match(q.Ref("indexes/all_todos"))),
        (ref) => q.Get(ref))).then((r) => {
					console.log("getServerTodos", r)
					this.todos = r.data;
				})
	}
	addTodo(title) {
		var newTodo = {
			title: title,
			completed: false
		}
    const me = q.Select("ref", q.Get(q.Ref("classes/users/self")));
    newTodo.user = me;
    return this.client.query(q.Create(q.Ref("classes/todos"), {
      data: newTodo,
      permissions : {
        read : me,
        write : me
      }
     })).then((r) => {
			this.inform()
		})
	}
	toggleAll(checked) {
    return this.client.query(
      q.Map(
        q.Paginate(q.Match(q.Ref("indexes/all_todos"))),
        (ref) => q.Update(q.Select("ref", q.Get(ref)),
        { data : {
          completed : q.Not(q.Select(["data", "completed"], q.Get(ref)))
      }}))).then((r) => {
			       this.inform();
		 });
	}
	toggle(todoToToggle) {
		console.log("todoToToggle", todoToToggle)
    return this.client.query(q.Update(todoToToggle.ref,
        { data : {
          completed : !todoToToggle.data.completed,
        }})).then((r) => {
			this.inform()
		})
	}
	destroy(todo) {
    return this.client.query(q.Delete(todo.ref)).then(() => this.inform());
	}
	save(todoToSave, text) {
    return this.client.query(q.Update(todoToSave.ref),
      {data : todoToSave.data}).then((r) => this.inform());
	}
	clearCompleted() {
    return this.client.query(
      q.Map(
        q.Paginate(q.Match(q.Ref("indexes/all_todos"))),
        (ref) => q.If(q.Select(["data", "completed"], q.Get(ref)),
          q.Delete(q.Select("ref", q.Get(ref))),
        true))).then((r) => this.inform());
	}
};
