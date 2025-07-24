-- Phase 1: Critical Database Security Fixes

-- Enable RLS on unprotected tables
ALTER TABLE public.cabecalho_temperatura_umidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_temperatura_umidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nao_conformidades ENABLE ROW LEVEL SECURITY;

-- Fix function search path security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Phase 2: Create profiles table for authentication
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  role text DEFAULT 'user',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  );
  RETURN new;
END;
$$;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update controle_qualidade to use user_id properly and require authentication
DROP POLICY "Allow all operations on quality controls" ON public.controle_qualidade;

CREATE POLICY "Users can view their own quality controls"
ON public.controle_qualidade
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quality controls"
ON public.controle_qualidade
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quality controls"
ON public.controle_qualidade
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quality controls"
ON public.controle_qualidade
FOR DELETE
USING (auth.uid() = user_id);

-- Make user_id required again
ALTER TABLE public.controle_qualidade ALTER COLUMN user_id SET NOT NULL;

-- Update itens_controle policies to be user-based through controle_qualidade
DROP POLICY "Allow all operations on control items" ON public.itens_controle;

CREATE POLICY "Users can view items from their quality controls"
ON public.itens_controle
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.controle_qualidade 
    WHERE id = controle_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create items for their quality controls"
ON public.itens_controle
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.controle_qualidade 
    WHERE id = controle_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update items from their quality controls"
ON public.itens_controle
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.controle_qualidade 
    WHERE id = controle_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete items from their quality controls"
ON public.itens_controle
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.controle_qualidade 
    WHERE id = controle_id AND user_id = auth.uid()
  )
);

-- Create user-based policies for temperature and humidity records
CREATE POLICY "Users can view temperature records"
ON public.registros_temperatura_umidade
FOR SELECT
USING (true); -- Allow all authenticated users to view

CREATE POLICY "Users can create temperature records"
ON public.registros_temperatura_umidade
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Create user-based policies for non-conformities
CREATE POLICY "Users can view non-conformities"
ON public.nao_conformidades
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create non-conformities"
ON public.nao_conformidades
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Create user-based policies for header table
CREATE POLICY "Users can view headers"
ON public.cabecalho_temperatura_umidade
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create headers"
ON public.cabecalho_temperatura_umidade
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');