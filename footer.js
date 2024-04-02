import React from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

const Footer = ({ navigation }) => {
  const handleRealTimeGraphPress = () => {
    if (navigation.name !== "RealTimeGraph") {
      navigation.navigate("RealTimeGraph");
    }
  };

  const handleBarGraphPress = () => {
    if (navigation.name !== "Report") {
      navigation.navigate("Report");
    }
  };

  const handleAboutUsPress = () => {
    if (navigation.name !== "AboutUs") {
      navigation.navigate("AboutUs");
    }
  };

  const handleProfilePress = () => {
    if (navigation.name !== "Profile") {
      navigation.navigate("Profile");
    }
  };

  const handleHomePress = () => {
    if (navigation.name !== "Home") {
      navigation.navigate("Home");
    }
  };

  return (
    <View style={styles.footerContainer}>
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleRealTimeGraphPress}
          style={styles.footerIcon}
        >
          <MaterialCommunityIcons name="chart-line" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleBarGraphPress}
          style={styles.footerIcon}
        >
          <MaterialCommunityIcons name="chart-bar" size={24} color="black" />
        </TouchableOpacity>

        <View style={styles.circleContainer}>
          <TouchableOpacity onPress={handleHomePress} style={styles.homeIcon}>
            <MaterialCommunityIcons name="home" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleAboutUsPress}
          style={styles.footerIcon}
        >
          <MaterialCommunityIcons
            name="information-outline"
            size={24}
            color="black"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleProfilePress}
          style={styles.footerIcon}
        >
          <MaterialCommunityIcons
            name="account-circle"
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    position: "absolute",
    width: screenWidth, // Take the full width of the screen
    bottom: 0,
    backgroundColor: "white",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
  },
  footerIcon: {
    paddingHorizontal: 0.025 * screenWidth,
  },
});

export default Footer;
