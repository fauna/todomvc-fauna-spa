import React, { Component } from 'react';
import {Router} from 'director';

import TodoFooter from './Footer';
import TodoItem from './TodoItem';
import Login from './Login';
import {ALL_TODOS, ACTIVE_TODOS, COMPLETED_TODOS} from './utils'

const ENTER_KEY = 13;

const ActivityIndicator = (props) => <div style={{
  color:props.active === "error" ? 'red' : 'white',
  padding: '12px',
  float:'right'}}>
    {props.active ?
      (props.active === "error" ?
        "Error" :
        "Loading...") :
      ""}
      {props.error ? JSON.stringify(props.error) : ''}
  </div>

class App extends Component {
  state = {
      nowShowing: ALL_TODOS,
      editing: null,
      newTodo: '',
      auth : {}
  }
  componentDidMount () {
    var setState = this.setState;
    var router = Router({
      '/': setState.bind(this, {nowShowing: ALL_TODOS}),
      '/active': setState.bind(this, {nowShowing: ACTIVE_TODOS}),
      '/completed': setState.bind(this, {nowShowing: COMPLETED_TODOS})
    });
    router.init('/');
  }
  handleChange (event) {
    this.setState({newTodo: event.target.value});
  }
  handleNewTodoKeyDown (event) {
    if (event.keyCode !== ENTER_KEY) {
      return;
    }

    event.preventDefault();

    var val = this.state.newTodo.trim();

    if (val) {
      this.props.model.addTodo(val);
      this.setState({newTodo: ''});
    }
  }
  toggleAll (event) {
    var checked = event.target.checked;
    this.props.model.toggleAll(checked);
  }
  toggle (todoToToggle) {
    this.props.model.toggle(todoToToggle);
  }
  destroy (todo) {
    this.props.model.destroy(todo);
  }
  edit (todo) {
    this.setState({editing: todo.ref});
  }
  save (todoToSave, text) {
    this.props.model.save(todoToSave, text);
    this.setState({editing: null});
  }
  cancel () {
    this.setState({editing: null});
  }
  clearCompleted () {
    this.props.model.clearCompleted();
  }
  onAuthChange(auth, reload) {
    this.setState({auth})
    this.props.model.onAuthChange(auth, reload);
  }
  onError(error) {
    this.setState({error})
  }
  render () {
    var footer;
    var main;
    var todos = this.props.model.todos;

    var shownTodos = todos.filter(function (todo) {
      switch (this.state.nowShowing) {
      case ACTIVE_TODOS:
        return !todo.data.completed;
      case COMPLETED_TODOS:
        return todo.data.completed;
      default:
        return true;
      }
    }, this);

    var todoItems = shownTodos.map(function (todo) {
      return (
        <TodoItem
          key={todo.ref["@ref"]}
          todo={todo.data}
          onToggle={this.toggle.bind(this, todo)}
          onDestroy={this.destroy.bind(this, todo)}
          onEdit={this.edit.bind(this, todo)}
          editing={this.state.editing === todo.ref}
          onSave={this.save.bind(this, todo)}
          onCancel={this.cancel.bind(this)}
        />
      );
    }, this);

    var activeTodoCount = todos.reduce(function (accum, todo) {
      return (todo.data && todo.data.completed) ? accum : accum + 1;
    }, 0);

    var completedCount = todos.length - activeTodoCount;

    if (activeTodoCount || completedCount) {
      footer =
        <TodoFooter
          count={activeTodoCount}
          completedCount={completedCount}
          nowShowing={this.state.nowShowing}
          onClearCompleted={this.clearCompleted.bind(this)}
        />;
    }

    if (todos.length) {
      main = (
        <section className="main">
          <input
            className="toggle-all"
            type="checkbox"
            onChange={this.toggleAll.bind(this)}
            checked={activeTodoCount === 0}
          />
          <ul className="todo-list">
            {todoItems}
          </ul>
        </section>
      );
    }
    const inputArea = <input
        className="new-todo"
        placeholder="What needs to be done?"
        value={this.state.newTodo}
        onKeyDown={this.handleNewTodoKeyDown.bind(this)}
        onChange={this.handleChange.bind(this)}
        autoFocus={true}
      />;
    return (
      <div>
        <ActivityIndicator error={this.state.error} active={this.props.model.active}/>
        <header className="header">
          <h1>todos</h1>
          <Login model={this.props.model} onError={this.onError.bind(this)} auth={this.state.auth} onAuthChange={this.onAuthChange.bind(this)} />
          {this.state.auth.faunadb_secret ? inputArea : ''}
        </header>
        {main}
        {footer}
      </div>
    );
  }
}

export default App;
