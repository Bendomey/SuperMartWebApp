import React from 'react'
import { View, Text, Platform, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

const list = (props) => {
	return(
		<TouchableOpacity style={{width: '100%',justifyContent:'space-between', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5, marginBottom: 20, }}>
			<View style={{}}>
				<Text style={{fontSize: 15, color: '#000', fontWeight: 'bold'}}>{props.title}</Text>
			</View>
			<Icon name={Platform.OS == 'android' ? 'md-arrow-forward' : 'ios-arrow-forward'} size={20} color='gray' />
		</TouchableOpacity>
	)
}


export default list