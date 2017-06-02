import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import TodoModel from './TodoModel'
import 'todomvc-common/base.css';
import 'todomvc-app-css/index.css';

var model = new TodoModel('react-todos');

function render() {
  ReactDOM.render(
    <App model={model}/>,
    document.getElementsByClassName('todoapp')[0]
  );
}
window._model = model;
model.subscribe(render);
render();
