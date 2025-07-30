const WEATHER_API_KEY = '011cd4a12f31ea1e6f91c000720b260a';
const GEOAPI_KEY = '2dafe698b1ab4005a67ee6434983cd0b';

const weatherCityInput = document.getElementById('weatherCity');
const citiesList = document.getElementById('citiesList');

// Функция для получения городов через GeoAPI
const fetchCities = async (query) => {
  try {
    console.log(`Отправка запроса для города: ${query}`);
    const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=10&apiKey=${GEOAPI_KEY}&lang=ru`);

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('GeoAPI Response:', data);

    if (data && data.features && data.features.length > 0) {
      const cities = data.features.map(city => city.properties.city || city.properties.formatted).filter(Boolean);
      console.log('Извлеченные города:', cities);
      updateCitiesList(cities);
    } else {
      console.log('Нет данных о городах');
      citiesList.style.display = 'none';
    }
  } catch (error) {
    console.error('Ошибка при запросе данных:', error);
  }
};

// Обновление кастомного выпадающего списка с городами
const updateCitiesList = (cities) => {
  citiesList.innerHTML = '';

  if (cities.length > 0) {
    cities.forEach(city => {
      const li = document.createElement('li');
      li.textContent = city;
      li.addEventListener('click', () => {
        weatherCityInput.value = city;
        citiesList.style.display = 'none';
        fetchWeatherData(city);
      });
      citiesList.appendChild(li);
    });
    citiesList.style.display = 'block';
    adjustCitiesListPosition();
  } else {
    citiesList.style.display = 'none';
  }
};

// Получение прогноза на неделю для выбранного города
const fetchWeatherData = async (city) => {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${city.lat}&lon=${city.lon}&exclude=current,minutely,alerts&units=metric&lang=ru&appid=${WEATHER_API_KEY}`);
    const data = await response.json();

    if (data.cod !== 200) {
      alert('Ошибка при получении погоды');
      return;
    }

    displayWeatherData(data);
  } catch (error) {
    console.error('Ошибка при получении данных о погоде:', error);
  }
};

// Отображение данных о погоде (на неделю)
const displayWeatherData = (data) => {
  const resultDiv = document.getElementById('weatherResult');
  let dailyForecast = '';
  
  // Прогноз на неделю
  data.daily.forEach(day => {
    const date = new Date(day.dt * 1000);
    dailyForecast += `
      <div class="card">
        <h3>${date.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
        <p>Температура: ${day.temp.day}°C</p>
        <p>Погода: ${day.weather[0].description}</p>
        <p>Ветер: ${day.wind_speed} м/с</p>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="Иконка погоды" />
      </div>
    `;
  });

  resultDiv.innerHTML = `
    <h2>Прогноз на неделю:</h2>
    ${dailyForecast}
  `;
};

// Получение прогноза на месяц (например, выводим на 16 дней)
const fetchMonthlyForecast = async (city) => {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast/daily?q=${encodeURIComponent(city)}&cnt=16&units=metric&lang=ru&appid=${WEATHER_API_KEY}`);
    const data = await response.json();

    if (data.cod !== '200') {
      alert('Ошибка при получении прогноза на месяц');
      return;
    }

    displayMonthlyForecast(data);
  } catch (error) {
    console.error('Ошибка при получении данных о прогнозе на месяц:', error);
  }
};

// Отображение прогноза на месяц
const displayMonthlyForecast = (data) => {
  const resultDiv = document.getElementById('weatherResult');
  let monthlyForecast = '';

  // Прогноз на месяц (например, на 16 дней)
  data.list.forEach(day => {
    const date = new Date(day.dt * 1000);
    monthlyForecast += `
      <div class="card">
        <h3>${date.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
        <p>Температура: ${day.temp.day}°C</p>
        <p>Погода: ${day.weather[0].description}</p>
        <p>Ветер: ${day.speed} м/с</p>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="Иконка погоды" />
      </div>
    `;
  });

  resultDiv.innerHTML = `
    <h2>Прогноз на месяц:</h2>
    ${monthlyForecast}
  `;
};

// Функция для корректного позиционирования выпадающего списка
const adjustCitiesListPosition = () => {
  const inputRect = weatherCityInput.getBoundingClientRect();
  citiesList.style.left = `${inputRect.left}px`;
  citiesList.style.width = `${inputRect.width}px`;
  citiesList.style.top = `${inputRect.bottom}px`;
};

// Автозаполнение при вводе текста
weatherCityInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  if (query.length >= 2) {
    fetchCities(query);
  } else {
    citiesList.style.display = 'none';
  }
});

// Обработчик события для получения прогноза на месяц
document.getElementById('monthForecastBtn').addEventListener('click', () => {
  const city = weatherCityInput.value;
  fetchMonthlyForecast(city);
});
