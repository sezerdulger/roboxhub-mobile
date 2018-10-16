import React from 'react';
import { AppRegistry, StyleSheet, Text, View } from 'react-native';
import {Button} from 'antd-mobile';
import { Component } from 'react';

import Login from './Form';
import Secured from './Secured';
import TabBarExample from './TabBarExample';


class MyWebSocket extends Component {
	connect() {
	  var ws = new WebSocket('ws://roboxhub.com:32350/ws');

	  ws.onopen = () => {
		  console.log("open");
		// connection opened
		ws.send('something'); // send a message
	  };
	  
	  ws.onmessage = (e) => {
		  console.log(e);
		// a message was received
		console.log(e.data);
	  };
	  
	  ws.onerror = (e) => {
		  
		// an error occurred
		console.log(e.message);
	  };
	  
	  ws.onclose = (e) => {
		// connection closed
		console.log(e.code, e.reason);
	  };
	}
}




class HelloWorldApp extends Component {
  state = {
    isLoggedIn: true
  }
  
  deviceData = {data:0}
  
  render() {
	  
	object=this;
	//this.state.isLoggedIn=false;
    if (this.state.isLoggedIn)
      return <Secured 
  
        onLogoutPress={() => 
			  {
				  this.setState({isLoggedIn: false, deviceData:object.deviceData.data});
			  }
			}
		onRefresh={(data) => 
			  {
				  console.log(data);
				  this.setState({deviceData: data});
			  }
			}
		deviceData={object.deviceData.data}
		devices={[]}
        />;
    else 
      return <Login 
          onLoginPress={() => {
			  console.log('test');
			  this.setState({isLoggedIn: true});
			  
		    }
		  }
		  
        />;
  }
}
AppRegistry.registerComponent('HelloWorldApp', () => HelloWorldApp);
AppRegistry.registerComponent('TabBarExample', () => TabBarExample);

export default class App extends React.Component {
  render() {
    return (

      <View style={styles.container}>
		<HelloWorldApp />
      </View>
	
    );
  }
}

const styles = StyleSheet.create({
  container: {
	  
    //flex: 0,
    //backgroundColor: '#fff',
    //alignItems: 'center',
    //justifyContent: 'center',
  },
});
