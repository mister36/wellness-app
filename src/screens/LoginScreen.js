import React, {useState} from 'react';
import {View, Text, StyleSheet, StatusBar, Pressable} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {authHeader, thinFont} from '../styles/uiStyles';

import axiosBase from '../utils/axiosBase';

// Components
import AuthTextInput from '../components/AuthTextInput';
import Spacer from '../components/Spacer';
import ActionButton from '../components/ActionButton';

const LoginScreen = ({navigation}) => {
  const colors = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    try {
      const results = await axiosBase.post('/user/login', {
        email,
        password,
      });

      navigation.navigate('Main');
      console.log(results.data);
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

          <Text style={styles.header}>Login</Text>
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
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          style={[styles.textInput]}
          secureTextEntry
        />

        <Spacer margin={hp(5)} />
        <ActionButton
          text="Sign In"
          color1="#F39772"
          color2={colors.colors.primary}
          style={styles.button}
          textStyle={{color: 'white'}}
          onPress={login}
          loading={loading}
        />

        <Spacer margin={hp(10)} />
        <Text style={styles.bottomText}>
          Have no account?{' '}
          <Text
            onPress={() => navigation.navigate('Signup')}
            style={{fontFamily: 'Montserrat-Bold', color: '#E6705A'}}>
            Sign up
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
    fontSize: wp(4),
  },
});

export default LoginScreen;
