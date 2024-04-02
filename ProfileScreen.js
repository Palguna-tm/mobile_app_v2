import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Footer from './footer';
import AsyncStorage from '@react-native-async-storage/async-storage';




const ProfileScreen = ({navigation}) => {

  const [userName, setUserName] = useState('');
const [userEmail, setUserEmail] = useState('');

  const retrieveUserNameAndId = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString !== null) {
        const userData = JSON.parse(userDataString);
        const { userName, email  } = userData;
        setUserName(userName);
        setUserEmail(email);
      } else {
        console.log('No user data found');
      }
    } catch (error) {
      console.error('Error retrieving user data:', error);
    }
  };
 

  useEffect(() => {
    retrieveUserNameAndId();
    
  }, []);

 
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>
     
       
      
        <View style={styles.profileContainer}>
          <Image
            
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.label}>User Flat no:</Text>
            <Text style={styles.info}>{userName}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.info}>{userEmail}</Text>
          </View>
          
        
        </View>
     
      <Footer navigation={navigation}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  info: {
    fontSize: 18,
  },
});

export default ProfileScreen;
