// src/components/layouts/MainLayout.tsx
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { Header } from '@/components/header/Header'

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
}

export function MainLayout() {
  return (
    <div className="flex h-screen bg-dark-950 text-gray-200 overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <motion.main
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-dark-900 to-dark-950"
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </motion.main>
      </div>
    </div>
  )
}
