
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Plus, Minus, ShoppingCart, Eye, EyeOff, Beer, CheckCircle, Trash2, ListChecks, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const getColorByNameOrPrice = (type) => {
  const name = type.name.toLowerCase();
  const value = type.value;

  if (type.color) return type.color; 

  if (name.includes("mini")) return "from-yellow-700 to-yellow-800"; 
  if (name.includes("básico") || name.includes("basico")) return "from-green-400 to-emerald-500"; 
  if (name.includes("estándar") || name.includes("estandar")) return "from-blue-500 to-blue-700"; 
  if (name.includes("premium")) return "from-purple-500 to-indigo-600"; 

  if (value <= 1 && !name.includes("mini")) return "from-sky-400 to-cyan-500"; 
  if (value <= 2 && !(name.includes("básico") || name.includes("basico"))) return "from-emerald-400 to-green-500";
  if (value === 3 && !(name.includes("estándar") || name.includes("estandar"))) return "from-amber-400 to-orange-500"; 
  if (value <= 5 && !name.includes("premium") && !(name.includes("estándar") || name.includes("estandar"))) return "from-amber-400 to-orange-500";
  if (value <= 10) return "from-rose-400 to-red-500";
  return "from-violet-500 to-fuchsia-600";
};


const TicketsTab = ({ balance, tickets, ticketTypes, onPurchase, onConsumeGroupRequest, onConsumeAllRequest, availableTicketsCount }) => {
  const [order, setOrder] = useState([]);
  const [showAvailable, setShowAvailable] = useState(true);

  const availableTickets = tickets.filter(t => !t.consumed);
  const consumedTickets = tickets.filter(t => t.consumed);

  const handleAddToOrder = (ticketType) => {
    setOrder(prevOrder => {
      const existingItem = prevOrder.find(item => item.ticketType.id === ticketType.id);
      if (existingItem) {
        return prevOrder.map(item => 
          item.ticketType.id === ticketType.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prevOrder, { ticketType, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (ticketTypeId, change) => {
    setOrder(prevOrder => 
      prevOrder.map(item => 
        item.ticketType.id === ticketTypeId 
          ? { ...item, quantity: Math.max(0, item.quantity + change) } 
          : item
      ).filter(item => item.quantity > 0) 
    );
  };

  const handleRemoveFromOrder = (ticketTypeId) => {
    setOrder(prevOrder => prevOrder.filter(item => item.ticketType.id !== ticketTypeId));
  };

  const totalOrderCost = useMemo(() => {
    return order.reduce((total, item) => total + (item.ticketType.value * item.quantity), 0);
  }, [order]);

  const handlePurchaseOrder = async () => {
    if (order.length === 0) {
      toast({ title: "Pedido vacío", description: "Añade tickets a tu pedido.", variant: "destructive" });
      return;
    }
    if (balance < totalOrderCost) {
      toast({ title: "Saldo insuficiente", description: "Recarga tu saldo para continuar.", variant: "destructive" });
      return;
    }

    const purchaseResult = await onPurchase(order);
    if (purchaseResult && purchaseResult.success) {
      toast({
        title: "¡Pedido Realizado!",
        description: `Has comprado ${order.reduce((sum, item) => sum + item.quantity, 0)} ticket(s).`,
        className: "bg-secondary text-secondary-foreground border-secondary"
      });
      setOrder([]);
    } else {
       toast({
        title: "Error en la Compra",
        description: purchaseResult.error || "No se pudo completar el pedido.",
        variant: "destructive"
      });
    }
  };

  const TicketTypeSelectorCard = ({ type, onSelect }) => {
    const bgColor = getColorByNameOrPrice(type);
    return (
      <motion.div
        whileTap={{ scale: 0.95 }}
        className={`relative flex-shrink-0 w-[120px] h-36 flex flex-col justify-center items-center p-3 transition-all duration-200 rounded-xl cursor-pointer
                   border-2 border-transparent hover:border-primary/70
                   bg-gradient-to-br ${bgColor} text-primary-foreground shadow-lg 
                   hover:shadow-primary/30`}
        onClick={() => onSelect(type)}
      >
        <div className="text-4xl font-bold">€{type.value}</div>
        <div className="text-lg mt-1 opacity-90 text-center leading-tight">{type.name}</div>
        <div className="absolute top-2 right-2 p-1.5 bg-black/30 rounded-full">
          <Plus className="w-5 h-5 text-white/80" />
        </div>
      </motion.div>
    );
  };
  
  const availableTicketGroups = useMemo(() => {
    const groups = {};
    availableTickets.forEach(ticket => {
      const typeId = ticket.type_id || ticket.type.id;
      if (!groups[typeId]) {
        groups[typeId] = {
          representativeTicket: ticket,
          count: 0,
          name: ticket.name || ticket.type.name,
          value: ticket.value || ticket.type.value,
          color: ticket.type?.color || getColorByNameOrPrice(ticket.type || ticket), 
        };
      }
      groups[typeId].count++;
    });
    return Object.values(groups);
  }, [availableTickets]);


  return (
    <div className="space-y-6 h-full flex flex-col">
      <motion.div 
        className="bg-card/80 glass-effect p-4 rounded-xl shadow-xl shrink-0"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h3 className="text-2xl font-semibold text-card-foreground mb-3 text-center">Añadir Tickets</h3>
        
        {ticketTypes.filter(type => type.active).length > 0 ? (
          <div className="flex flex-wrap gap-3 justify-center">
            {ticketTypes.filter(type => type.active).map((type) => (
              <TicketTypeSelectorCard key={type.id} type={type} onSelect={handleAddToOrder} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4 text-lg">No hay tipos de ticket activos.</p>
        )}
      </motion.div>

      {order.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-card/80 glass-effect p-4 rounded-xl shadow-xl space-y-3 shrink-0"
        >
          <h4 className="text-xl font-medium text-card-foreground flex items-center">
            <ListChecks className="w-6 h-6 mr-2 text-primary"/>
            Tu Pedido
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1.5 custom-scrollbar-thin">
            {order.map(item => (
              <motion.div 
                key={item.ticketType.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center justify-between p-2.5 bg-background/50 rounded-lg text-lg"
              >
                <div>
                  <div className="font-semibold text-foreground">{item.ticketType.name} (€{item.ticketType.value})</div>
                  <div className="text-base text-muted-foreground">Subtotal: €{(item.ticketType.value * item.quantity).toFixed(2)}</div>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Button variant="ghost" size="icon" onClick={() => handleUpdateQuantity(item.ticketType.id, -1)} className="w-9 h-9 rounded-full text-primary hover:bg-primary/10"> <Minus className="w-5 h-5" /></Button>
                  <span className="text-lg font-medium text-foreground w-6 text-center">{item.quantity}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleUpdateQuantity(item.ticketType.id, 1)} className="w-9 h-9 rounded-full text-primary hover:bg-primary/10"> <Plus className="w-5 h-5" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveFromOrder(item.ticketType.id)} className="w-9 h-9 rounded-full text-destructive hover:bg-destructive/10"> <Trash2 className="w-5 h-5" /></Button>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-right space-y-1 pt-2 border-t border-border/30">
            <div className="text-xl font-semibold text-card-foreground">Total: €{totalOrderCost.toFixed(2)}</div>
            <div className="text-base text-muted-foreground">Saldo: €{balance.toFixed(2)}</div>
          </div>

          <Button
            onClick={handlePurchaseOrder}
            disabled={balance < totalOrderCost || order.length === 0}
            className="w-full h-12 text-lg font-semibold gradient-button-secondary rounded-lg shadow-lg hover:shadow-xl"
          >
            <ShoppingCart className="w-6 h-6 mr-2" />
            Comprar Pedido ({order.reduce((sum, item) => sum + item.quantity, 0)})
          </Button>
        </motion.div>
      )}
      
      <motion.div 
        className="flex-grow bg-card/80 glass-effect p-4 rounded-xl shadow-xl flex flex-col"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h3 className="text-2xl font-semibold text-card-foreground">Mis Tickets</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="lg" 
              onClick={() => setShowAvailable(!showAvailable)}
              className="border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60 h-10 px-3 text-base"
            >
              {showAvailable ? <Eye className="w-5 h-5 mr-1.5" /> : <EyeOff className="w-5 h-5 mr-1.5" />}
              {showAvailable ? 'Disponibles' : 'Consumidos'} ({showAvailable ? availableTicketGroups.length : consumedTickets.length})
            </Button>
            {showAvailable && availableTicketsCount > 0 && (
              <Button
                variant="destructive"
                size="lg"
                onClick={onConsumeAllRequest}
                className="bg-red-600 hover:bg-red-700 text-white h-10 px-3 text-base"
              >
                <CheckSquare className="w-5 h-5 mr-1.5" />
                Consumir Todo ({availableTicketsCount})
              </Button>
            )}
          </div>
        </div>

        <div className="flex-grow space-y-2 overflow-y-auto pr-1.5 custom-scrollbar-thin">
          <AnimatePresence>
            {showAvailable 
              ? availableTicketGroups.map((group) => {
                  const displayColor = group.color; 
                  return (
                    <motion.div
                      key={group.representativeTicket.type_id || group.representativeTicket.type.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -15, transition: { duration: 0.2 } }}
                      className={`p-3 rounded-lg border text-lg text-primary-foreground bg-gradient-to-br ${displayColor} shadow-lg`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xl">({group.count}x) €{group.value} - {group.name}</div>
                          <div className={`text-base opacity-85`}>
                            Listos para consumir
                          </div>
                        </div>
                        <Button
                          onClick={() => onConsumeGroupRequest(group.representativeTicket)}
                          size="lg"
                          variant="secondary"
                          className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-primary-foreground/30 backdrop-blur-md h-10 px-3 text-base"
                        >
                          <Beer className="w-5 h-5 mr-1.5" />
                          Consumir
                        </Button>
                      </div>
                    </motion.div>
                  );
                })
              : consumedTickets.map((ticket) => {
                  const ticketValue = ticket.value || ticket.type?.value;
                  const displayColor = ticket.type?.color || getColorByNameOrPrice(ticket.type || ticket);
                  return (
                    <motion.div
                      key={ticket.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -15, transition: { duration: 0.2 } }}
                      className={`p-3 rounded-lg border text-lg bg-muted/30 border-muted/20 opacity-70`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-xl text-foreground/80">€{ticketValue} - {ticket.name || ticket.type?.name}</div>
                          <div className={`text-base opacity-80 text-muted-foreground`}>
                            Comprado: {new Date(ticket.purchased_at || ticket.purchased).toLocaleDateString()}
                          </div>
                          {ticket.consumed && ticket.consumed_at && (
                             <div className="text-base opacity-80 text-muted-foreground">
                               Consumido: {new Date(ticket.consumed_at).toLocaleDateString()}
                             </div>
                          )}
                        </div>
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                    </motion.div>
                  );
              })}
          </AnimatePresence>
        </div>

        {(showAvailable ? availableTicketGroups.length : consumedTickets.length) === 0 && (
          <div className="text-center py-6 text-muted-foreground flex-grow flex flex-col justify-center items-center">
            <Ticket className="w-16 h-16 mx-auto mb-2 opacity-30" />
            <p className="text-lg">No hay tickets {showAvailable ? 'disponibles' : 'consumidos'}.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TicketsTab;