
-- Add modo_pago column to cargas table
ALTER TABLE public.cargas 
ADD COLUMN modo_pago TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN public.cargas.modo_pago IS 'Payment method for the cargo (e.g., Efectivo, Transferencia, Cheque, etc.)';
