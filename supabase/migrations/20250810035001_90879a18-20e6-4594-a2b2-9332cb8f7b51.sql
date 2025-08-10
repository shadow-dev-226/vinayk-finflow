-- Update RLS policies for income table to allow users to edit their own records and admins to edit all
DROP POLICY IF EXISTS "Users can update their own income" ON public.income;
DROP POLICY IF EXISTS "Users can delete their own income" ON public.income;

CREATE POLICY "Users can update their own income, admins can update all" 
ON public.income 
FOR UPDATE 
USING (
  auth.uid()::text = user_id OR 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid()::text AND role = 'admin'
  )
);

CREATE POLICY "Users can delete their own income, admins can delete all" 
ON public.income 
FOR DELETE 
USING (
  auth.uid()::text = user_id OR 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid()::text AND role = 'admin'
  )
);

-- Update RLS policies for expenses table to allow users to edit their own records and admins to edit all
DROP POLICY IF EXISTS "Users can update their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.expenses;

CREATE POLICY "Users can update their own expenses, admins can update all" 
ON public.expenses 
FOR UPDATE 
USING (
  auth.uid()::text = user_id OR 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid()::text AND role = 'admin'
  )
);

CREATE POLICY "Users can delete their own expenses, admins can delete all" 
ON public.expenses 
FOR DELETE 
USING (
  auth.uid()::text = user_id OR 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid()::text AND role = 'admin'
  )
);