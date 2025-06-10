
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Ticket as TicketIcon, Settings2, CreditCard, DollarSign, Coins } from 'lucide-react'; // Added DollarSign, Coins
import { Button } from '@/components/ui/button';
import MetricsSection from '@/components/admin/MetricsSection';
import PinConfigSection from '@/components/admin/PinConfigSection';
import TicketConfigSection from '@/components/admin/TicketConfigSection';
import StripeConfigSection from '@/components/admin/StripeConfigSection';
import SimulatedRechargeSection from '@/components/admin/SimulatedRechargeSection'; // New Import

const AdminTab = ({ 
  data, 
  onUpdateTicketType, 
  onUpdateGlobalPin, 
  onSimulateRecharge, // New prop
  globalPin, 
  stripeSettings, 
  onUpdateStripeSettings,
  onStripeConfigured,
  initialSection = 'metrics',
  setInitialSection
}) => {
  const [activeSection, setActiveSection] = useState(initialSection);
  
  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const sections = [
    { id: 'metrics', name: 'Métricas', icon: BarChart3 },
    { id: 'pin_config', name: 'PIN', icon: Settings2 },
    { id: 'tickets', name: 'Tickets', icon: TicketIcon },
    { id: 'stripe_config', name: 'Stripe', icon: CreditCard },
    { id: 'simulate_recharge', name: 'Simular', icon: Coins } // New Section
  ];

  const renderSection = () => {
    switch(activeSection) {
      case 'metrics':
        return <MetricsSection metrics={data.metrics} />;
      case 'pin_config':
        return <PinConfigSection globalPin={globalPin} onUpdateGlobalPin={onUpdateGlobalPin} />;
      case 'tickets':
        return <TicketConfigSection ticketTypes={data.ticketTypes} onUpdateTicketType={onUpdateTicketType} />;
      case 'stripe_config':
        return <StripeConfigSection stripeSettings={stripeSettings} onUpdateStripeSettings={onUpdateStripeSettings} onStripeConfigured={onStripeConfigured} />;
      case 'simulate_recharge': // New Case
        return <SimulatedRechargeSection onSimulateRecharge={onSimulateRecharge} currentBalance={data.balance} />;
      default:
        return <MetricsSection metrics={data.metrics} />;
    }
  };

  return (
    <div className="space-y-3 h-full flex flex-col overflow-hidden">
      <div className="text-center shrink-0">
        <h2 className="text-xl font-bold text-primary mb-2">Panel de Administración</h2>
        
        <div className="grid grid-cols-5 gap-1 bg-card p-1 rounded-lg shadow-sm">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "ghost"}
              onClick={() => {
                setActiveSection(section.id);
                if (setInitialSection) setInitialSection(section.id);
              }}
              className={`flex-1 transition-all duration-300 text-[10px] h-9 px-1 ${activeSection === section.id ? 'text-primary-foreground gradient-button-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              <section.icon className="w-3.5 h-3.5 mr-1" />
              {section.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar-thin pr-0.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminTab;