import {
    View,
    TextInput,
    KeyboardTypeOptions,
    TextInputProps,
    StyleProp,
    ViewStyle,
    TextStyle
} from "react-native";
import React, {forwardRef} from "react";
import Ionicons from "@expo/vector-icons/Ionicons";

interface Props extends TextInputProps {
    placeholder: string,
    keyboardType?: KeyboardTypeOptions,
    onChangeText: (text: string) => void,
    style?:StyleProp<TextStyle>,
    containerStyle?:StyleProp<ViewStyle>,
    icon?:boolean,
    iconName?:keyof typeof Ionicons.glyphMap,
    onIconClick?:() => void,
}


const CustomTextInput= forwardRef<TextInput, Props>((props, ref) => {
    return (
        <View
            style={[{
                height: 50,
                margin: 5,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 20,
                shadowColor:'grey',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 8,
                flexDirection:'row',
            },
            props.containerStyle]}
        >
            <TextInput
                style={[{
                    backgroundColor: "white",
                    width: "100%",
                    height: "100%",
                    // paddingHorizontal: 20,
                    overflow: 'scroll',
                    borderRadius: 20,
                    fontFamily:'Nunito-Regular'
                },
                props.style
                ]}
                {...props}
                ref={ref}
                autoCapitalize='none'
                autoCorrect={false}
                onChangeText={(value) => {
                    props.onChangeText(value);
                }}
            />
            {props.icon &&
            <Ionicons size={15} onPress={props.onIconClick} style={{marginRight:10}} name={props.iconName}/>}
        </View>
    );
});

export default CustomTextInput;
