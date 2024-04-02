import React from 'react';
import { View, Text } from 'react-native';

import Footer from './footer';

const CustomHeader = ({ title }) => {
    
  return (
    <View>
      {/* Add your custom header content here */}
     
      {<Footer  title />}
      
    </View>
  );
};

export default CustomHeader;