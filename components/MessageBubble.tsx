import React from "react";
import { View, Text, StyleSheet } from "react-native";

const MessageBubble = ({ name, isSender,msg }) => {
  // const isSender = msg.sender === senderName;

  return (
    <View style={[styles.messageContainer, isSender ? styles.alignRight : styles.alignLeft]}>
      <View style={[styles.messageBubble, isSender ? styles.senderBubble : styles.receiverBubble]}>
        <Text style={[styles.senderText,{alignSelf:isSender ? 'flex-end' : 'flex-start',color:isSender ? '#006400' : '#1e40af'}]}>
          {isSender ? "You" : name}
        </Text>
        <Text style={[styles.messageText,{color:isSender ? '#006400' : '#1e40af'}]}>{msg}</Text>
        {/* <Text style={styles.timestamp}>{new Date(msg.timestamp).toLocaleTimeString()}</Text> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: "row",
    marginBottom: 8,
    marginHorizontal:8
  },
  alignRight: {
    justifyContent: "flex-end",
  },
  alignLeft: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxWidth: "80%",
  },
  senderBubble: {
    backgroundColor: "#d1fadf",
    alignSelf: "flex-end",
  },
  receiverBubble: {
    backgroundColor: "#bfdbfe",
    alignSelf: "flex-start",
  },
  senderText: {
    fontFamily:'Nunito-Bold'
  },
  messageText: {
    fontSize: 14,
    color:'#008000',
    fontFamily:'Nunito-Regular'
  },
  timestamp: {
    fontSize: 10,
    color: "gray",
    marginTop: 4,
    alignSelf: "flex-end",
  },
});

export default MessageBubble;