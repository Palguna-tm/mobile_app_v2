import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from "@react-native-async-storage/async-storage";

import Footer from './footer';
const RealTimeGraph =  ({navigation}) => {

  
  const [dailyChartData, setDailyChartData] = useState(null);
  const [weeklyChartData, setWeeklyChartData] = useState(null);
  const [monthlyChartData, setMonthlyChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedValue, setSelectedValue] = useState({ chart: null, value: null });
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [userName, setUserName] = useState("");
  const [userFlatno, setUserFlatno] = useState("");

  const [ultConsumption, setUltConsumption] = useState([0]);
const [mbConsumption, setMbConsumption] = useState([0]);
const [knConsumption, setKnConsumption] = useState([0]);

  const retrieveUserNameAndId = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString !== null) {
        const userData = JSON.parse(userDataString);
        const { userName } = userData;
        setUserName(userName);
        const spiltFlatno = userName.split(" ");
        const Flatno = spiltFlatno[1];
      
        setUserFlatno(Flatno);
        await fetchtodayData(Flatno);
        fetchData();
        fetchWeeklyData();
        fetchMonthlyData();
        
      } else {
        console.log("No user data found");
      }
    } catch (error) {
      console.error("Error retrieving user data:", error);
    }
  };


  const fetchtodayData = async (Flatno) => {
    try {
      const response = await fetch(
        `http://zengap.duckdns.org:3000/ahp/data/day/AHP${Flatno}*`
      );
      const data = await response.json();

      if (data.hasOwnProperty("totalFinalConsumption")) {
      
        const devicewisedata = data.matchingDevices;
      
          // Loop through the device data to identify ULT, MB, or KN devices
    devicewisedata.forEach(device => {
      const { device_id, final_consumption } = device;
      const consumption = parseFloat(final_consumption);
      
      // Check if the device ID ends with ULT, MB, or KN
      if (device_id.endsWith('ULT')) {
          setUltConsumption(prevUltConsumption => [...prevUltConsumption , consumption]);
          console.log('ult c array:',ultConsumption)
      } else if (device_id.endsWith('MB')) {
          setMbConsumption(prevmbConsumption =>  [...prevmbConsumption , consumption]);
          console.log('mb c array:',mbConsumption)
      } else if (device_id.endsWith('KN')) {
          setKnConsumption(prevknConsumption =>  [...prevknConsumption , consumption]);
          console.log('kn c array:',knConsumption)
      }
  });
        

        
      } else {
        console.error(
          'Error: "totalFinalConsumption" property not found in response data'
        );
      }
    } catch (error) {
      console.error("Error fetching card data:", error);
    }
  };

  useEffect(() => {
   
    const retrieveDataInterval = setInterval(() => {
      retrieveUserNameAndId();
    }, 3000);
    // Initial update
  
    return () => clearInterval(retrieveDataInterval);
  }, [ultConsumption, mbConsumption, knConsumption]);

  

  const fetchData = async () => {
    try {      
        const chartData = {
         
          datasets: [{
            data:  ultConsumption
          }]
        };
        setDailyChartData(chartData);
        setLoading(false);
     
    } catch (error) {
      console.error('Error fetching daily chart data:', error);
    }
  };

  

  const fetchWeeklyData = async () => {
    try {
     

        const chartData = {
          
          datasets: [{
            data: mbConsumption
          }]
        };
        setWeeklyChartData(chartData);
      
    } catch (error) {
      console.error('Error fetching weekly chart data:', error);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      

        const chartData = {
       
          datasets: [{
            data: knConsumption
          }]
        };
        setMonthlyChartData(chartData);
      
    } catch (error) {
      console.error('Error fetching monthly chart data:', error);
    }
  };

  const formatXLabel = (label, index) => {
    const dateObj = new Date(label);
    return `${('0' + dateObj.getDate()).slice(-2)}/${('0' + (dateObj.getMonth() + 1)).slice(-2)}`;
  };

  const chartConfig = {
    backgroundColor: '#2c3e50',
    backgroundGradientFrom: '#2c3e50',
    backgroundGradientTo: '#2c3e50',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#ffffff'
    },
    propsForLabels: {
      fontFamily: 'Arial',
      fontSize: 12,
      fontWeight: 'bold',
      fill: '#ffffff'
    },
    withHorizontalLabels: false,
    style: {
      strokeWidth: 3,
      stroke: '#ff7300',
      strokeLinecap: 'round',
    },
    contentInset: { top: 20, bottom: 20 } 
  };

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: '#34495e',
      padding: 20,
      alignItems: 'center'
    },
    heading: {
      fontSize: 24,
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: 10,
      fontWeight: 'bold'
    },
    subText: {
      fontSize: 16, 
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    tooltipContainer: {
      position: 'absolute',
      backgroundColor: '#ffffff',
      padding: 2,
      borderRadius: 5,
    },
    selectedValueText: {
      fontSize: 12,
      color: '#000000', 
      textAlign: 'center',
      marginTop: 10,
      fontWeight: 'bold'
    },
    graphContainer: {
      marginBottom: 20,
    },
    graphHeading: {
      fontSize: 20,
      color: '#ffffff',
      marginBottom: 10,
      fontWeight: 'bold'
    },
  });

  return (
    <View>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Smart Water Meter Management</Text>
      <Text style={styles.subText}>Real-time data visualizations</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : (
        <>
          <View style={styles.graphContainer}>
            <Text style={styles.graphHeading}>ULT</Text>
            {dailyChartData && (
              <View>
                <LineChart
                  data={dailyChartData}
                  width={350}
                  height={220}
                  yAxisSuffix=" l"
                  chartConfig={chartConfig}
                  bezier
                  formatXLabel={(label, index) => formatXLabel(label, index)}
                  onDataPointClick={({ value, x, y }) => {
                    setSelectedValue({ chart: 'daily', value });
                    setTooltipPosition({ x, y });
                  }}
                />
                {selectedValue.chart === 'daily' && (
                  <View style={[styles.tooltipContainer, { top: tooltipPosition.y - 40, left: tooltipPosition.x - 20 }]}>
                    <Text style={styles.selectedValueText}>{selectedValue.value} l</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={styles.graphContainer}>
            <Text style={styles.graphHeading}>MB</Text>
            {weeklyChartData && (
              <View>
                <LineChart
                  data={weeklyChartData}
                  width={350}
                  height={220}
                  yAxisSuffix=" l"
                  chartConfig={chartConfig}
                  bezier
                  formatXLabel={(label, index) => formatXLabel(label, index)}
                  onDataPointClick={({ value, x, y }) => {
                    setSelectedValue({ chart: 'weekly', value });
                    setTooltipPosition({ x, y });
                  }}
                />
                {selectedValue.chart === 'weekly' && (
                  <View style={[styles.tooltipContainer, { top: tooltipPosition.y - 40, left: tooltipPosition.x - 20 }]}>
                    <Text style={styles.selectedValueText}>{selectedValue.value} l</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={styles.graphContainer}>
            <Text style={styles.graphHeading}>KN</Text>
            {monthlyChartData && (
              <View>
                <LineChart
                  data={monthlyChartData}
                  width={350}
                  height={220}
                  yAxisSuffix=" l"
                  chartConfig={chartConfig}
                  bezier
                  formatXLabel={(label, index) => formatXLabel(label, index)}
                  onDataPointClick={({ value, x, y }) => {
                    setSelectedValue({ chart: 'monthly', value });
                    setTooltipPosition({ x, y });
                  }}
                />
                {selectedValue.chart === 'monthly' && (
                  <View style={[styles.tooltipContainer, { top: tooltipPosition.y - 40, left: tooltipPosition.x - 20 }]}>
                    <Text style={styles.selectedValueText}>{selectedValue.value} l</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
    <Footer navigation={navigation}/>
    </View>
  );
};

export default RealTimeGraph;

