import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Footer from './footer';
import AsyncStorage from '@react-native-async-storage/async-storage';



const ReportScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
 

  const retrieveUserNameAndId = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString !== null) {
        const userData = JSON.parse(userDataString);
        const { userName } = userData;
        setUserName(userName);
        const spiltFlatno = userName.split(' ');
        const Flatno = spiltFlatno[1];
        console.log('Flatno:', Flatno);
       
        fetchReports(Flatno);
       
     
   

       
      } else {
        console.log('No user data found');
      }
    } catch (error) {
      console.error('Error retrieving user data:', error);
    }
  };

  const [reports, setReports] = useState([]);

  useEffect(() => {
    retrieveUserNameAndId();
    
  }, []);

  const fetchReports = async (Flatno) => {
    try {
      const response = await fetch(`http://zengap.duckdns.org:3000/ahp/data/allday/AHP${Flatno}*`);
      if (!response.ok) {
        throw new Error('Failed to fetch reports: ' + response.statusText);
      }
      const data = await response.json();

      // Format the date to remove the time part
      const formattedData = Object.entries(data).map(([date, consumption]) => ({
        consumption_date: date,
        daily_consumption: parseFloat(consumption).toFixed(2) // Format consumption to have 2 decimal places
      }));

      setReports(formattedData);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Consumption Report</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>Date</Text>
          <Text style={styles.headerText}>Consumption(ltrs)</Text>
        </View>
        <FlatList
          data={reports}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={styles.date}>{item.consumption_date}</Text>
              <Text style={styles.consumption}>{item.daily_consumption}</Text>
            </View>
          )}
        />
      </View>
      <Footer navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
    textAlign: 'center',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
  },
  headerText: {
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  date: {
    flex: 1,
  },
  consumption: {
    flex: 1,
    textAlign: 'right',
  },
});

export default ReportScreen;
