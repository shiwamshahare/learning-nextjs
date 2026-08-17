'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { fetchCustomers } from './data';
import { CustomerField } from './definitions';

 
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });
 
export async function createInvoice(formData: FormData) {
  if(!formData.get('customerId') || !formData.get('amount') || !formData.get('status')) {
    return;
  }
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
   });
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    console.log(`${customerId}, ${amountInCents}, ${status}, ${date}`);
  try {
      
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  }
  catch (err) {
    console.error(err, "error")
    return {
      message:"Database Error: Failed to Create Invoice."
    }
  }
  revalidatePath('/dashboard/invoices');
    //  redirect('/dashboard/invoices');
  // Test it out:


  return {
    success: true,
  };
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
// ...
 
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  }
  catch (err) {
    console.error(err, "error")
    return {
      message:"Database Error: Failed to Update Invoice."
    }
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  throw new Error('Failed to Delete Invoice');
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}


export async function getCustomersForModal(): Promise<CustomerField[]> {
  'use server';

  try {
    const customers = await fetchCustomers();
    return customers;
  } catch (error) {
    console.error('Error fetching customers for modal:', error);
    return [];
  }
}