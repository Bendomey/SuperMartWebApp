import React from 'react'
import { View, Text, Modal, TouchableOpacity, TextInput, StatusBar, Platform, KeyboardAvoidingView, Image, ScrollView, ActivityIndicator } from 'react-native'
import { Header } from 'components'
import { HomeStyle, RegisterStyle, ProfileStyle } from 'styles'
import Icon from 'react-native-vector-icons/Ionicons'
import { RaisedTextButton } from 'react-native-material-buttons'
import ModalNew from 'react-native-modal'
import NetInfo from "@react-native-community/netinfo"
import { emailChecker } from 'constants'
import { UPDATE_PROFILE, UPDATE_PASSWORD } from 'react-native-dotenv'
import AsyncStorage from '@react-native-community/async-storage'
import fetch from 'react-native-fetch-polyfill'

export default class EditProfile extends React.Component{
	subscription = null

	constructor(props) {
	  super(props);
	
	  this.state = {
	  	visibility:false,
	  	networkVisibility:false,
	  	visibilitySearch:false,
	  	search:'',
	  	id:'',
	  	fullName:'',
	  	contact:'',
	  	email:'',
	  	password:'',
      image:require('../assets/avatar.jpg'),
	  	confirmPassword:'',
	  	errorMsg:'',
	  	oldPassword:'',
	  	data:null,
	  	isConnected:false,
	  	errorMsgProfile:'',
	  	errorMsgPassword:'',
	  	showMessage:false
	  };
	}

	componentDidMount(){
        //check the network
        const listener = data => {
          NetInfo.isConnected.fetch().then(isConnected => {
            this.setState({isConnected})
          })
        }
        subscription = NetInfo.addEventListener('connectionChange',listener);     
	}

	componentWillMount(){
		let data = this.props.navigation.getParam('userData','user data')
		this.setState({
			fullName:data.customer_name,
			contact:data.customer_contact,
			email:data.customer_email,
			id:data.id
		})
	}

	componentWillUnMount(){
		subscription = NetInfo.removeEventListener('connectionChange')
		this.setState({showMessage:false})
	}

    storeData = (key, value) => {
      AsyncStorage.setItem(key,value)
    }


    updateData = (key) => {
      AsyncStorage.getItem(key)
      .then(data => {
      	let newData = JSON.parse(data)
      	newData.customer_name = this.state.fullName
      	newData.customer_contact = this.state.contact
      	newData.customer_email = this.state.email

      	this.storeData('user',JSON.stringify(newData))
      }).done()
    }

    updateSecurity = (key) => {
    	AsyncStorage.getItem(key)
    	.then(data => {
    		let newData = JSON.parse(data)
    		newData.customer_password = this.state.password

    		this.storeData('user',JSON.stringify(newData))
    	}).done()
    }

	saveProfileChanges = () => {
		const { fullName, contact, email, isConnected, id, image } = this.state
        //check the network
        const listener = data => {
          NetInfo.isConnected.fetch().then(isConnected => {
            this.setState({isConnected})
          })
        }
        const subscription = NetInfo.addEventListener('connectionChange',listener);     
        if(isConnected){
        	if(fullName == ''){
          		this.setState({errorMsgProfile: 'Name field cannot be empty'});
        	}else if(contact == ''){
          		this.setState({errorMsgProfile: 'Contact field cannot be empty'});
        	}else if(email == '') {
          		this.setState({errorMsgProfile: 'Email field cannot be empty'});
        	}else if(!emailChecker.test(email)){
          		this.setState({errorMsgProfile: 'Pleae enter a valid email'});
        	}else{
          		this.setState({errorMsgProfile: '', visibility: true});
          		//go to server
          		fetch(UPDATE_PROFILE,{
                timeout:3000,
          			method:'POST',
          			headers:{
          				'Accept':'application/json',
          				'Content-Type':'application/json'
          			},
          			body:JSON.stringify({
          				id,
          				name:fullName,
          				email,
          				contact,
                  customer_img:image
          			})
          		})
          		.then(data => data.json)
          		.then(data => {
          			if(data){
          				this.updateData('user')
          				this.setState({
          					visibility:false,
          					showMessage:true
          				})
          			}else{
          				this.setState({visibility:false,errorMsgProfile:'User doesnt exist'})
          			}
          		})
              .catch(err => {
                this.setState({visibility:false,errorMsgProfile:"No Internet Connection"})
              })

        	}
        }else{
          this.setState({networkVisibility: true});
        }
	}

	savePasswordChanges = () => {
		const { password, confirmPassword, isConnected, id, oldPassword } = this.state
        //check the network
        const listener = data => {
          NetInfo.isConnected.fetch().then(isConnected => {
            this.setState({isConnected})
          })
        }
        const subscription = NetInfo.addEventListener('connectionChange',listener);
        if(isConnected){
        	if(oldPassword == ''){
        		this.setState({errorMsgPassword:'Old password field cannot be empty'})
        	}else
        	if(password == ''){
        		this.setState({errorMsgPassword:'Password field cannot be empty'})
        	}else if(confirmPassword == ''){
        		this.setState({errorMsgPassword:'Confirm password field cannot be empty'})
        	}else if(password != confirmPassword){
        		this.setState({errorMsgPassword:'The password fields are not equal'})
        	}else{
          		this.setState({errorMsgPassword: '', visibility: true});
        		//move to the server side
        		fetch(UPDATE_PASSWORD,{
              timeout:3000,
        			method:'POST',
        			headers:{
        				'Accept':'application/json',
        				'Content-Type':'application/json'
        			},
        			body:JSON.stringify({
        				id,
        				old_password:oldPassword,
        				new_password:password
        			})
        		})
        		.then(data => data.json())
        		.then(data => {
        			if(data == true){
        				this.updateSecurity('user')
        				this.setState({
          					visibility:false,
          					showMessage:true,
          					oldPassword:'',
          					password:'',
          					confirmPassword:''
          				})
        			}else if(data == false){
        				this.setState({showMessage:false,visibility:false,errorMsgPassword:'Old password entered is wrong'})
        			}
        		})
            .catch(err => {
              this.setState({visibility:false,errorMsgPassword:"No Internet Connection"})
            })
        	}
        }else{
        	this.setState({networkVisibility:true})
        }

	}

	_handleOpenDrawer = () => {
      alert('open drawer')
    }

    _handleOpenSearchStack = () => {
      this.setState({visibilitySearch: true})
    }

    _handleOpenNotificationModal = () => {
      alert('notification')
    }

    _handleCloseSearchModal = () => {
      this.setState({visibilitySearch: false})
    }

    _closeNetworkModal = () => {
      this.setState({networkVisibility: false})
    }

    showMessage = () => {
    	return(
    		<View style={{height:50,justifyContent:'center',alignItems:'center',backgroundColor: '#5cb85c',marginTop:10,marginHorizontal: 20,paddingHorizontal: 15,borderRadius:10}} >
    			<Text style={{color:'#fff',fontFamily: 'arial'}}>
    				Your changes would be applied on your next visit to this application
    			</Text>
    		</View>
    	)
    }


	render() {
		const { image, showMessage, visibilitySearch, visibility, networkVisibility, search, fullName, contact, email, password, confirmPassword, errorMsgProfile, oldPassword, errorMsgPassword } = this.state
		return (
			<View style={HomeStyle.container} >
				<StatusBar backgroundColor="red" barStyle="light-content"/>
          		<Header _openDrawer={this._handleOpenDrawer} openSearchStack={this._handleOpenSearchStack} openNotification={this._handleOpenNotificationModal} />
	        	<ScrollView>
	        		{(showMessage === true) && this.showMessage()}
	          		<View style={{justifyContent:'center',alignItems:'center', marginVertical:20}}>
		                <Image source={image} style={ProfileStyle.image} />
		            </View>
		            <View style={{marginHorizontal: 30, marginVertical:5, borderBottomWidth:1, paddingRight: 30, paddingBottom: 5, justifyContent:'space-between',alignItems: 'center', flexDirection:'row'}}>
		            	<Text style={{color: '#000', fontWeight: 'bold'}}>PROFILE SETTINGS</Text>
		                <Icon name={Platform.OS == 'android' ? 'md-home' : 'ios-pencil-alt'} color={"red"} size={20} style={{position: 'relative', left: 25}} />  	
		            </View>
	          		<KeyboardAvoidingView>
			            <View style={RegisterStyle.textInputView}>
			              <View style={{flexDirection: 'row', marginBottom: 8,justifyContent: 'center', alignItems: 'center',}}>
			                <Icon name={Platform.OS == 'android' ? 'md-contact' : 'ios-contact'} color={"black"} size={Platform.OS == "android" ? 20 : 1} style={{position: 'relative', left: 25}} />
			                <TextInput style={RegisterStyle.textViewNode} placeholderTextColor={"black"} value={fullName} onChangeText={(value) => this.setState({fullName: value})} placeholder={"Full Name"} underlineColorAndroid={'#bfbfbf'} />
			              </View>
			              <View style={{flexDirection: 'row', marginBottom: 8,justifyContent: 'center', alignItems: 'center',}}>
			                <Icon name={Platform.OS == 'android' ? 'md-call' : 'ios-call'} color={"black"} size={Platform.OS == "android" ? 20 : 1} style={{position: 'relative', left: 25}} />
			                <TextInput style={RegisterStyle.textViewNode} placeholderTextColor={"black"} value={contact} onChangeText={(value) => this.setState({contact: value})} placeholder={"Contact"} keyboardType={"number-pad"} underlineColorAndroid={'#bfbfbf'} />
			              </View>
			              <View style={{flexDirection: 'row', marginBottom: 8,justifyContent: 'center', alignItems: 'center',}}>
			                <Icon name={Platform.OS == 'android' ? 'md-mail' : 'ios-mail'} color={"black"} size={Platform.OS == "android" ? 20 : 1} style={{position: 'relative', left: 25}} />
			                <TextInput style={RegisterStyle.textViewNode} placeholderTextColor={"black"} value={email} onChangeText={(value) => this.setState({email: value})} placeholder={"Email"} keyboardType={'email-address'} underlineColorAndroid={'#bfbfbf'} />
			              </View>
			            </View>
			        </KeyboardAvoidingView>
		            <View style={{justifyContent: 'center', alignItems: 'center', marginBottom: 10,marginTop: 0}}>
		              <Text style={{color: 'red',fontSize: 12}}>{errorMsgProfile}</Text>
	              		<RaisedTextButton title={"Save Changes"} onPress={this.saveProfileChanges} style={{width: '80%', borderRadius: 5,}} color={"red"} titleColor={'#fff'} shadeColor={"#fff"}/>
		            </View>

		            <View style={{marginHorizontal: 30, marginTop:20, marginBottom:5, borderBottomWidth:1, paddingRight: 30, paddingBottom: 5, justifyContent:'space-between',alignItems: 'center', flexDirection:'row'}}>
		            	<Text style={{color: '#000', fontWeight: 'bold'}}>PROFILE SETTINGS</Text>
		                <Icon name={Platform.OS == 'android' ? 'md-cog' : 'ios-cog'} color={"red"} size={20} style={{position: 'relative', left: 25}} />  	
		            </View>
		            <KeyboardAvoidingView>
		            	<View style={RegisterStyle.textInputView}>
		            		<View style={{flexDirection: 'row', marginBottom: 8, justifyContent: 'center', alignItems: 'center',}}>
				                <Icon name={Platform.OS == "android" ? 'md-key' : 'ios-key'} color={"black"} size={Platform.OS == "android" ? 20 : 1} style={{position: 'relative', left: 25}} />
				                <TextInput style={RegisterStyle.textViewNode} placeholderTextColor={"black"} value={oldPassword} onChangeText={(value) => {this.setState({oldPassword:value})}} placeholder={"Old Password"} secureTextEntry={true} underlineColorAndroid={'#bfbfbf'} />
				            </View>
			            	<View style={{flexDirection: 'row', marginBottom: 8, justifyContent: 'center', alignItems: 'center',}}>
				                <Icon name={Platform.OS == "android" ? 'md-key' : 'ios-key'} color={"black"} size={Platform.OS == "android" ? 20 : 1} style={{position: 'relative', left: 25}} />
				                <TextInput style={RegisterStyle.textViewNode} placeholderTextColor={"black"} value={password} onChangeText={(value) => {this.setState({password:value})}} placeholder={"New Password"} secureTextEntry={true} underlineColorAndroid={'#bfbfbf'} />
				            </View>
				            <View style={{flexDirection: 'row', marginBottom: 8, justifyContent: 'center', alignItems: 'center',}}>
				                <Icon name={Platform.OS == "android" ? 'md-key' : 'ios-key'} color={"black"} size={Platform.OS == "android" ? 20 : 1} style={{position: 'relative', left: 25}} />
				                <TextInput style={RegisterStyle.textViewNode} placeholderTextColor={"black"} value={confirmPassword} onChangeText={(value) => {this.setState({confirmPassword:value})}} placeholder={"Confirm New Password"} secureTextEntry={true} underlineColorAndroid={'#bfbfbf'} />
				            </View>
				           </View>
		            </KeyboardAvoidingView>
		            <View style={{justifyContent: 'center', alignItems: 'center',marginTop: 0}}>
			            <Text style={{color: 'red',fontSize: 12}}>{errorMsgPassword}</Text>
	              		<RaisedTextButton title={"Save Changes"} onPress={this.savePasswordChanges} style={{width: '80%', borderRadius: 5,marginVertical:5}} color={"red"} titleColor={'#fff'} shadeColor={"#fff"}/>
		            </View>

					<Modal visible={visibilitySearch} animationType={"fade"}>
			            <View style={HomeStyle.modalHeader}>
			              <TouchableOpacity onPress={this._handleCloseSearchModal}>
			                <Icon name={Platform.OS == 'android' ? 'md-arrow-round-back' : 'ios-arrow-round-back'} size={Platform.OS == 'android' ? 25 : 1} color={'#000'} />
			              </TouchableOpacity>
			              <TextInput autoFocus={true} returnKeyType={'search'} style={HomeStyle.textViewNode} placeholderTextColor={"black"} value={search} onChangeText={(value) => this.setState({search: value})} placeholder={"Search something..."} />
			            </View>
			        </Modal>

			        {/*For network connection*/}
		            <ModalNew isVisible={networkVisibility} animationIn="slideInUp" animationInTiming={700} animationOut="bounceOutDown" animationOutTiming={1000} onBackButtonPress={()=>this.setState({networkVisibility:!networkVisibility})}>
		              <View style={{ backgroundColor: '#fff', borderRadius: 10 }}>
		                <View style={{justifyContent: 'center', alignItems: 'center'}}>
		                  <Icon name={Platform.OS == 'android' ? 'md-bug' : 'ios-bug'} size={30} color={"orange"} />
		                </View>
		                <View style={{height: 160, width: '100%',flexDirection: 'column', justifyContent: 'space-between',alignItems: 'center', marginVertical: 10}}>
		                  <Text style={{fontSize: 25}}>Ooops!!</Text>
		                  <View style={{paddingHorizontal: 10}}>
		                    <Text style={{textAlign: 'center'}}>Sorry, this device is not connected to the internet.Please connect and try again</Text>
		                  </View>
		                  <RaisedTextButton title={"OK"} onPress={this._closeNetworkModal} style={{width: '90%', borderRadius: 10,}} color={"red"} titleColor={'#fff'} shadeColor={"#fff"}/>
		                </View>
		              </View>
		            </ModalNew>

		            {/*For authentication*/}
		            <ModalNew isVisible={visibility} animationIn="slideInLeft" animationInTiming={1000} animationOut="bounceOutUp" animationOutTiming={1000}>
		              <View style={{ height: 150, width: '100%', backgroundColor: '#fff', borderRadius: 15, }}>
		                <View style={{flex:1,justifyContent: 'center', alignItems: 'center'}}>
		                  <ActivityIndicator size={50} color='red' />
		                </View>
		              </View>
		            </ModalNew>
				</ScrollView>
			</View>
		)
	}
}