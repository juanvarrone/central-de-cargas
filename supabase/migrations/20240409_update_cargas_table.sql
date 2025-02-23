
ALTER TABLE cargas
ADD COLUMN origen_detalle text,
ADD COLUMN destino_detalle text,
ADD COLUMN fecha_carga_hasta timestamp with time zone;

-- Rename fecha_carga to fecha_carga_desde for clarity
ALTER TABLE cargas 
RENAME COLUMN fecha_carga TO fecha_carga_desde;
