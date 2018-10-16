import React, { Component } from 'react';
import {
	ScrollView,
	Text,
	View,
	Button,
	DeviceEventEmitter ,
	StyleSheet,
	Animated
} from 'react-native';
import { AnimatedGaugeProgress, GaugeProgress } from 'react-native-simple-gauge';
import { Picker, List, WhiteSpace, TabBar , Icon } from 'antd-mobile';
import TabBarExample from './TabBarExample';


import Sidebar from 'react-native-sidebar';

import { createForm } from 'rc-form';


		const size = 200;
		const width = 15;
		const cropDegree = 60;
		const textOffset = width;
		const textWidth = size - (textOffset*2);
		const textHeight = size*(1 - cropDegree/360) - (textOffset*2);
		
import { Connection,
          Queue,
          Exchange
       } from 'react-native-rabbitmq';

class RabbitMq extends Component {
	bind(routingKey, callback) {
		while(!this.connected) {
			console.log("waiting for rabbitmq connection... ");
		}
		var guid = function() {
		  function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
			  .toString(16)
			  .substring(1);
		  }
		  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
		};
		this.queue = new Queue( this.connection, {
			name: guid(),
			routing_key: '',
			passive: false,
			durable: true, 
			exclusive: false,
			consumer_arguments: {'x-priority': 1}
		});
		
		let exchange = new Exchange(this.connection, {
			name: 'deviceDataEx', 
			type: 'topic', 
			durable: true
		});

		this.queue.bind(exchange, routingKey);
		
		// Receive one message when it arrives
		this.queue.on('message', (data) => {
			console.log("received message");
			console.log(JSON.parse(data.message));
			var message=JSON.parse(data.message);
			console.log(message);
			
			callback(message);
		});
		
		// Receive all messages send with in a second
		this.queue.on('messages', (data) => {
			//console.log(data);
		});
	}
	deleteQueue() {
		this.queue.delete();
	}
	connect(callback) {
		const config = {
			host: 'roboxhub.com', 
			port: 30958, 
			username: 'guest', 
			password: 'guest', 
			virtualhost: '/'
		}
		console.log("trying to connect rabbitmq");
		this.connection = new Connection(config);
		this.connection.connect();
		this.connection.on('error', (event) => {
			console.log(" [e] error");
			console.log(event);
		});
		
		this.connection.on('connected', (event) => {
			console.log("connected");
			this.connected=true;

		});
	}
	

}

export default class Secured extends Component {
	constructor(props, context) {
		super(props, context);
		this.state={temp: 0, humidity: 0, battery: 0, devices:[],selectedTab: 'redTab', hidden: false, fullScreen: false};
		
	}
	onPickerChange = (val) => {
		console.log(val);
		//this.setState({selectedDevice: val});
	}
	onValueChange=(val) => {
		this.setState({selectedDevice: val});
		this.rabbitmq.deleteQueue();
		var object=this;
		object.state.temp=0;
		object.state.humidity=0;
		object.state.battery=0;
		object.refs.circularProgressTemperature.animateFill();
		object.refs.circularProgressHumidity.animateFill();
		object.refs.circularProgressBattery.animateFill();
		this.rabbitmq.bind(val[0],function(data) {
					  console.log("callback " + data);
					  
					  //object._gauge.setNativeProps({fill:{data}});
					  object.setState({temp: data.temp, preTemp: object.state.temp, humidity: data.humidity, preHumidity: object.state.humidity, battery: data.battery, preBattery: object.state.battery});
					 /*Animated.timing(object.state.deviceData, {
						  duration: 500,
						  toValue: data,
						  useNativeDriver: false
					 }).start();*/
					 /*Animated.spring(
					  chartFillAnimation,
					  {
						toValue: data,
						tension,
						friction
					  }
					).start();*/
					 //object.refs.circularProgress.changeFill(data);
					 
				  });
		
		this.state.oldSelectedDevice=val[0];
		
		fetch('http://www.roboxhub.com:32731/api/1.0/deviceData/lastMessage/' + val[0],{ json: true , headers: {"Authorization": "Bearer " + object.token}})
				.then((response) => response.json())
				.then((responseJson) => {
					console.log(responseJson);
					var t = responseJson._embedded.result[0].data.temp;
					var h = responseJson._embedded.result[0].data.humidity;
					var b = responseJson._embedded.result[0].data.battery;
					object.setState({temp: t, preTemp: 0, humidity: h, preHumidity: 0, battery: b, preBattery: 0});
				});
	}
	componentDidMount() {
				
		var object=this;
		this.rabbitmq=new RabbitMq();
		
		fetch('http://www.roboxhub.com:32731/api/1.0/auth/oauth/token?grant_type=password',
			{ 
			method: 'POST', 
			json: true, 
			headers: {
				'Accept': 'application/json',
				'Authorization': 'Basic Y2xpZW50OnNlY3JldA==', 
				'Content-type': 'application/x-www-form-urlencoded'
				}, 
			body: 'username=itest&password=1234&grant_type=password'})
		.then((response) => response.json())
		.then((responseJson) => {
			console.log('auth');
			console.log(responseJson);
			object.token=responseJson.access_token;

			fetch('http://www.roboxhub.com:32731/api/1.0/devices',{ json: true , headers: {"Authorization": "Bearer " + object.token}})
				.then((response) => response.json())
				.then((responseJson) => {
					console.log(responseJson);
					var devices=[];
					var selectedDevice;
					var i=0;
				  responseJson._embedded.deviceList.map(function(device){
					  if (i==0) {
						  selectedDevice=[device.name];
						  
						  fetch('http://www.roboxhub.com:32731/api/1.0/deviceData/lastMessage/' + device.name,{ json: true , headers: {"Authorization": "Bearer " + object.token}})
							.then((response) => response.json())
							.then((responseJson) => {
								console.log(responseJson);
								var t = responseJson._embedded.result[0].data.temp;
								var h = responseJson._embedded.result[0].data.humidity;
								var b = responseJson._embedded.result[0].data.battery;
								object.setState({temp: t, preTemp: 0, humidity: h, preHumidity: 0, battery: b, preBattery: 0});
							});
						  
						  
						  
						  
						  i++;
					  }
					  devices.push({value:device.name, label:device.name, children:[]});
				  });
				  console.log(devices);
				  object.setState({devices: devices, selectedDevice: selectedDevice, oldSelectedDevice: selectedDevice[0]});
				  object.rabbitmq.bind(selectedDevice[0],function(data) {
					  console.log("callbackfirst " + data);
					  
					  //object._gauge.setNativeProps({fill:{data}});
					  object.setState({temp: data.temp, preTemp: object.state.temp, humidity: data.humidity, preHumidity: object.state.humidity, battery: data.battery, preBattery: object.state.battery});
					 /*Animated.timing(object.state.deviceData, {
						  duration: 500,
						  toValue: data,
						  useNativeDriver: false
					 }).start();*/
					 /*Animated.spring(
					  chartFillAnimation,
					  {
						toValue: data,
						tension,
						friction
					  }
					).start();*/
					 //object.refs.circularProgress.changeFill(data);
					 
				  });
				})
				.catch((error) => {
				  console.error(error);
				});
				object.state.temp=0;
				object.state.humidity=0;
				object.state.battery=0;
				object.refs.circularProgressTemperature.animateFill();
				object.refs.circularProgressHumidity.animateFill();
				object.refs.circularProgressBattery.animateFill();
				//var socket = new MyWebSocket();
				  //socket.connect();
				  
				  object.rabbitmq.connect();
		});
		
		
		  
	  }
	  
	  componentWillUnmount() {
    this.rabbitmq.deleteQueue();
  }
	_handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!');
	  this.rabbitmq.deleteQueue();
    }
    this.setState({appState: nextAppState});
  }
	  
	render() {

		return (
			
<View style={{marginBottom:50}} >
			<ScrollView style={{padding: 20}}>
				
				<Picker data={this.state.devices} cols={1} value={this.state.selectedDevice} className="forss"
				onPickerChange={this.onPickerChange} onOk={this.onValueChange} >
				  <List.Item arrow="horizontal">Select Device</List.Item>
				</Picker>
				<View style={{margin:10}} />
				
				<AnimatedGaugeProgress
				  ref='circularProgressTemperature'
				  size={200}
				  width={15}
				  prefill={this.state.preTemp}
				  fill={this.state.temp}
				  rotation={90}
				  cropDegree={90}
				  tintColor="#4682b4"
				  backgroundColor="#b0c4de"
				  stroke={[4, 2]} //For a equaly dashed line
				  strokeCap="butt" >
				  
				  <View style={styles.textView}>
					<Text style={styles.text}>Temperature{"\n"}</Text>
					<Text style={styles.text}>{this.state.temp}°C</Text>
					</View>
				</AnimatedGaugeProgress>
				
				<View style={{margin:10}} />
				
				<AnimatedGaugeProgress
				  ref='circularProgressHumidity'
				  size={200}
				  width={15}
				  prefill={this.state.preHumidity}
				  fill={this.state.humidity}
				  rotation={90}
				  cropDegree={90}
				  tintColor="#4682b4"
				  backgroundColor="#b0c4de"
				  stroke={[4, 2]} //For a equaly dashed line
				  strokeCap="butt" >
				  
				  <View style={styles.textView}>
					<Text style={styles.text}>Humidity{"\n"}</Text>
					<Text style={styles.text}>%{this.state.humidity}</Text>
					</View>
				</AnimatedGaugeProgress>
				
				<View style={{margin:10}} />
				
				<AnimatedGaugeProgress
				  ref='circularProgressBattery'
				  size={200}
				  width={15}
				  prefill={this.state.preBattery}
				  fill={this.state.battery}
				  rotation={90}
				  cropDegree={90}
				  tintColor="#4682b4"
				  backgroundColor="#b0c4de"
				  stroke={[4, 2]} //For a equaly dashed line
				  strokeCap="butt" >
				  
				  <View style={styles.textView}>
					<Text style={styles.text}>Battery{"\n"}</Text>
					<Text style={styles.text}>%{Math.floor(this.state.battery/30)}</Text>
					</View>
				</AnimatedGaugeProgress>

				
				
		    </ScrollView>
			<TabBarExample style={{margin:10}}/>
			</View>
        )
	}
}

const styles = StyleSheet.create({
	
  textView: {
    position: 'absolute',
    top: textOffset,
    left: textOffset,
    width: textWidth,
    height: textHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
  },
});