import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { BarChart } from "react-native-chart-kit";
import Footer from "./footer";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const HomeScreen = ({ navigation }) => {
  const [todayUsage, setTodayUsage] = useState(0);
  const [weekUsage, setWeekUsage] = useState(0);
  const [monthUsage, setMonthUsage] = useState(0);
  const [forecastUsage, setForecastUsage] = useState(0);

  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [selectedCalendar, setSelectedCalendar] = useState("0");
  const [chartHeading, setChartHeading] = useState("");
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const [fetchedData, setFetchedData] = useState([]);
  const [userName, setUserName] = useState("");
  const [userFlatno, setUserFlatno] = useState("");
  // Assuming this is within a functional component
const [ultConsumption, setUltConsumption] = useState(0);
const [mbConsumption, setMbConsumption] = useState(0);
const [knConsumption, setKnConsumption] = useState(0);

  const handleNotificationPress = () => {};

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 12) {
      return " Good Morning.! ☀️";
    } else if (hour >= 12 && hour < 16) {
      return " Good Afternoon.! 🌤️";
    } else if (hour >= 16 && hour < 22) {
      return " Good Evening🌙";
    } else {
      return " Good Night.! 🌜";
    }
  };

  const retrieveUserNameAndId = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString !== null) {
        const userData = JSON.parse(userDataString);
        const { userName } = userData;
        setUserName(userName);
        const spiltFlatno = userName.split(" ");
        const Flatno = spiltFlatno[1];
        console.log("Flatno:", Flatno);
        setUserFlatno(Flatno);
        fetchtodayData(Flatno);
        fetchMonthData(Flatno);
        fetchweekData(Flatno);
        fetchForecastData(Flatno);
      } else {
        console.log("No user data found");
      }
    } catch (error) {
      console.error("Error retrieving user data:", error);
    }
  };

  const UsageCard = ({ title, data }) => {
    return (
      <View style={[styles.card]}>
        <Text style={[styles.cardTitle, { color: "black" }]}>{title}</Text>
        <Text
          numberOfLines={1}
          style={[styles.cardData, { color: "black", fontWeight: "bold" }]}
        >
          {data}
        </Text>
      </View>
    );
  };

  const getGreetingAnimation = () => {
    const greetingText = getGreeting();
    let animatedGreeting = "";
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

  const handleMenuPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleLogoutPress = async () => {
    try {
      // Clear AsyncStorage
      await AsyncStorage.clear();
      // Navigate to Login page
      navigation.navigate("Login");
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
      // Handle error if needed
    }
  };

  const Tooltip = ({ visible, x, y, value }) => {
    if (!visible || x === null || y === null) return null;

    const tooltipPositionY = y - 50;

    return (
      <View
        style={[styles.tooltipContainer, { left: x, top: tooltipPositionY }]}
      >
        <Text style={styles.tooltipText}>{value} l</Text>
      </View>
    );
  };

  const handleTooltipPress = (value, x, y) => {
    setTooltipData({ value, x, y });
    setTooltipVisible(true);
  };

  const hideTooltip = () => {
    setTooltipVisible(false);
  };

  const handleCalendarClick = (calendar) => {
    console.log("Clicked calendar:", calendar);
    setSelectedCalendar(calendar);
    switch (calendar) {
      case "today":
        setBarChartDataAndHeading("today", "Consumption Chart for Today");
        break;
      case "week":
        setBarChartDataAndHeading("week", "Consumption Chart for Week");
        //fetchweekData();
        break;
      case "month":
        setBarChartDataAndHeading("month", "Consumption Chart for Month");
        //fetchMonthData();
        break;
      case "forecast":
        setBarChartDataAndHeading("forecast", "Forecast Consumption Chart");
        break;
      default:
        break;
    }
  };
  const setBarChartDataAndHeading = async (calendarType, heading) => {
    const Flatno = userFlatno;

    let url = "";
    console.log("Setting chart heading:", heading);

    let today = `http://zengap.duckdns.org:3000/ahp/data/allday/AHP${Flatno}*`;

    switch (calendarType) {
      case "today":
        url = today;
        break;
      case "week":
        url = `http://zengap.duckdns.org:3000/ahp/data/allweek/AHP${Flatno}`;
        break;
      case "month":
        url = `http://zengap.duckdns.org:3000/ahp/data/monthall/AHP${Flatno}*`;
        break;
      case "forecast":
        url = `http://zengap.duckdns.org:3000/ahp/data/monthall/AHP${Flatno}*`;
        break;
      default:
        break;
    }

    try {
      const response = await fetch(url);
      const responseData = await response.json();

      console.log("Received data:", responseData); // Log the received data
      if (calendarType === "today" && typeof responseData === "object") {
        // Handle today's consumption data
        const labels = Object.keys(responseData);
        const data = Object.values(responseData).map(parseFloat);
        // Get the latest 7 days data
        const latestLabels = labels.slice(-7).map(dateString => {
            // Parse the date string into a Date object
            const date = new Date(dateString);
            // Get the day name (e.g., Monday, Tuesday)
            const options = { weekday: 'long' };
            const dayName = new Intl.DateTimeFormat('en-US', options).format(date);
            return dayName;
        });
        console.log('labels generated:', latestLabels);
        const latestData = data.slice(-7).reverse(); // Reverse the order of the data
    
        // Update the chart data and heading for today's consumption
        const chartData = {
            labels: latestLabels.reverse(), // Reverse the order of the labels
            datasets: [
                {
                    data: latestData,
                },
            ],
        };
        setBarChartData(chartData);
        setChartHeading(heading);
    }
    else if (calendarType === 'week' && typeof responseData === 'object' && responseData.consumptionByWeek) {
      const consumptionByWeek = responseData.consumptionByWeek;
      const labels = Object.keys(consumptionByWeek).map(date => {
          const [year, month, day] = date.split('-');
          return `${day}/${month}`;
      });
  
   
      labels.sort((a, b) => {
          const [dayA, monthA] = a.split('/');
          const [dayB, monthB] = b.split('/');
          return monthA - monthB || dayA - dayB;
      });
  
      const data = Object.values(consumptionByWeek).map(parseFloat);
  
      const chartData = {
          labels: labels,
          datasets: [{
              data: data
          }]
      };
      setBarChartData(chartData);
      setChartHeading(heading);
  }  else if ((calendarType === 'month' || calendarType === 'forecast') && Array.isArray(responseData)) {
    let labels = [];
    let data = [];

   
    responseData.sort((a, b) => new Date(a.month) - new Date(b.month));

    const lastFiveMonthsData = responseData.slice(0, 5);


    lastFiveMonthsData.forEach(entry => {
   
        const month = new Date(entry.month).toLocaleDateString('en-GB', { year: '2-digit', month: '2-digit', day: '2-digit' });
        labels.push(month); 
        data.push(parseFloat(entry.total_consumption)); 
    });

 
    const chartData = {
        labels: labels,
        datasets: [{
            data: data
        }]
    };

 
    setBarChartData(chartData);
    setChartHeading(heading);
} else {
        console.error(
          "Error fetching chart data: Response data array not found"
        );
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  useEffect(() => {
    retrieveUserNameAndId();

   
  }, []);

  const fetchtodayData = async (Flatno) => {
    try {
      const response = await fetch(
        `http://zengap.duckdns.org:3000/ahp/data/day/AHP${Flatno}*`
      );
      const data = await response.json();

      if (data.hasOwnProperty("totalFinalConsumption")) {
        // Today's consumption data format
        const todayConsumption = parseFloat(data.totalFinalConsumption);
        const devicewisedata = data.matchingDevices;
        console.log("Today's Consumption:", todayConsumption);
          // Loop through the device data to identify ULT, MB, or KN devices
    devicewisedata.forEach(device => {
      const { device_id, final_consumption } = device;
      const consumption = parseFloat(final_consumption);
      
      // Check if the device ID ends with ULT, MB, or KN
      if (device_id.endsWith('ULT')) {
          setUltConsumption(prevUltConsumption => prevUltConsumption + consumption);
      } else if (device_id.endsWith('MB')) {
          setMbConsumption(prevMbConsumption => prevMbConsumption + consumption);
      } else if (device_id.endsWith('KN')) {
          setKnConsumption(prevKnConsumption => prevKnConsumption + consumption);
      }
  });
        

        // Update the today usage
        setTodayUsage(todayConsumption.toFixed(2) + " ltrs");
      } else {
        console.error(
          'Error: "totalFinalConsumption" property not found in response data'
        );
      }
    } catch (error) {
      console.error("Error fetching card data:", error);
    }
  };

  const fetchweekData = async (Flatno) => {
    try {
      const response = await fetch(
        `http://zengap.duckdns.org:3000/ahp/data/currentweek/AHP${Flatno}*`
      );
      const data = await response.json();

      let totalWeekUsage = 0;
      if (data.hasOwnProperty("total_consumption")) {
        totalWeekUsage = parseFloat(data.total_consumption);
        setWeekUsage(totalWeekUsage.toFixed(2) + " ltrs");
      } else {
        console.log("Error: Empty or invalid response data");
      }
    } catch (error) {
      console.log("Error fetching week data:", error);
    }
  };

  const fetchMonthData = async (Flatno) => {
    try {
      const response = await fetch(
        `http://zengap.duckdns.org:3000/ahp/data/month/AHP${Flatno}*`
      );
      const data = await response.json();

      if (data && typeof data.total_consumption === "number") {
        // Extract total consumption for the month
        const totalMonthConsumption = data.total_consumption.toFixed(2);
        console.log("Total Month Consumption:", totalMonthConsumption);

        setMonthUsage(totalMonthConsumption + " ltrs"); // Set month usage
      } else {
        console.error("Error: Invalid response data");
      }
    } catch (error) {
      console.error("Error fetching month data:", error);
    }
  };

  const fetchForecastData = async (Flatno) => {
    try {
      const response = await fetch(
        `http://zengap.duckdns.org:3000/ahp/data/month/AHP${Flatno}*`
      );
      const data = await response.json();

      if (data && typeof data.total_consumption === "number") {
        // Extract total consumption for the month
        const totalMonthConsumption = data.total_consumption;

        // Calculate the average consumption for the month
        const averageConsumption = totalMonthConsumption / 4; // Assuming 4 weeks in a month

        // Set the forecast usage
        setForecastUsage(Math.round(averageConsumption / 1) + " ltrs");
      } else {
        console.error("Error: Invalid month data");
      }
    } catch (error) {
      console.error("Error fetching forecast data:", error);
    }
  };

  // Bar chart decorator to display consumption data above bars
  const barChartDecorator = ({ x, y, index }) => (
    <View key={index} style={styles.barLabel}>
      <Text style={{ fontSize: 12, color: "black" }}>
        {barChartData.datasets[0].data[index]} l
      </Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.triangle} />

        <TouchableOpacity
          onPress={handleMenuPress}
          style={styles.logoContainer}
        >
          <Image source={require("./images/9.jpg")} style={styles.logo} />
        </TouchableOpacity>

        <View style={styles.centerText}>
          <Text style={styles.centerTextContent}>AHP FLAT NO: AGHPA05</Text>
        </View>

        <TouchableOpacity
          onPress={handleNotificationPress}
          style={styles.iconContainer}
        >
          <MaterialCommunityIcons
            name="bell-outline"
            size={24}
            color="black"
            style={styles.bellOutline}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogoutPress}
          style={styles.iconContainer}
        >
          <MaterialCommunityIcons name="power" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>{getGreeting()}</Text>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.Flatno}>{userName}</Text>
      </View>

      <View style={styles.calendarContainer}>
        <View style={styles.circleContainer}>
          <View style={styles.circleOutline}>
            <TouchableOpacity
              onPress={() => handleCalendarClick("today")}
              style={styles.circle}
            >
              <MaterialCommunityIcons
                name="calendar"
                size={24}
                color={selectedCalendar === "today" ? "orange" : "black"}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.todayText}>Today</Text>
        </View>

        <View style={{ width: 20 }} />

        <View style={styles.circleContainer}>
          <View style={styles.circleOutline}>
            <TouchableOpacity
              onPress={() => handleCalendarClick("week")}
              style={styles.circle}
            >
              <MaterialCommunityIcons
                name="calendar"
                size={24}
                color={selectedCalendar === "week" ? "purple" : "black"}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.weekText}>Week</Text>
        </View>

        <View style={{ width: 20 }} />

        <View style={styles.circleContainer}>
          <View style={styles.circleOutline}>
            <TouchableOpacity
              onPress={() => handleCalendarClick("month")}
              style={styles.circle}
            >
              <MaterialCommunityIcons
                name="calendar"
                size={24}
                color={selectedCalendar === "month" ? "purple" : "black"}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.monthText}>Month</Text>
        </View>

        <View style={{ width: 20 }} />

        <View style={styles.circleContainer}>
          <View style={styles.circleOutline}>
            <TouchableOpacity
              onPress={() => handleCalendarClick("forecast")}
              style={styles.circle}
            >
              <MaterialCommunityIcons
                name="chart-line"
                size={24}
                color={selectedCalendar === "forecast" ? "brown" : "black"}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.forecastText}>Forecast</Text>
        </View>
      </View>

      <View style={styles.imageContainer}>
        <View style={styles.imageAndExtraImageContainer}>
          <Image source={require("./images/ttt.gif")} style={styles.image} />
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.usageItem}>
            <FontAwesome
              name="flash"
              size={20}
              color="yellow"
              style={styles.icon}
            />
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.usageText, { textAlign: "justify" }]}>
                Todays Usage:
              </Text>
            </View>
            <Text style={[styles.usageValue, { textAlign: "justify" }]}>
              {todayUsage}
            </Text>
          </View>
          <View style={styles.usageItem}>
            <FontAwesome
              name="clock-o"
              size={20}
              color="brown"
              style={styles.icon}
            />
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.usageText, { textAlign: "justify" }]}>
                Week Usage:
              </Text>
            </View>
            <Text style={[styles.usageValue, { textAlign: "justify" }]}>
              {weekUsage}
            </Text>
          </View>
          <View style={styles.usageItem}>
            <FontAwesome
              name="calendar"
              size={20}
              color="green"
              style={styles.icon}
            />
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.usageText, { textAlign: "justify" }]}>
                Month Usage:
              </Text>
            </View>
            <Text style={[styles.usageValue, { textAlign: "justify" }]}>
              {monthUsage}
            </Text>
          </View>
          <View style={styles.usageItem}>
            <FontAwesome
              name="line-chart"
              size={20}
              color="purple"
              style={styles.icon}
            />
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.usageText, { textAlign: "justify" }]}>
                Forecast Usage:
              </Text>
            </View>
            <Text style={[styles.usageValue, { textAlign: "justify" }]}>
              {forecastUsage}
            </Text>
          </View>
        </View>
      </View>

<View style={styles.cardRow}>
        <View style={[styles.card, styles.cardSpacing, { backgroundColor: '#1e9eff' }]}>
          <Text style={styles.cardTitle}>Usage  MB</Text>
          <Text style={styles.cardData}>{mbConsumption} ltrs</Text>
        </View>

        <View style={[styles.card, { backgroundColor: '#1e9eff' }]}>
          <Text style={styles.cardTitle}>Usage  KN</Text>
          <Text style={styles.cardData}>{knConsumption} ltrs</Text>
        </View>

        <View style={[styles.card, styles.cardSpacing, { backgroundColor: '#1e9eff' }]}>
          <Text style={styles.cardTitle}>Usage ULT</Text>
          <Text style={styles.cardData}>{ultConsumption} ltrs</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#1e9eff' }]}>
          <Text style={styles.cardTitle}>Usage Total</Text>
          <Text style={styles.cardData}>{todayUsage}</Text>
        </View>
      </View>
      <View style={styles.barChartContainer}>
        <Text style={styles.chartHeading}>{chartHeading}</Text>

        <BarChart
          data={{
            labels: barChartData.labels,
            datasets: [
              {
                data: barChartData.datasets[0].data,
              },
            ],
          }}
          width={screenWidth - 32}
          height={200}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            fillShadowGradient: "rgba(30, 158, 255, 0.7)",
            fillShadowGradientOpacity: 0.95,
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(30, 158, 255, ${opacity})`, // Apply the desired color here
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          yAxisSuffix="L"
          withVerticalLabels={true} // Set this to false to hide x-axis labels
          fromZero={true}
          decorator={({ x, y, index }) => (
            <TouchableOpacity
              onPress={() =>
                handleTooltipPress(barChartData.datasets[0].data[index], x, y)
              }
              key={index}
              style={{
                position: "absolute",
                left: x - 20,
                top: y - 50,
                alignItems: "center",
              }}
            >
              <View style={styles.barLabel}>
                <Text style={{ fontSize: 12, color: "black" }}>
                  {barChartData.datasets[0].data[index]} L
                </Text>
                <Text style={{ fontSize: 12, color: "black" }}>
                  {fetchedData[index]} // Assuming fetchedData is an array
                  containing the fetched data
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      <Footer navigation={navigation} />
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "white",
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    top: 50, 
    paddingHorizontal: 0.01 * screenWidth, // Adjusted paddingHorizontal
    
    
    marginBottom: 20,
  },

  
  card: {
    width: '22%', // Adjusted width for four cards in a row
    height: screenWidth * 1.2, // Adjusted height based on screen width
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
   
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'white',
  },
  cardData: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  cardContainer: {
    marginTop: -170, 
    left: 60,
    alignItems: 'flex-start', 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 0.01 * screenWidth, // Adjusted paddingHorizontal
    backgroundColor: "white",
    marginTop: 0.07 * screenWidth, // Adjusted marginTop
  },
  logoContainer: {
    width: 0.8 * screenWidth, // Adjust the width of the container as needed
    marginRight: -0.7 * screenWidth, // Adjusted marginRight to maintain alignment
    justifyContent: "flex-end", // Move the logo to the right within the container
    top: 30,
    left: 10,
  },

  logo: {
    width: 0.22 * screenWidth, // Increased width of the logo
    height: 0.15 * screenWidth, // Adjusted height to maintain aspect ratio
    resizeMode: "contain",
    paddingHorizontal: 0.1,
    position: "absolute",
  },

  iconContainer: {
    padding: -0.18 * screenWidth, // Adjusted padding
  },
  middleContainer: {
    alignItems: "center",
  },
  barChartContainer: {
    alignItems: "center",
    marginTop: 0.12 * screenWidth, // Adjusted marginTop
  },

  chartHeading: {
    fontSize: 0.04 * screenWidth, // Adjusted fontSize
    fontWeight: "bold",
    marginBottom: 0.029 * screenWidth, // Adjusted marginBottom
  },

  greetingContainer: {
    alignItems: "center",
    left: -100,
    marginTop: 5, // Adjust the marginTop as needed
  },
  greetingText: {
    fontSize: 18, // Adjust the fontSize as needed
    fontWeight: "bold",
  },
  userName: {
    fontSize: 16, // Adjust the fontSize as needed
    marginTop: 5,
    left: -20, // Adjust the marginTop as needed
  },
  Flatno: {
    fontSize: 16, // Adjust the fontSize as needed
    textAlign: "center", // Align text to the center
    left: 130,
    color: "#1e9eff",
    fontWeight: "bold",
  },

  todayUsageContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  todayUsageText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  imageContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  image: {
    width: screenWidth * 1, // Adjust the width as per your requirement
    height: 180, // Adjust the height as per your requirement
    resizeMode: "cover", // Adjust the resizeMode as per your requirement
  },

  imageAndExtraImageContainer: {
    flexDirection: "column", // Change to column direction
    alignItems: "center",
  },
  extraImage: {
    position: "absolute",
    bottom: 115, // Position at the top of the image container
    left: 250, // Align with the left edge of the container
    width: 30, // Adjust width as needed
    height: 25, // Adjust height as needed
    resizeMode: "cover", // Adjust the resizeMode as per your requirement
  },

  chartContainerBorder: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 0.01 * screenWidth, // Adjusted borderRadius
    padding: 0.1 * screenWidth, // Adjusted padding
    width: screenWidth,
  },
  headerText: {
    fontSize: 9 * screenWidth, // Adjusted fontSize
    fontWeight: "bold",
    color: "white",
  },
  calendarContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0.01 * screenWidth, // Adjusted marginTop
  },
  circleContainer: {
    alignItems: "center",
    marginRight: 0.09 * screenWidth, // Adjusted marginRight
  },
  circleOutline: {
    borderRadius: 0.9 * screenWidth,
    padding: 0.02 * screenWidth,
    borderWidth: 1,
    borderColor: "#bdbdbd",
  },
  circle: {
    width: 0.12 * screenWidth, // Adjusted width
    height: 0.1 * screenWidth, // Adjusted height
    borderRadius: 0.05 * screenWidth, // Adjusted borderRadius
    justifyContent: "center",
    alignItems: "center",
  },

  dayNumber: {
    color: "black",
    fontSize: 0.03 * screenWidth, // Adjusted fontSize
    fontWeight: "bold",
    position: "absolute",
    top: "30%",
  },
  todayText: {
    marginTop: 0.007 * screenWidth, // Adjusted marginTop
    marginLeft: 0.02 * screenWidth, // Adjusted marginLeft
    fontSize: 0.04 * screenWidth, // Adjusted fontSize
    fontWeight: "bold",
    color: "black",
  },
  checkIcon: {
    position: "absolute",
  },
  weekNumber: {
    color: "black",
    fontSize: 0.03 * screenWidth, // Adjusted fontSize
    fontWeight: "bold",
  },
  weekText: {
    marginTop: 0.007 * screenWidth, // Adjusted marginTop
    marginLeft: 0.02 * screenWidth, // Adjusted marginLeft
    fontSize: 0.04 * screenWidth, // Adjusted fontSize
    fontWeight: "bold",
    color: "black",
  },
  monthNumber: {
    color: "black",
    fontSize: 0.03 * screenWidth, // Adjusted fontSize
    fontWeight: "bold",
  },
  monthText: {
    marginTop: 0.007 * screenWidth, // Adjusted marginTop
    marginLeft: 0.02 * screenWidth, // Adjusted marginLeft
    fontSize: 0.04 * screenWidth, // Adjusted fontSize
    fontWeight: "bold",
    color: "black",
  },
  forecastText: {
    marginTop: 0.007 * screenWidth, // Adjusted marginTop
    marginLeft: 0.02 * screenWidth, // Adjusted marginLeft
    fontSize: 0.04 * screenWidth, // Adjusted fontSize
    fontWeight: "bold",
    color: "black",
  },
  centerText: {
    flex: 1,
    alignItems: "center",
  },
  centerTextContent: {
    fontSize: 0.045 * screenWidth, // Adjusted fontSize
    fontWeight: "bold",
    color: "white",
    textAlign: "left",
    maxWidth: 0.5 * screenWidth, // Adjusted maxWidth
    overflow: "hidden",
  },

  circleContainer: {
    position: "relative",
  },
  homeIcon: {
    backgroundColor: "#1e9eff",
    borderRadius: 0.1 * screenWidth, // Adjusted borderRadius
    padding: 0.025 * screenWidth, // Adjusted padding
  },
  
  card: {
    width: 0.18 * screenWidth, // Adjusted width
    padding: 0.02 * screenWidth, // Adjusted padding
    borderRadius: 0.04 * screenWidth, // Adjusted borderRadius
    alignItems: "center",
  },
  cardSpacing: {
    marginHorizontal: 0.03 * screenWidth, // Adjusted marginHorizontal
  },
  cardTitle: {
    fontSize: 0.03 * screenWidth, // Adjusted fontSize
    fontWeight: "bold",
    marginBottom: 0.015 * screenWidth, // Adjusted marginBottom
    color: "white",
  },
  tooltipContainer: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 0.01 * screenWidth, // Adjusted borderRadius
    padding: 0.005 * screenWidth, // Adjusted padding
    zIndex: 999,
  },

  
  usageItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10, // Adjust as needed
  },
  bulletIcon: {
    marginRight: 5, // Adjust as needed
  },
  icon: {
    marginRight: 10, // Adjust as needed
  },
  usageText: {
    fontWeight: "bold",
    fontSize: 17,
    marginRight: 5,
    color: "white", // Adjust as needed
  },
  usageValue: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },

  cardData: {
    fontSize: 0.025 * screenWidth, // Adjusted fontSize
    fontWeight: "bold",
    color: "white",
  },
});

export default HomeScreen;
