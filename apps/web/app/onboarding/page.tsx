'use client'
import { Suspense } from 'react'
import OnboardingContent from './OnboardingContent'

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F8F9FF',color:'#7C9EFF'}}>Đang tải...</div>}>
      <OnboardingContent />
    </Suspense>
  )
}
//hello world