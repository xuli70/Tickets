
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Settings2, Info, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

const StripeConfigSection = ({ stripeSettings, onUpdateStripeSettings, onStripeConfigured }) => {
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [stripePriceId, setStripePriceId] = useState('');
  const [showPublishableKey, setShowPublishableKey] = useState(false);

  const simulatedStripePublishableKey = "pk_test_YOUR_SIMULATED_PUBLISHABLE_KEY";
  const simulatedStripePriceId = "price_YOUR_SIMULATED_PRICE_ID";

  useEffect(() => {
    if (stripeSettings) {
      setStripePublishableKey(stripeSettings.publishableKey || '');
      setStripePriceId(stripeSettings.priceId || '');
    }
  }, [stripeSettings]);

  const handleSaveStripeSettings = async () => {
    if (!stripePublishableKey.trim() || !stripePriceId.trim()) {
      toast({ title: "Error", description: "Ambos campos de Stripe son requeridos.", variant: "destructive" });
      return;
    }
    const success = await onUpdateStripeSettings({
      publishableKey: stripePublishableKey.trim(),
      priceId: stripePriceId.trim(),
    });
    if (success) {
      toast({
        title: "Configuración de Stripe Guardada",
        description: "Tus claves de Stripe han sido actualizadas.",
        className: "bg-green-500 text-white border-green-600"
      });
      if (onStripeConfigured) onStripeConfigured();
    } else {
      toast({ title: "Error", description: "No se pudo guardar la configuración de Stripe.", variant: "destructive" });
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg p-3 shadow-lg border border-border/50"
    >
      <h3 className="text-base font-semibold text-primary mb-2 flex items-center">
        <CreditCard className="w-4 h-4 mr-1.5" /> Configuración de Stripe
      </h3>
      <div className="p-2 bg-blue-900/20 border border-blue-700 rounded-md text-blue-300 text-[10px] mb-3">
        <div className="flex items-start">
          <Info className="w-3 h-3 mr-1.5 mt-0.5 flex-shrink-0" />
          <div>
          Clave Publicable y ID de Precio (para producto único, importe dinámico/0).
          <br/>Pruebas: <code className="text-[9px] bg-blue-800/50 px-0.5 rounded">{simulatedStripePublishableKey.substring(0,15)}...</code> y <code className="text-[9px] bg-blue-800/50 px-0.5 rounded">{simulatedStripePriceId.substring(0,10)}...</code>.
          </div>
        </div>
        <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:text-blue-300 underline mt-0.5">Claves API &rarr;</a>
      </div>
      <div className="space-y-2.5">
        <div>
          <label htmlFor="stripe-publishable-key" className="block text-xs font-medium text-foreground/90 mb-0.5">Clave Publicable</label>
          <div className="flex items-center space-x-1.5">
            <Input
              id="stripe-publishable-key"
              type={showPublishableKey ? "text" : "password"}
              value={stripePublishableKey}
              onChange={(e) => setStripePublishableKey(e.target.value)}
              placeholder={stripeSettings.publishableKey ? "pk_test_••••" : simulatedStripePublishableKey}
              className="flex-grow h-8 text-xs"
            />
            <Button variant="outline" size="icon" onClick={() => setShowPublishableKey(!showPublishableKey)} className="w-7 h-7">
              {showPublishableKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
        <div>
          <label htmlFor="stripe-price-id" className="block text-xs font-medium text-foreground/90 mb-0.5">ID de Precio</label>
          <Input
            id="stripe-price-id"
            type="text"
            value={stripePriceId}
            onChange={(e) => setStripePriceId(e.target.value)}
            placeholder={stripeSettings.priceId ? "price_••••" : simulatedStripePriceId}
            className="h-8 text-xs"
          />
        </div>
        <Button onClick={handleSaveStripeSettings} className="w-full gradient-button-primary h-8 text-xs">
          <Settings2 className="w-3.5 h-3.5 mr-1.5" /> Guardar Stripe
        </Button>
      </div>
    </motion.div>
  );
};

export default StripeConfigSection;