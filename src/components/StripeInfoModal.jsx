
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Settings } from 'lucide-react';

const StripeInfoModal = ({ isOpen, onClose, onGoToAdmin }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[calc(100vw-2rem)] w-auto m-2 bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-amber-500 text-lg flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-500" /> Stripe Requerido
          </DialogTitle>
          <DialogDescription className="text-foreground/80 pt-1 text-xs">
            Para recargas, configura Stripe en <span className="font-semibold text-primary">Admin &gt; Stripe</span>.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="grid grid-cols-2 gap-2 mt-2">
          <Button variant="ghost" onClick={onClose} className="h-9 text-sm">
            Entendido
          </Button>
          <Button
            onClick={onGoToAdmin}
            className="gradient-button-primary h-9 text-sm"
          >
            <Settings className="w-3 h-3 mr-1" /> Ir a Admin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StripeInfoModal;