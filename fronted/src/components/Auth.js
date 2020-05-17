import React, { Component } from "react";
import authContext from "../context/authContext";
import { Form, FormGroup, Label, Button, Input } from "reactstrap";
import { FacebookLoginButton } from 'react-social-login-buttons';
import "./auth.css";

class AuthPage extends Component {
  state = {
    isLogin: true,
    email: "",
    password: ""
  };

  static contextType = authContext;

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.handlerChange = this.handlerChange.bind(this);
  }

  onSubmit = (event) => {
    const { email, password } = this.state;
    event.preventDefault();
    let reqQuery = {
      query: `
            query {
                login(email: "${email}", password: "${password}") {
                    userId
                    token
                }
            }
          `,
    };
    if (!this.state.isLogin) {
      reqQuery = {
        query: `
                mutation {
                    createUser(userInput: {email: "${email}", password: "${password}"}) {
                        _id
                        email
                    }
                }
              `,
      };
    }

    fetch("http://localhost:3000/graphql", {
      method: "POST",
      body: JSON.stringify(reqQuery),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("failed");
        }
        return res.json();
      })
      .then((resBody) => {
        if (resBody.data.login.token) {
          this.context.login(
            resBody.data.login.token,
            resBody.data.login.userId
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  handlerChange = (state, value) => {
    value && this.setState({ [state]: value });
  }

  render() {
    return (
      <Form className="login-form" onSubmit={this.onSubmit}>
        <h1>
          <span className="font-weight-bold">login</span>
        </h1>

        <FormGroup>
          <Label>Email</Label>
          <Input type="email"
            id="email"
            onChange={(e) => this.handlerChange('email', e)} defaultValue="" name="email"
          />
        </FormGroup>
        <FormGroup>
          <Label>password</Label>
          <Input type="text"
            id="password"
            onChange={(e) => this.handlerChange('password', e)}
            defaultValue=""
          />
        </FormGroup>
        <Button className="btn-lg btn-dark  btn-block" onClick={this.onSubmit}>
          Sign In.
      </Button>
        <div className="text-center pt-3">Or continue with facebook
       </div>
        <FacebookLoginButton className="mt-3 mb-3" />
        <div className="text-center">
          <a href="/register">Sign up</a>
          <span className="p-2">|</span>
          <a href="/forgot-password">Forgot password</a>
        </div>

      </Form>
    );
  }
}

export default AuthPage;
