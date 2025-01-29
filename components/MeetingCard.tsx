import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
type MeetingCardProps = {
    name?: string,
    id?: string,
    onClick:()=>void
}

const MeetingCard = (props : MeetingCardProps) => {
  return (
    <LinearGradient colors={['#D84040','tomato']} style={[styles.container]}>
        <View style={{flexDirection:'row'}}>
      <Text style={[styles.text,{fontSize:20}]}>{props.name}'s Room</Text>
        </View>
        <Text style={{alignSelf:'flex-end',fontFamily:'Nunito-Bold',fontSize:16,color:'white',paddingBottom:8}}>Join Call</Text>
        <Ionicons onPress={()=>props.onClick()} name='call' size={30} color={'#D84040'} style={{alignSelf:'flex-end',borderColor:'white',borderWidth:StyleSheet.hairlineWidth,borderRadius:50,padding:10,backgroundColor:'white'}} />
    </LinearGradient>
  )
}

export default MeetingCard

const styles = StyleSheet.create({
container:{
    height:'auto',
    width:'45%',
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