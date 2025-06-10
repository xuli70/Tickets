
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Ticket as TicketIcon, Settings2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { useAppData } from '@/hooks/useAppData';
import RechargeTab from '@/components/RechargeTab';
import TicketsTab from '@/components/TicketsTab';
import AdminTab from '@/components/AdminTab';
import PinModal from '@/components/PinModal';
import StripeInfoModal from '@/components/StripeInfoModal';
import { toast } from '@/components/ui/use-toast';
import { loadStripe } from '@stripe/stripe-js';

export default function App() {
  const [activeTab, setActiveTab] = useState('tickets');
  const [adminSubSection, setAdminSubSection] = useState('metrics');

  const {
    data,
    loading,
    initiateStripeRecharge, 
    confirmStripeRecharge,
    simulateRecharge, // New function from hook
    purchaseTickets,
    consumeTicketGroup,
    consumeAllAvailableTickets,
    updateTicketType,
    updateGlobalPin,
    verifyGlobalPin,
    updateStripeSettings,
    stripeSettings,
  } = useAppData();

  const [showPinModal, setShowPinModal] = useState(false);
  const [ticketGroupToConsume, setTicketGroupToConsume] = useState(null);
  const [consumptionMode, setConsumptionMode] = useState('group');
  const [stripePromise, setStripePromise] = useState(null);
  const [showStripeInfoModal, setShowStripeInfoModal] = useState(false);
  const [isStripeConfigured, setIsStripeConfigured] = useState(false);

  const tabs = [
    { id: 'recharge', name: 'Recarga', icon: CreditCard },
    { id: 'tickets', name: 'Tickets', icon: TicketIcon },
    { id: 'admin', name: 'Admin', icon: Settings2 }
  ];
  
  useEffect(() => {
    if (stripeSettings.publishableKey && stripeSettings.priceId) {
      setStripePromise(loadStripe(stripeSettings.publishableKey));
      setIsStripeConfigured(true);
    } else {
      setStripePromise(null);
      setIsStripeConfigured(false);
    }
  }, [stripeSettings.publishableKey, stripeSettings.priceId]);

  const handleNavigation = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'admin' && adminSubSection !== 'simulate_recharge') { // Keep simulate_recharge if already there
      setAdminSubSection('metrics');
    }
  };

  const handleStripeModalNavigation = () => {
    setShowStripeInfoModal(false);
    setActiveTab('admin');
    setAdminSubSection('stripe_config');
  };

  const processUrlRecharge = useCallback(async () => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("recharge_success") === "true" && query.get("session_id")) {
      const amount = parseFloat(query.get("amount"));
      const sessionId = query.get("session_id");

      if (amount && sessionId && data.balance !== undefined) {
        const success = await confirmStripeRecharge(sessionId, amount);
        if (success) {
          toast({
            title: "¡Recarga Exitosa!",
            description: `Se han añadido €${amount.toFixed(2)} a tu saldo.`,
            className: "bg-green-500 text-white border-green-600",
            duration: 7000,
          });
        } else {
           toast({
            title: "Error en Confirmación",
            description: "Hubo un problema al confirmar la recarga. Contacta soporte si el saldo no se actualiza.",
            variant: "destructive",
            duration: 7000,
          });
        }
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    } else if (query.get("recharge_canceled") === "true") {
      toast({
        title: "Recarga Cancelada",
        description: "El proceso de recarga fue cancelado.",
        variant: "destructive",
        duration: 5000,
      });
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [confirmStripeRecharge, data.balance]);


  useEffect(() => {
    if (!loading) {
      processUrlRecharge();
      if (!data.globalPin && activeTab !== 'admin') {
        toast({
          title: "Configuración Requerida",
          description: "No se ha configurado un PIN global. Por favor, configúralo en la pestaña Admin.",
          duration: 7000,
          className: "bg-amber-500 text-white border-amber-600"
        });
      }
      if (!isStripeConfigured && activeTab === 'recharge') {
        setShowStripeInfoModal(true);
      }
    }
  }, [loading, data.globalPin, activeTab, isStripeConfigured, processUrlRecharge]);


  const handleConsumeGroupRequest = (ticketRepresentative) => {
    if (!data.globalPin) {
      toast({ title: "PIN Global no configurado", description: "Configura el PIN en Admin.", variant: "destructive", duration: 5000 });
      return;
    }
    setTicketGroupToConsume(ticketRepresentative); 
    setConsumptionMode('group');
    setShowPinModal(true);
  };

  const handleConsumeAllRequest = () => {
    if (!data.globalPin) {
      toast({ title: "PIN Global no configurado", description: "Configura el PIN en Admin.", variant: "destructive", duration: 5000 });
      return;
    }
    if (data.tickets.filter(t => !t.consumed).length === 0) {
      toast({ title: "No hay tickets", description: "No hay tickets disponibles para consumir.", variant: "default" });
      return;
    }
    setConsumptionMode('all');
    setTicketGroupToConsume(null);
    setShowPinModal(true);
  };

  const handlePinVerification = async (pinAttempt) => {
    if (!data.globalPin) {
       toast({ title: "Error", description: "PIN Global no configurado.", variant: "destructive" });
       setShowPinModal(false);
       return;
    }

    try {
      const verificationResult = await verifyGlobalPin(pinAttempt);
      if (verificationResult && verificationResult.success) {
        let consumeResult;
        if (consumptionMode === 'all') {
          consumeResult = await consumeAllAvailableTickets();
          if (consumeResult.success) {
            toast({ title: "¡Todos los Tickets Consumidos!", description: `${consumeResult.count} ticket(s) validados.`, className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-600" });
          } else {
            toast({ title: "Error al Consumir Todo", description: consumeResult.error || "No se pudieron consumir todos los tickets.", variant: "destructive" });
          }
        } else if (ticketGroupToConsume) {
          consumeResult = await consumeTicketGroup(ticketGroupToConsume.type_id || ticketGroupToConsume.type.id); 
          if(consumeResult.success){
            toast({ title: "¡Pedido Consumido!", description: `${consumeResult.count} ticket(s) de ${ticketGroupToConsume.name || ticketGroupToConsume.type.name} validados.`, className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-600" });
          } else {
            toast({ title: "Error al Consumir", description: consumeResult.error || "No se pudieron consumir los tickets.", variant: "destructive" });
          }
        }
        setShowPinModal(false);
        setTicketGroupToConsume(null);
        setConsumptionMode('group');
      } else {
        toast({ title: "Validación Fallida", description: verificationResult.error || "PIN incorrecto.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error during PIN verification or consumption:", error);
      toast({ title: "Error de Validación", description: error.message || "Ocurrió un error.", variant: "destructive" });
    }
  };

  const handleStripeRechargeRequest = async (amount) => {
    if (!stripePromise || !stripeSettings.priceId || !isStripeConfigured) {
      toast({ title: "Stripe no configurado", description: "Configura Stripe en Admin.", variant: "destructive" });
      setActiveTab('admin');
      setAdminSubSection('stripe_config');
      return;
    }
    try {
      await initiateStripeRecharge(amount, stripeSettings.priceId, await stripePromise);
    } catch (error) {
       toast({ title: "Error de Stripe", description: error.message || "No se pudo iniciar el pago.", variant: "destructive" });
    }
  };

  if (loading) { 
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-3" />
        <p className="text-lg text-foreground/80">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <nav className="shrink-0 bg-card/90 backdrop-blur-md border-b border-border/50 shadow-sm z-50 w-full">
        <div className="flex justify-around p-1 container mx-auto max-w-sm">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => handleNavigation(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center h-12 text-xs transition-all duration-200 ease-in-out rounded-md
                ${activeTab === tab.id 
                  ? 'bg-primary/15 text-primary scale-105' 
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
            >
              <tab.icon className={`w-4 h-4 mb-0.5 ${activeTab === tab.id ? 'text-primary' : ''}`} />
              {tab.name}
            </Button>
          ))}
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-2 py-2 max-w-sm w-full flex flex-col overflow-y-auto custom-scrollbar-thin">
        <div className="flex-grow flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="w-full"
            >
              {activeTab === 'recharge' && (
                <RechargeTab 
                  balance={data.balance} 
                  onRecharge={handleStripeRechargeRequest}
                  isStripeConfigured={isStripeConfigured}
                  onConfigureStripe={handleStripeModalNavigation}
                />
              )}
              {activeTab === 'tickets' && (
                <TicketsTab
                  balance={data.balance}
                  tickets={data.tickets}
                  ticketTypes={data.ticketTypes}
                  onPurchase={purchaseTickets}
                  onConsumeGroupRequest={handleConsumeGroupRequest}
                  onConsumeAllRequest={handleConsumeAllRequest}
                  availableTicketsCount={data.tickets.filter(t => !t.consumed).length}
                />
              )}
              {activeTab === 'admin' && (
                <AdminTab
                  data={data}
                  onUpdateTicketType={updateTicketType}
                  onUpdateGlobalPin={updateGlobalPin}
                  onSimulateRecharge={simulateRecharge} // Pass new handler
                  globalPin={data.globalPin}
                  stripeSettings={stripeSettings}
                  onUpdateStripeSettings={updateStripeSettings}
                  onStripeConfigured={() => setIsStripeConfigured(true)}
                  initialSection={adminSubSection}
                  setInitialSection={setAdminSubSection}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      
      <Toaster />
      <PinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onVerifyPin={handlePinVerification}
        consumptionMode={consumptionMode}
        ticketGroupToConsumeName={ticketGroupToConsume?.name || ticketGroupToConsume?.type.name}
        availableTicketsCount={data.tickets.filter(t => !t.consumed).length}
      />
      <StripeInfoModal
        isOpen={showStripeInfoModal}
        onClose={() => setShowStripeInfoModal(false)}
        onGoToAdmin={handleStripeModalNavigation}
      />
    </div>
  );
}