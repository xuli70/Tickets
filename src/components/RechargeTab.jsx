import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Minus, Wallet, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const RechargeTab = ({ balance, onRecharge, isStripeConfigured, onConfigureStripe }) => {
  const [amount, setAmount] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRecharge = async () => {
    if (!isStripeConfigured) {
      toast({
        title: "Configuración de Stripe Requerida",
        description: "Por favor, configura Stripe en la pestaña Admin para recargar.",
        variant: "destructive",
      });
      if (onConfigureStripe) onConfigureStripe();
      return;
    }

    setIsProcessing(true);
    
    try {
      await onRecharge(amount);
    } catch (error) {
      console.error("Error en la recarga con Stripe:", error);
      toast({
        title: "Error en la Recarga",
        description: error.message || "No se pudo iniciar el proceso de pago. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const presetAmounts = [5, 10, 20, 50];

  return (
    <div className="space-y-4 h-full flex flex-col overflow-hidden">
      <motion.div 
        className="text-center p-4 bg-card/80 glass-effect rounded-xl shadow-xl shrink-0"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-secondary to-teal-400 rounded-full mb-2 shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Wallet className="w-8 h-8 text-secondary-foreground" />
        </motion.div>
        <h2 className="text-lg font-semibold text-card-foreground mb-0.5">Saldo Actual</h2>
        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-teal-300">
          €{balance.toFixed(2)}
        </div>
      </motion.div>

      <motion.div 
        className="bg-card/80 glass-effect p-4 rounded-xl shadow-xl flex-grow flex flex-col justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div>
          <h3 className="text-lg font-semibold text-card-foreground mb-3 text-center">Recargar Saldo</h3>
          
          {!isStripeConfigured && (
            <div className="mb-3 p-2.5 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300 text-xs flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>La recarga requiere configurar Stripe en Admin.</span>
            </div>
          )}
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            {presetAmounts.map((preset) => (
              <Button
                key={preset}
                variant={amount === preset ? "default" : "outline"}
                onClick={() => setAmount(preset)}
                className={`h-10 text-sm font-semibold transition-all duration-200 ${amount === preset ? 'gradient-button-primary scale-105' : 'border-primary/50 text-primary hover:bg-primary/10 hover:border-primary'}`}
                disabled={!isStripeConfigured || isProcessing}
              >
                €{preset}
              </Button>
            ))}
          </div>

          <div className="flex items-center justify-center space-x-3 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setAmount(Math.max(1, amount - 1))}
              disabled={amount <= 1 || !isStripeConfigured || isProcessing}
              className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary rounded-full w-10 h-10"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <div className="text-2xl font-bold text-card-foreground min-w-[70px] text-center">
              €{amount}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setAmount(amount + 1)}
              disabled={!isStripeConfigured || isProcessing}
              className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary rounded-full w-10 h-10"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Button
          onClick={handleRecharge}
          disabled={isProcessing || !isStripeConfigured}
          className="w-full h-12 text-base font-semibold gradient-button-primary rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
        >
          {isProcessing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
            />
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Recargar con Stripe
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
};

export default RechargeTab;