CREATE TABLE IF NOT EXISTS public.grillvi_order_records (
  id TEXT PRIMARY KEY,
  order_data JSONB NOT NULL CHECK (jsonb_typeof(order_data) = 'object'),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_grillvi_order_records_created_at
  ON public.grillvi_order_records (created_at DESC);

ALTER TABLE public.grillvi_order_records ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.grillvi_order_records FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.grillvi_order_records TO service_role;
