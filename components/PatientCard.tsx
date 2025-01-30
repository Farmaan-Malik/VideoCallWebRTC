import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
type MeetingCardProps = {
    name?: string,
    onClick:()=>void,
    gender:string,
    age:number,
    diagnosis:string,
    phone:string
}

const PatientCard = (props : MeetingCardProps) => {
  return (
    <LinearGradient colors={['#D84040','tomato']} style={[styles.container,{flexDirection:'row',justifyContent:'space-between'}]}>
        <View>
        <View style={{flexDirection:'row'}}>
      <Text style={[styles.text,{fontSize:18}]}>Name: {props.name}</Text>
        </View>
        <View style={{flexDirection:'row'}}>
        <Text style={{fontFamily:'Nunito-Bold',fontSize:16,color:'white',paddingBottom:8}}>{props.age}, </Text>
        <Text style={{fontFamily:'Nunito-Bold',fontSize:16,color:'white',paddingBottom:8}}>{props.gender}</Text>
</View>

        <Text style={{fontFamily:'Nunito-Bold',fontSize:14,color:'white',paddingBottom:8}}>Diagnosis: {props.diagnosis}</Text>
        <Text style={{fontFamily:'Nunito-Bold',fontSize:14,color:'white',paddingBottom:8}}>Phone:{props.phone}</Text>
        </View>
        {/* <View style={{height:'100%',borderWidth:StyleSheet.hairlineWidth,borderColor:'white'}}></View> */}
        <View style={{alignItems:'center',justifyContent:'center',borderLeftWidth:StyleSheet.hairlineWidth,paddingLeft:20,borderColor:'white'}}>
        <Text style={{alignSelf:'flex-end',fontFamily:'Nunito-Bold',fontSize:16,color:'white',paddingBottom:8}}>Start Call</Text>
        <Ionicons onPress={()=>props.onClick()} name='call' size={30} color={'#D84040'} style={{alignSelf:'flex-end',borderColor:'white',borderWidth:StyleSheet.hairlineWidth,borderRadius:50,padding:10,backgroundColor:'white'}} />
    
        </View>
      </LinearGradient>
  )
}
export default PatientCard

const styles = StyleSheet.create({
container:{
    height:'auto',
    // width:'98%',
    borderRadius:20,
    padding:18,
    margin:2,
    backgroundColor:'white',
    marginVertical:8,
    marginHorizontal:8,
    shadowColor:'black',
    shadowOffset:{width:0,height:2},
    shadowOpacity:0.5,
    shadowRadius:4,
    elevation:10,
},
text:{
    color:'white',
    fontSize:16,
    fontFamily:'Nunito-SemiBold'
},
key:{
    fontFamily:'Nunito-ExtraBold'
}
})