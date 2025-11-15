export async function getWeather(city: string) {
  const apiKey = process.env.OPENWEATHER_API_KEY!;
  
  if (!apiKey) {
    throw new Error("Missing OPENWEATHER_API_KEY in environment variables");
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch weather data: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
