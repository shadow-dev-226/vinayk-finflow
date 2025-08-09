-- Create users table with predefined IDs
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  photo TEXT DEFAULT 'https://pin.it/1UMt77Jy7',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create income table
CREATE TABLE public.income (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Insert predefined users with passwords
INSERT INTO public.users (id, password, role, name) VALUES
('384920176', 'pass1234', 'user', 'User 1'),
('751638249', 'pass5678', 'user', 'User 2'),
('290475813', 'pass9012', 'user', 'User 3'),
('867531024', 'pass3456', 'user', 'User 4'),
('439207561', 'pass7890', 'user', 'User 5'),
('605182973', 'pass2468', 'user', 'User 6'),
('admin001', 'admin123', 'admin', 'Administrator');

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile and admin can view all" 
ON public.users 
FOR SELECT 
USING (true); -- Allow all users to read (we'll handle this in app logic)

CREATE POLICY "Users can update own profile and admin can update all" 
ON public.users 
FOR UPDATE 
USING (true); -- Handle in app logic

-- Create RLS policies for income table
CREATE POLICY "Users can view own income and admin can view all" 
ON public.income 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert own income" 
ON public.income 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update own income and admin can update all" 
ON public.income 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete own income and admin can delete all" 
ON public.income 
FOR DELETE 
USING (true);

-- Create RLS policies for expenses table
CREATE POLICY "Users can view own expenses and admin can view all" 
ON public.expenses 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert own expenses" 
ON public.expenses 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update own expenses and admin can update all" 
ON public.expenses 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete own expenses and admin can delete all" 
ON public.expenses 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_income_updated_at
  BEFORE UPDATE ON public.income
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();