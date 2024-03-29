import React, {useState} from 'react';
import {View, Text, StyleSheet, StatusBar, Pressable} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {authHeader, thinFont} from '../styles/uiStyles';
import AsyncStorage from '@react-native-community/async-storage';

import axiosBase from '../utils/axiosBase';
import {useAuthStore} from '../zustand/store';

// Components
import AuthTextInput from '../components/AuthTextInput';
import Spacer from '../components/Spacer';
import ActionButton from '../components/ActionButton';

const SignupScreen = ({navigation}) => {
  const saveToken = useAuthStore(state => state.saveToken);
  const colors = useTheme();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signup = async () => {
    setLoading(true); // for ActivityIndicator in button
    try {
      const results = await axiosBase.post('/user/signup', {
        email,
        name,
        password,
      });

      // saves tokens into storage
      // NOTE: May want to use something like Realm in the future
      await AsyncStorage.setItem('accessToken', results.data.token);
      await AsyncStorage.setItem('refreshToken', results.data.refreshToken);
      await AsyncStorage.setItem('name', results.data.name);
      // saves accessToken in state, rerenders app to main flow
      saveToken(results.data.token);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" animated />

      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Pressable
            style={{width: styles.icon.width}}
            onPress={() => navigation.goBack()}>
            <MaterialIcons
              name="keyboard-arrow-left"
              color="black"
              style={styles.icon}
            />
          </Pressable>

          <Text style={styles.header}>Sign Up</Text>
        </View>

        <Spacer margin={hp(10)} />
        <AuthTextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          style={styles.textInput}
          autoCompleteType="email"
        />

        <Spacer margin={hp(5)} />
        <AuthTextInput
          value={name}
          onChangeText={setName}
          placeholder="First Name"
          style={[styles.textInput]}
          autoCapitalize="words"
        />

        <Spacer margin={hp(5)} />
        <AuthTextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          style={[styles.textInput]}
          secureTextEntry
        />

        <Spacer margin={hp(5)} />
        <ActionButton
          text="Sign Up"
          color1="#F39772"
          color2={colors.colors.primary}
          style={styles.button}
          textStyle={{color: 'white'}}
          onPress={signup}
          loading={loading}
        />

        <Spacer margin={hp(10)} />
        <Text style={styles.bottomText}>
          Already have an account?{' '}
          <Text
            onPress={() => navigation.navigate('Login')}
            style={{fontFamily: 'Montserrat-Bold', color: '#E6705A'}}>
            Log In
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    marginLeft: wp(7),
    marginRight: wp(7),
    // borderWidth: 2,
  },
  headerContainer: {
    marginTop: hp(3),
  },
  header: {
    ...authHeader,
  },
  icon: {
    fontSize: wp(10),
    width: wp(10),
    marginLeft: -wp(2.5),
  },
  textInput: {
    height: hp(9),
  },
  button: {
    height: hp(9),
  },
  bottomText: {
    ...thinFont,
    textAlign: 'center',
    fontSize: wp(4.12),
  },
});

export default SignupScreen;
