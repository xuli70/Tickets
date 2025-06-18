import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export function useAppData() {
  const [data, setData] = useState({
    balance: 0,
    tickets: [],
    ticketTypes: [],
    globalPin: null,
    metrics: {
      totalRecharges: 0,
      totalTicketsPurchased: 0,
      totalTicketsConsumed: 0,
      totalRevenue: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [stripeSettings, setStripeSettings] = useState({
    publishableKey: '',
    priceId: ''
  });
  const { toast } = useToast();

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('balance')
        .select('amount')
        .single();

      if (balanceError && balanceError.code !== 'PGRST116') {
        throw balanceError;
      }

      // Fetch tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          *,
          type:ticket_types(*)
        `)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      // Fetch ticket types
      const { data: typesData, error: typesError } = await supabase
        .from('ticket_types')
        .select('*')
        .order('name');

      if (typesError) throw typesError;

      // Fetch global PIN
      const { data: pinData, error: pinError } = await supabase
        .from('global_pin')
        .select('pin_hash')
        .single();

      if (pinError && pinError.code !== 'PGRST116') {
        throw pinError;
      }

      // Fetch Stripe settings
      const { data: stripeData, error: stripeError } = await supabase
        .from('stripe_settings')
        .select('*')
        .single();

      if (stripeError && stripeError.code !== 'PGRST116') {
        console.log('No Stripe settings found');
      }

      // Calculate metrics
      const metrics = {
        totalRecharges: 0, // This would need transaction history
        totalTicketsPurchased: ticketsData?.length || 0,
        totalTicketsConsumed: ticketsData?.filter(t => t.consumed).length || 0,
        totalRevenue: 0 // This would need transaction history
      };

      setData({
        balance: balanceData?.amount || 0,
        tickets: ticketsData || [],
        ticketTypes: typesData || [],
        globalPin: pinData?.pin_hash || null,
        metrics
      });

      if (stripeData) {
        setStripeSettings({
          publishableKey: stripeData.publishable_key || '',
          priceId: stripeData.price_id || ''
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error al cargar datos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Stripe recharge functions
  const initiateStripeRecharge = async (amount, priceId, stripe) => {
    try {
      const { data: session, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { amount, priceId }
      });

      if (error) throw error;

      const result = await stripe.redirectToCheckout({
        sessionId: session.sessionId
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const confirmStripeRecharge = async (sessionId, amount) => {
    try {
      const { data, error } = await supabase
        .from('balance')
        .update({ amount: data.balance + amount })
        .eq('id', 1)
        .select();

      if (error) throw error;
      
      await fetchData();
      return true;
    } catch (error) {
      console.error('Error confirming recharge:', error);
      return false;
    }
  };

  // Simulate recharge (for testing)
  const simulateRecharge = async (amount) => {
    try {
      const newBalance = data.balance + amount;
      
      const { error } = await supabase
        .from('balance')
        .upsert({ id: 1, amount: newBalance });

      if (error) throw error;
      
      await fetchData();
      return { success: true };
    } catch (error) {
      console.error('Error simulating recharge:', error);
      return { success: false, error: error.message };
    }
  };

  // Purchase tickets
  const purchaseTickets = async (ticketTypeId, quantity) => {
    try {
      const ticketType = data.ticketTypes.find(t => t.id === ticketTypeId);
      if (!ticketType) throw new Error('Tipo de ticket no encontrado');

      const totalCost = ticketType.price * quantity;
      if (data.balance < totalCost) {
        throw new Error('Saldo insuficiente');
      }

      // Create tickets
      const tickets = Array(quantity).fill(null).map(() => ({
        type_id: ticketTypeId,
        consumed: false
      }));

      const { error: ticketError } = await supabase
        .from('tickets')
        .insert(tickets);

      if (ticketError) throw ticketError;

      // Update balance
      const { error: balanceError } = await supabase
        .from('balance')
        .update({ amount: data.balance - totalCost })
        .eq('id', 1);

      if (balanceError) throw balanceError;

      await fetchData();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Consume ticket group
  const consumeTicketGroup = async (typeId) => {
    try {
      const availableTickets = data.tickets
        .filter(t => t.type_id === typeId && !t.consumed)
        .slice(0, 10); // Max 10 tickets per consumption

      if (availableTickets.length === 0) {
        throw new Error('No hay tickets disponibles de este tipo');
      }

      const ticketIds = availableTickets.map(t => t.id);
      
      const { error } = await supabase
        .from('tickets')
        .update({ consumed: true, consumed_at: new Date().toISOString() })
        .in('id', ticketIds);

      if (error) throw error;

      await fetchData();
      return { success: true, count: ticketIds.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Consume all available tickets
  const consumeAllAvailableTickets = async () => {
    try {
      const availableTickets = data.tickets.filter(t => !t.consumed);
      
      if (availableTickets.length === 0) {
        throw new Error('No hay tickets disponibles');
      }

      const ticketIds = availableTickets.map(t => t.id);
      
      const { error } = await supabase
        .from('tickets')
        .update({ consumed: true, consumed_at: new Date().toISOString() })
        .in('id', ticketIds);

      if (error) throw error;

      await fetchData();
      return { success: true, count: ticketIds.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Update ticket type
  const updateTicketType = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('ticket_types')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchData();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Update global PIN
  const updateGlobalPin = async (newPin) => {
    try {
      // Simple hash function for demo (in production, use bcrypt)
      const pinHash = btoa(newPin);
      
      const { error } = await supabase
        .from('global_pin')
        .upsert({ id: 1, pin_hash: pinHash });

      if (error) throw error;

      await fetchData();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Verify global PIN
  const verifyGlobalPin = async (pinAttempt) => {
    try {
      const pinHash = btoa(pinAttempt);
      return { success: pinHash === data.globalPin };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Update Stripe settings
  const updateStripeSettings = async (settings) => {
    try {
      const { error } = await supabase
        .from('stripe_settings')
        .upsert({
          id: 1,
          publishable_key: settings.publishableKey,
          price_id: settings.priceId
        });

      if (error) throw error;

      setStripeSettings(settings);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    data,
    loading,
    stripeSettings,
    initiateStripeRecharge,
    confirmStripeRecharge,
    simulateRecharge,
    purchaseTickets,
    consumeTicketGroup,
    consumeAllAvailableTickets,
    updateTicketType,
    updateGlobalPin,
    verifyGlobalPin,
    updateStripeSettings
  };
}
