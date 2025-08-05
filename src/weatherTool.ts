import { tool } from '@openai/agents';
import { z } from 'zod';

// Type definitions for OpenWeather Current Weather API (free tier)
export interface OpenWeatherCurrentResponse {
  name: string;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  visibility?: number;
  coord: {
    lat: number;
    lon: number;
  };
}

export interface GeocodingResponse {
  name: string;
  local_names?: { [key: string]: string };
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

// OpenWeather API tool using the free Current Weather API
export const weatherTool = tool({
  name: 'get_weather',
  description: 'Get current weather information for a city using OpenWeather API',
  parameters: z.object({
    city: z.string().describe('The city to get weather for'),
    units: z.enum(['metric', 'imperial']).nullable().describe('Temperature units (metric for Celsius, imperial for Fahrenheit)')
  }),
  async execute({ city, units }) {
    try {
      console.log("TOOL CALL: Executing weather tool with parameters:", { city, units });
      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (!apiKey) {
        return `Error: OPENWEATHER_API_KEY environment variable is not set. Please get an API key from https://openweathermap.org/api`;
      }

      const effectiveUnits = units || 'metric';

      // Use the current weather API (free tier) instead of One Call API
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${effectiveUnits}&appid=${apiKey}`;
      //console.log("Weather API URL:", weatherUrl);
      
      const weatherResponse = await fetch(weatherUrl);
      //console.log("Weather response status:", weatherResponse.status);
      
      if (!weatherResponse.ok) {
        if (weatherResponse.status === 404) {
          return `City "${city}" not found. Please check the spelling and try again.`;
        }
        if (weatherResponse.status === 401) {
          return `Error: Invalid API key. Please check your OPENWEATHER_API_KEY in the .env file.`;
        }
        const errorText = await weatherResponse.text();
        console.log("Weather API error response:", errorText);
        return `Error fetching weather data: ${weatherResponse.status} ${weatherResponse.statusText}`;
      }

      const data = await weatherResponse.json() as OpenWeatherCurrentResponse;
    //   console.log("Weather data received:", { 
    //     city: data.name, 
    //     country: data.sys.country, 
    //     temp: data.main.temp,
    //     description: data.weather[0].description 
    //   });
      
      // Format current weather
      const temperature = Math.round(data.main.temp);
      const feelsLike = Math.round(data.main.feels_like);
      const tempMin = Math.round(data.main.temp_min);
      const tempMax = Math.round(data.main.temp_max);
      const humidity = data.main.humidity;
      const description = data.weather[0].description;
      const windSpeed = data.wind.speed;
      const pressure = data.main.pressure;
      const clouds = data.clouds.all;
      
      const tempUnit = effectiveUnits === 'metric' ? '°C' : '°F';
      const speedUnit = effectiveUnits === 'metric' ? 'm/s' : 'mph';
      const pressureUnit = 'hPa';
      
      // Format sunrise and sunset
      const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      let result = `Current weather in ${data.name}, ${data.sys.country}:
            - Temperature: ${temperature}${tempUnit} (feels like ${feelsLike}${tempUnit})
            - Daily Range: ${tempMin}${tempUnit} - ${tempMax}${tempUnit}
            - Conditions: ${description}
            - Humidity: ${humidity}%
            - Wind Speed: ${windSpeed} ${speedUnit}`;

      if (data.wind.deg) {
        result += ` from ${data.wind.deg}°`;
      }

      result += `
        - Pressure: ${pressure} ${pressureUnit}
        - Cloud Cover: ${clouds}%`;

      if (data.visibility) {
        const visibilityKm = effectiveUnits === 'metric' ? (data.visibility / 1000).toFixed(1) + ' km' : (data.visibility * 0.000621371).toFixed(1) + ' miles';
        result += `
        - Visibility: ${visibilityKm}`;
      }

      result += `
        - Sunrise: ${sunrise}
        - Sunset: ${sunset}`;
      
      //console.log("Final result:", result);
      return result;
      
    } catch (error) {
      console.error("Error in weather tool:", error);
      return `Error fetching weather data: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
});