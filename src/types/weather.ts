export interface WeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  clouds?: {
    all: number;
  };
  rain?: {
    '1h'?: number;
  };
  visibility?: number;
  sys?: {
    sunrise: number;
    sunset: number;
  };
  name: string;
}