import axios from "axios";



// Fetch Canadian addresses
export async function fetchCanadianAddresses(query: any) {
  const API_KEY = process.env.OPEN_CAGE;
  console.log(API_KEY);

  console.log(query, encodeURIComponent(query));
  
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&countrycode=ca&key=${API_KEY}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching addresses:', error?.message as string);
    return [];
  }
}
