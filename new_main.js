let myChart;

async function fetchDailyStockData(symbol) {
    const apiKey = '7UFHELR9DO9FAJ5C';
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

function generateChart(timeSeries) {
    const dates = [];
    const closingPrices = [];

    for (let date in timeSeries) {
        dates.push(date);
        closingPrices.push(timeSeries[date]['4. close']);
    }

    const ctx = document.getElementById('myChart').getContext('2d');
    
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates.reverse(),
            datasets: [{
                label: 'Closing Prices',
                data: closingPrices.reverse(),
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                }
            }
        }
    });
}

function displayTable(timeSeries) {
    let tableHtml = `
        <table class="table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Open</th>
                    <th>High</th>
                    <th>Low</th>
                    <th>Close</th>
                    <th>Volume</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let date in timeSeries) {
        tableHtml += `
            <tr>
                <td>${date}</td>
                <td>${timeSeries[date]['1. open']}</td>
                <td>${timeSeries[date]['2. high']}</td>
                <td>${timeSeries[date]['3. low']}</td>
                <td>${timeSeries[date]['4. close']}</td>
                <td>${timeSeries[date]['5. volume']}</td>
            </tr>
        `;
    }

    tableHtml += '</tbody></table>';
    document.getElementById('output').innerHTML = tableHtml;
}

function calculateMetrics(timeSeries) {
    let totalClose = 0;
    let count = 0;
    let maxClose = -Infinity;
    let minClose = Infinity;

    for (let date in timeSeries) {
        const close = parseFloat(timeSeries[date]['4. close']);
        totalClose += close;
        count++;
        if (close > maxClose) maxClose = close;
        if (close < minClose) minClose = close;
    }

    const averageClose = totalClose / count;

    document.getElementById('metrics').innerHTML = `
        <p>Average Closing Price: ${averageClose.toFixed(2)}</p>
        <p>Highest Closing Price: ${maxClose.toFixed(2)}</p>
        <p>Lowest Closing Price: ${minClose.toFixed(2)}</p>
    `;
}

function highlightDataPoints(timeSeries) {
    let highestVolume = 0;
    let highestVolumeDate = '';
    let largestChange = 0;
    let largestChangeDate = '';

    for (let date in timeSeries) {
        const volume = parseInt(timeSeries[date]['5. volume']);
        if (volume > highestVolume) {
            highestVolume = volume;
            highestVolumeDate = date;
        }

        const open = parseFloat(timeSeries[date]['1. open']);
        const close = parseFloat(timeSeries[date]['4. close']);
        const change = Math.abs(close - open);
        if (change > largestChange) {
            largestChange = change;
            largestChangeDate = date;
        }
    }

    document.getElementById('highlights').innerHTML = `
        <p>Highest Volume: ${highestVolume} on ${highestVolumeDate}</p>
        <p>Largest Price Change: ${largestChange.toFixed(2)} on ${largestChangeDate}</p>
    `;
}

async function processData(symbol) {
    try {
        const data = await fetchDailyStockData(symbol);
        console.log('Daily Stock Data:', data);
        const timeSeries = data['Time Series (Daily)'];
        displayTable(timeSeries);
        generateChart(timeSeries);
        calculateMetrics(timeSeries);
        highlightDataPoints(timeSeries);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

function resetChart() {
    if (myChart) {
        myChart.destroy();
    }
    document.getElementById('output').innerHTML = '';
    document.getElementById('metrics').innerHTML = '';
    document.getElementById('highlights').innerHTML = '';
}

document.getElementById('fetchButton').onclick = () => {
    const symbol = document.getElementById('stockSymbol').value;
    if (symbol) {
        processData(symbol);
    } else {
        alert('Please enter a stock symbol.');
    }
};

document.getElementById('resetButton').onclick = resetChart;
