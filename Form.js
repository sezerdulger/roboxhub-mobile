import React from 'react';
import { List, InputItem, Switch, Stepper, Range, Button } from 'antd-mobile';
import { AppRegistry, StyleSheet, Text, View } from 'react-native';
import { createForm } from 'rc-form';
import { Component } from 'react';
const Item = List.Item;

class BasicInput extends Component {

  state = {
    value: 1,
  }
  onSubmit = () => {
    this.props.form.validateFields({ force: true }, (error) => {
      if (!error) {
        console.log(this.props.form.getFieldsValue());
		var fields=this.props.form.getFieldsValue();
		var formBody="";
		formBody="grant_type=password&username="+fields.username+"&password="+fields.password;
		
		fetch("http://www.roboxhub.com:32731/api/1.0/auth/oauth/token?grant_type=password", {
			method: "POST",
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'Basic Y2xpZW50OnNlY3JldA=='
			},
			body: formBody
		})
		.then((response) => response.json())
		.then((response) => {
			if (response.access_token != undefined) {
				console.log(response.access_token);
				this.props.onLoginPress();
			}
		})
		.catch(err => {
			this.setState({ message: err.message });
			this.setState({ isLoggingIn: false })
		});
		
      } else {
        alert('Validation failed');
      }
    });
  }
  onReset = () => {
    this.props.form.resetFields();
  }
  validateAccount = (rule, value, callback) => {
    if (value && value.length > 4) {
      callback();
    } else {
      callback(new Error('At least four characters for e-mail'));
    }
  }
  render() {
    const { getFieldProps, getFieldError } = this.props.form;

    return (
      <List style={{ marginTop:150 }}
        renderHeader={() => 'Login'}
        renderFooter={() => getFieldError('username') && getFieldError('username').join(',')}
      >
        <InputItem
          {...getFieldProps('username', {
             initialValue: 'itest',
            rules: [
              { required: true, message: 'Please input e-mail' },
              { validator: this.validateAccount },
            ],
          })}
          
          error={!!getFieldError('username')}
          onErrorClick={() => {
            alert(getFieldError('username').join('、'));
          }}
          placeholder="Provide e-mail"
		  >
		  
		</InputItem>
		
        <InputItem {...getFieldProps('password',{initialValue: '1234',})} placeholder="Provide password" type="password" >
           </InputItem>
        <Item
          extra={<Switch {...getFieldProps('1', { initialValue: true, valuePropName: 'checked' })} />} >
		  Remember Me
		</Item>
        <Item>
          <Button type="primary" size="large" inline onClick={this.onSubmit}>Login</Button>
        </Item>
      </List>
    );
  }
}
export default BasicInputWrapper = createForm()(BasicInput);
