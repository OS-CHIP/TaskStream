import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement)

export const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const }
  }
}

export function getLineOptions(t: (key: string) => string) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const }
    },
    scales: {
      x: { title: { display: true, text: t('dashboard.axis.date') } },
      y: { title: { display: true, text: t('dashboard.axis.count') }, min: 0 }
    }
  }
}

export function getBarOptions(t: (key: string) => string) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const }
    },
    scales: {
      x: { title: { display: true, text: t('dashboard.axis.date') } },
      y: { title: { display: true, text: t('dashboard.axis.hours') }, min: 0 }
    }
  }
}
