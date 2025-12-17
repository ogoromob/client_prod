// src/pages/DashboardPage.tsx
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { fadeInUp, staggerContainer } from '@/components/ui/animation'
import { StatCard } from '@/components/StatCard'
import { DollarSign, Zap, Briefcase, AlertTriangle } from 'lucide-react'

export function DashboardPage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      <motion.div variants={fadeInUp} className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-white">Tableau de bord</h1>
        <Button>Nouvelle Action</Button>
      </motion.div>

      <motion.div 
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={fadeInUp}>
          <StatCard 
            title="Solde Total" 
            value="$24,780.00" 
            subtitle="+12.5% ce mois-ci"
            icon={DollarSign}
            trend="up"
            color="accent"
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <StatCard 
            title="Performance des Pools" 
            value="+8.2%" 
            subtitle="-0.5% aujourd'hui"
            icon={Zap}
            trend="down"
            color="danger"
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <StatCard 
            title="Investissements Actifs" 
            value="12"
            icon={Briefcase}
            trend="neutral"
            color="neutral"
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <StatCard 
            title="Retraits en Attente" 
            value="3"
            icon={AlertTriangle}
            color="neutral"
          />
        </motion.div>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <Card glass hoverEffect>
          <CardHeader>
            <CardTitle>Performance Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>Un graphique de performance ira ici.</p>
              {/* You can integrate recharts here */}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}