'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { AdminDashboardChartPoint } from '@/app/actions/admin'

interface AdminRevenueChartProps {
  data: AdminDashboardChartPoint[]
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

export function AdminRevenueChart({ data }: AdminRevenueChartProps) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-zinc-100">
          Évolution du CA — 30 derniers jours
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(16 185 129)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="rgb(16 185 129)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateLabel}
              stroke="#71717a"
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="#71717a"
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v} €`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#a1a1aa' }}
              formatter={(value: number) => [`${value} €`, 'CA']}
              labelFormatter={(label) => formatDateLabel(label)}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="rgb(16 185 129)"
              strokeWidth={2}
              fill="url(#fillRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
