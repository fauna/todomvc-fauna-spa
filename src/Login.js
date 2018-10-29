import './login.css'
import React, {Component} from 'react';

import faunadb, {query as q} from 'faunadb';

import netlifyIdentity from "netlify-identity-widget";
netlifyIdentity.init();

function saveLogin() {
   if (netlifyIdentity && netlifyIdentity.currentUser()) {
     const {
       app_metadata, created_at, confirmed_at, email, id, user_metadata
     } = netlifyIdentity.currentUser();

     localStorage.setItem(
       "faunaNetlifyUser",
       JSON.stringify({app_metadata, created_at, confirmed_at, email, id, user_metadata})
     );
     return {app_metadata, created_at, confirmed_at, email, id, user_metadata};
   }
 }
function clearLogin() {
   localStorage.removeItem("faunaNetlifyUser");
 }

const publicClient = new faunadb.Client({
  secret: "fnACW7G2d0ACAeiItklGS3QR-FW3sjHK3zwP1kus"
});

// function saveTokens(faunadb_secret) {
//   console.log("saveTokens", faunadb_secret)
//   if (faunadb_secret) {
//     localStorage.setItem('faunadb_secret', faunadb_secret);
//   }
// }
//
// function clearTokens() {
//   localStorage.removeItem('faunadb_secret');
// }

// function getTokens() {
//   console.log("getTokens faunaNetlifyUser", localStorage.getItem('faunaNetlifyUser'))
//   return {
//     faunadb_secret: localStorage.getItem('faunadb_secret')
//   }
// }

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }
  componentWillMount() {
    // check for login code
    this.authorized(false);
  }
  componentDidMount() {
    const storedUser = localStorage.getItem("faunaNetlifyUser");
    if (storedUser) {
      this.setState({user: JSON.parse(storedUser)});
    } else {
      const netlifyUser = saveLogin(); // does calling user pop a thing? should we set state?
      if (netlifyUser) {
        this.setState({user: netlifyUser});
      }
    }
    netlifyIdentity.on("login", (user) => this.setState({user}, saveLogin()));
    netlifyIdentity.on("logout", (user) => this.setState({user: null}, clearLogin()));
  }
  authorized(reload) {
    if (reload) {
      return window.history.go(0);
    }
    // var tokens = getTokens();
    // if (tokens.faunadb_secret) {
    //   this.props.onAuthChange(tokens, true)
    // } else {
    //   this.props.onAuthChange({})
    // }
  }
  login () {
    netlifyIdentity.open()
  }
  // doLogin () {
  //   console.log(this.state)
  //   publicClient.query(q.Login(q.Match(q.Index("users_by_login"), this.state.login), {
  //       password : this.state.password
  //   })).then((key) => {
  //     saveTokens(key.secret);
  //     this.authorized(false);
  //   })
  // }
  // ["doSign Up"] () {
  //   console.log(this.state)
  //   publicClient.query(
  //     q.Create(q.Class("users"), {
  //       credentials : {
  //         password : this.state.password
  //       },
  //       // permissions : {
  //         // read : q.Select("ref", q.Get(q.Ref("classes/users/self")))
  //       // }
  //       data : {
  //         login : this.state.login
  //       }
  //   })).then(() => publicClient.query(
  //     q.Login(q.Match(q.Index("users_by_login"), this.state.login), {
  //       password : this.state.password
  //   }))).then((key) => {
  //     saveTokens(key.secret);
  //     this.authorized(true);
  //   });
  // }
  doLogout () {
    // remove credentials and refresh model
    netlifyIdentity.logout();
    clearLogin();
    this.setState({user:null})
  }
	render () {
    var actionForm = <span>
        <a onClick={this.login.bind(this)}>Login or Sign Up</a>
      </span>;
		return (
			<div className="Login">
        {this.state.user ?
          <a onClick={this.doLogout.bind(this)}>Logout</a> :
          actionForm
        }
      </div>
		);
	}
}

export default Login;
