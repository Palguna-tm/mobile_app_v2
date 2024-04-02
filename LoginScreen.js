import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ImageBackground, Image, Linking, Modal, Dimensions, ActivityIndicator } from 'react-native'; // Import ActivityIndicator
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const [animatedText, setAnimatedText] = useState('');
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true); // State variable for loading animation

  useEffect(() => {
    startAnimation([
      'We are EXOZEN,We Build IoT Solutions.!',
      'We are EXOZEN,We Create IoT Solutions.!',
      'We are EXOZEN,We Develop IoT Solutions.!'
    ]);

    getGreetingAnimation();
    // Check if user data exists in AsyncStorage
    checkUserData();
  }, []);

  const checkUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        // User data exists, navigate to Home page
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Error checking user data:', error);
    } finally {
      setLoading(false); // Hide loading animation
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 12) {
      return ' Good Morning...! ☀️';
    } else if (hour >= 12 && hour < 16) {
      return ' Good Afternoon...! 🌤️';
    } else if (hour >= 16 && hour < 22) {
      return ' Good Evening...! 🌙';
    } else {
      return ' Good Night..! 🌜';
    }
  };

  const getGreetingAnimation = () => {
    const greetingText = getGreeting();
    let animatedGreeting = '';
    let index = 0;
    const interval = setInterval(() => {
      if (index < greetingText.length) {
        animatedGreeting += greetingText[index];
        setGreeting(animatedGreeting);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100); 
  };

  const handleLogin = () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      setModalVisible(true);
      return;
    }
  
    const apiUrl = 'http://zengap.duckdns.org:3000/auth/login'; // Base URL
  
    const userData = {
      email: email,
      password: password,
    };
  
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })
    .then(response => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error('Invalid email or password');
      }
    })
    .then(data => {
      if (data.status === "success") {
        console.log('Login successful');
  
        const { token, data: userData } = data;
  
        AsyncStorage.setItem('token', token);
        AsyncStorage.setItem('userData', JSON.stringify(userData));
  
        navigation.navigate('Home');
      } else {
        throw new Error('Invalid email or password');
      }
    })
    .catch(error => {
      console.error('Error during login:', error);
      setError(error.message);
      setModalVisible(true);
    });
  };
  

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const startAnimation = async (sentences) => {
    for (let j = 0; j < sentences.length; j++) {
      let newText = '';
      const text = sentences[j];
      for (let i = 0; i < text.length; i++) {
        newText += text[i];
        setAnimatedText(newText);
        await new Promise(resolve => setTimeout(resolve, 50)); 
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  return (
    <ImageBackground
      source={require('./images/3.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      {loading ? ( // Display loading animation if loading is true
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0095f6" />
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.inputContainer}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{greeting}</Text>
            </View>
            <View style={styles.logoContainer}>
              <Image source={require('./images/logo.png')} style={styles.logo} />
            </View>
            <TextInput
              style={styles.input}
              placeholderTextColor="#666"
              placeholder="Email"
              onChangeText={(text) => setEmail(text)}
              value={email}
            />
            <TextInput
              style={styles.input}
              placeholderTextColor="#666"
              placeholder="Password"
              secureTextEntry
              onChangeText={(text) => setPassword(text)}
              value={password}
            />
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Sign In </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('http://www.exozen.in')}>
              <Text style={styles.websiteLink}>www.exozen.in</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{error}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(false);
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Animated text */}
      <Text style={styles.animatedText}>{animatedText}</Text>
      {/* Centered text */}
    </ImageBackground>
  );
};

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingContainer: {
    marginBottom: 20, 
  },
  greeting: {
    fontSize: 18,
    color: 'blue',
    fontWeight: 'bold',
    textAlign: 'center', 
    marginBottom: 10, 
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 30,
    width: '80%',
    justifyContent: 'center', // Changed from 'flex-start'
    alignItems: 'center', // Changed from 'flex-start'
  },
  logoContainer: {
    alignSelf: 'center', // Changed from 'flex-end'
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
  },
  input: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    color: 'black',
  },
  loginButton: {
    backgroundColor: '#0095f6',
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  forgotPassword: {
    color: 'black',
    fontSize: 16,
    textDecorationLine: 'underline',
    marginTop: 10, 
  },
  websiteLink: {
    color: 'blue',
    fontSize: 16,
    textDecorationLine: 'underline',
    marginTop: 10, // Add marginTop to create space between elements
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  animatedText: {
    position: 'absolute',
    top: 100, // Adjust top position as needed
    left: 20, // Adjust left position as needed
    fontSize: 18,
    color: 'black', // Change color to dark
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen;
