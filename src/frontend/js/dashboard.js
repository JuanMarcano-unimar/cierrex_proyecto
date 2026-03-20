// dashboard.js

let myChart; // Variable global para la instancia del gráfico

async function fetchDailyCierre() {
    const today = new Date().toISOString().split('T')[0];
    try {
        const response = await fetch(`${BASE_URL}/cierres`);
        const allCierres = await response.json();
        const dailyCierres = allCierres.filter(cierre => cierre.date === today);

        const totalUsd = dailyCierres.reduce((sum, cierre) => sum + parseFloat(cierre.totalUsd), 0);
        const totalVes = dailyCierres.reduce((sum, cierre) => sum + parseFloat(cierre.totalVes), 0);

        const details = dailyCierres.reduce((acc, cierre) => {
            acc.efectivo += parseFloat(cierre.efectivo);
            acc.debito += parseFloat(cierre.debito);
            acc.credito += parseFloat(cierre.credito);
            acc.pagoMovil += parseFloat(cierre.pagoMovil);
            acc.transferencias += parseFloat(cierre.transferencias);
            acc.divisas += parseFloat(cierre.divisas);
            acc.zelle += parseFloat(cierre.zelle);
            return acc;
        }, { efectivo: 0, debito: 0, credito: 0, pagoMovil: 0, transferencias: 0, divisas: 0, zelle: 0 });

        document.getElementById('dailyTotalUsd').textContent = `Total USD: $${totalUsd.toFixed(2)}`;
        document.getElementById('dailyTotalVes').textContent = `Total VES: Bs ${totalVes.toFixed(2)}`;
        document.getElementById('dailyDetails').innerHTML = `
            <div class="col-md-6 col-12 text-md-end text-center pe-md-4">
                Efectivo: Bs ${details.efectivo.toFixed(2)}<br>
                Débito: Bs ${details.debito.toFixed(2)}<br>
                Crédito: Bs ${details.credito.toFixed(2)}<br>
                Pago Móvil: Bs ${details.pagoMovil.toFixed(2)}
            </div>
            <div class="col-md-6 col-12 text-md-start text-center ps-md-4 mt-2 mt-md-0">
                Transferencias: Bs ${details.transferencias.toFixed(2)}<br>
                Divisas: $${details.divisas.toFixed(2)}<br>
                Zelle: $${details.zelle.toFixed(2)}
            </div>
        `;
    } catch (error) {
        console.error("Error fetching daily", error);
    }
}

async function fetchChartData() {
    const startDateStr = document.getElementById('startDate').value;
    const endDateStr = document.getElementById('endDate').value;

    try {
        const response = await fetch(`${BASE_URL}/cierres`);
        const allCierres = await response.json();
        let filteredCierres = allCierres;

        if (startDateStr && endDateStr) {
            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);
            endDate.setHours(23, 59, 59, 999);

            filteredCierres = allCierres.filter(cierre => {
                const cierreDate = new Date(cierre.date);
                return cierreDate >= startDate && cierreDate <= endDate;
            });
        }

        // Agrupar cierres por fecha para el gráfico
        const groupedCierres = filteredCierres.reduce((acc, cierre) => {
            if (!acc[cierre.date]) {
                acc[cierre.date] = {
                    efectivo: 0, debito: 0, credito: 0, pagoMovil: 0, transferencias: 0, divisas: 0, zelle: 0, totalUsd: 0
                };
            }
            acc[cierre.date].efectivo += parseFloat(cierre.efectivo);
            acc[cierre.date].debito += parseFloat(cierre.debito);
            acc[cierre.date].credito += parseFloat(cierre.credito);
            acc[cierre.date].pagoMovil += parseFloat(cierre.pagoMovil);
            acc[cierre.date].transferencias += parseFloat(cierre.transferencias);
            acc[cierre.date].divisas += parseFloat(cierre.divisas);
            acc[cierre.date].zelle += parseFloat(cierre.zelle);
            acc[cierre.date].totalUsd += parseFloat(cierre.totalUsd); 
            return acc;
        }, {});

        const labels = Object.keys(groupedCierres).sort(); 
        const datasets = [
            { label: 'Efectivo (VES)', data: labels.map(date => groupedCierres[date].efectivo), backgroundColor: '#FB923C', stack: 'Stack 0' },
            { label: 'Débito (VES)', data: labels.map(date => groupedCierres[date].debito), backgroundColor: '#3B82F6', stack: 'Stack 0' },
            { label: 'Crédito (VES)', data: labels.map(date => groupedCierres[date].credito), backgroundColor: '#34D399', stack: 'Stack 0' },
            { label: 'Pago Móvil (VES)', data: labels.map(date => groupedCierres[date].pagoMovil), backgroundColor: '#FBBF24', stack: 'Stack 0' },
            { label: 'Transferencias (VES)', data: labels.map(date => groupedCierres[date].transferencias), backgroundColor: '#EF4444', stack: 'Stack 0' },
            { label: 'Divisas (USD)', data: labels.map(date => groupedCierres[date].divisas), backgroundColor: '#8B5CF6', stack: 'Stack 0' },
            { label: 'Zelle (USD)', data: labels.map(date => groupedCierres[date].zelle), backgroundColor: '#EC4899', stack: 'Stack 0' }
        ];

        const ctx = document.getElementById('cierresChart').getContext('2d');

        if (myChart) {
            myChart.destroy();
        }

        const isDark = document.body.classList.contains('dark-theme');
        const fontColor = isDark ? '#F9FAFB' : '#172554';
        const gridColor = isDark ? '#4B5563' : '#e5e7eb';

        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        stacked: true,
                        ticks: { color: fontColor },
                        grid: { color: gridColor },
                        title: {
                            display: true,
                            text: 'Monto (VES y USD)',
                            color: fontColor
                        }
                    },
                    x: {
                        stacked: true,
                        ticks: { color: fontColor },
                        grid: { color: gridColor },
                        title: {
                            display: true,
                            text: 'Fecha',
                            color: fontColor
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: fontColor }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.dataset.label.includes('(USD)')) {
                                    label += '$' + context.parsed.y.toFixed(2);
                                } else {
                                    label += 'Bs ' + context.parsed.y.toFixed(2);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.error("error fetching chart data", err);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    document.getElementById('endDate').valueAsDate = today;
    document.getElementById('startDate').valueAsDate = sevenDaysAgo;

    fetchDailyCierre();
    fetchChartData();
});
