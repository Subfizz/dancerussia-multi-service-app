const WEATHER_API_KEY = '011cd4a12f31ea1e6f91c000720b260a';
const GEOAPI_KEY = '2dafe698b1ab4005a67ee6434983cd0b'; 

document.getElementById('weatherForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = document.getElementById('weatherCity').value.trim();
  const resultDiv = document.getElementById('weatherResult');
  resultDiv.innerHTML = 'Загрузка...';

  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=ru&appid=${WEATHER_API_KEY}`);
    const data = await response.json();

    if (data.cod !== 200) {
      resultDiv.innerHTML = `Ошибка: ${data.message}`;
      return;
    }

    resultDiv.innerHTML = `
      <div class="card">
        <h3>${data.name}, ${data.sys.country}</h3>
        <p>Температура: ${data.main.temp}°C</p>
        <p>Погода: ${data.weather[0].description}</p>
        <p>Ветер: ${data.wind.speed} м/с</p>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Иконка погоды" />
      </div>
    `;
  } catch (error) {
    resultDiv.innerHTML = 'Произошла ошибка при получении данных.';
    console.error(error);
  }
});

// Функция для получения городов через GeoAPI
const fetchCities = async (query) => {
  // Убедитесь, что кириллица правильно передается в URL
  const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=10&apiKey=${GEOAPI_KEY}`);
  const data = await response.json();
  
  // Получаем список городов, извлекая их из ответа
  const cities = data.features.map(city => city.properties.city);
  
  // Обновляем datalist с городами
  updateCityDatalist(cities);
};

// Обновление списка городов для автозаполнения
const updateCityDatalist = (cities) => {
  const input = document.getElementById('weatherCity');
  input.setAttribute('list', 'cities');
  let datalist = document.getElementById('cities');
  if (!datalist) {
    datalist = document.createElement('datalist');
    datalist.id = 'cities';
    input.parentNode.appendChild(datalist);
  }
  datalist.innerHTML = '';
  cities.forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    datalist.appendChild(option);
  });
};

// Автозаполнение при вводе текста
document.getElementById('weatherCity').addEventListener('input', (e) => {
  const query = e.target.value.trim();
  if (query.length >= 3) {
    fetchCities(query); // Запрос к GeoAPI с кириллицей
  }
});
