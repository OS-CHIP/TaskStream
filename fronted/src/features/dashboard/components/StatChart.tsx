import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pie, Line, Bar } from 'react-chartjs-2'

interface Props {
  type: 'pie' | 'line' | 'bar'
  data: any
  options?: any
  title: string
}

export function StatChart({ type, data, options, title }: Props) {
  return (
    <Card className="chart-container overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative h-56 sm:h-64 min-h-0 p-0">
        <div className="absolute inset-0">
          {type === 'pie' && <Pie data={data} options={options} />}
          {type === 'line' && <Line data={data} options={options} />}
          {type === 'bar' && <Bar data={data} options={options} />}
        </div>
      </CardContent>
    </Card>
  )
}
