import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/date-picker'
import { Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type Preset = '7d' | '30d' | 'custom'

export function DateRangeFilter() {
  const [preset, setPreset] = useState<Preset>('7d')
  const [start, setStart] = useState<Date | undefined>(undefined)
  const [end, setEnd] = useState<Date | undefined>(undefined)
  const { t } = useTranslation()
  const mountedRef = useRef(false)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard_range_preset', preset)
      if (!mountedRef.current) {
        mountedRef.current = true
        return
      }
      if (preset !== 'custom') {
        window.dispatchEvent(new Event('dashboard_range_change'))
      }
    }
  }, [preset])
  useEffect(() => {
    if (preset === 'custom' && typeof window !== 'undefined') {
      if (start) {
        const s = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
        localStorage.setItem('dashboard_range_start', s)
      } else {
        localStorage.removeItem('dashboard_range_start')
      }
      if (end) {
        const e = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
        localStorage.setItem('dashboard_range_end', e)
      } else {
        localStorage.removeItem('dashboard_range_end')
      }
    }
  }, [preset, start, end])
  const onConfirm = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('dashboard_range_change'))
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600 flex items-center gap-1"><Calendar className="w-4 h-4" /> {t('dashboard.filters.dateRange')}</span>
        <Button
          variant={preset === '7d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPreset('7d')}
        >{t('dashboard.filters.presets.last7d')}</Button>
        <Button
          variant={preset === '30d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPreset('30d')}
        >{t('dashboard.filters.presets.last30d')}</Button>
        <Button
          variant={preset === 'custom' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPreset('custom')}
        >{t('dashboard.filters.presets.custom')}</Button>
      </div>

      {preset === 'custom' && (
        <div className="flex flex-wrap items-center gap-3">
          <DatePicker selected={start} onSelect={setStart} placeholder={t('dashboard.filters.datePicker.start')} />
          <span className="text-sm text-muted-foreground">{t('dashboard.filters.to')}</span>
          <DatePicker selected={end} onSelect={setEnd} placeholder={t('dashboard.filters.datePicker.end')} />
          <Button variant="outline" size="sm" onClick={() => { setStart(undefined); setEnd(undefined) }}>{t('common.clear')}</Button>
          <Button size="sm" onClick={onConfirm}>{t('common.search') || '查询'}</Button>
        </div>
      )}

      <div className="text-xs text-gray-500">
        {preset === '7d' && `${t('dashboard.filters.summary.prefix')} ${t('dashboard.filters.presets.last7d')}`}
        {preset === '30d' && `${t('dashboard.filters.summary.prefix')} ${t('dashboard.filters.presets.last30d')}`}
        {preset === 'custom' && (start || end) && `${t('dashboard.filters.summary.prefix')} ${start ? start.toLocaleDateString() : t('dashboard.filters.summary.unselected')} - ${end ? end.toLocaleDateString() : t('dashboard.filters.summary.unselected')}`}
      </div>
    </div>
  )
}
