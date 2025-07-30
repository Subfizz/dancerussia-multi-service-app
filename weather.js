const WEATHER_API_KEY = '011cd4a12f31ea1e6f91c000720b260a'; 

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
