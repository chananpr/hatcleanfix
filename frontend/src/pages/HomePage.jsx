import PageTransition from '../components/common/PageTransition'
import BusinessSummarySection from '../components/home/BusinessSummarySection'
import HeroSection from '../components/home/HeroSection'
import RecentWorkSection from '../components/home/RecentWorkSection'
import ServicesSummarySection from '../components/home/ServicesSummarySection'
import StatsSection from '../components/home/StatsSection'

export default function HomePage() {
  return (
    <PageTransition>
      <HeroSection />
      <StatsSection />
      <ServicesSummarySection />
      <BusinessSummarySection />
      <RecentWorkSection />
    </PageTransition>
  )
}
