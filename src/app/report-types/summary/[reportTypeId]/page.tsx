'use client'

import ReportTypeSummaryPage from '@/components/report-type/summary/summary-page'
import { useParams } from 'next/navigation'

export default function Summary() {
  const { reportTypeId } = useParams()

  if (!reportTypeId) {
    return <div>Loading...</div> // or handle gracefully
  }

  return <ReportTypeSummaryPage reportTypeId={reportTypeId as string} />
}
