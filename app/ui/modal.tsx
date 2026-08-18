'use client';


import { useEffect, useState, useActionState } from 'react';
import Breadcrumbs from './invoices/breadcrumbs';
import { CheckIcon, ClockIcon, CurrencyDollarIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from './button';
import { createInvoice, getCustomersForModal, State } from '../lib/actions';
import {
  CustomerField,
} from '../lib/definitions';
import clsx from 'clsx';


export default function Modal({ children, isOpen, onClose }: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(createInvoice, initialState);

  const [customers, setCustomers] = useState<CustomerField[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch customers when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;

    async function fetchCustomersData() {
      try {
        setLoading(true);
        setError(null);
        const customersData = await getCustomersForModal();

        // Only update state if component is still mounted
        if (!isCancelled) {
          setCustomers(customersData);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching customers:', error);
          setError('Failed to load customers');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchCustomersData();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isCancelled = true;
    };
  }, [isOpen])

  // const handleSubmit = async (formData: FormData) => {
  //   try {
  //     await formAction(formData);
  //     // Optionally close modal on success or reset form
  //     // onClose(); // Uncomment if you want to close on success
  //   } catch (error) {
  //     // Handle any unexpected errors
  //     console.error('Form submission error:', error);
  //     // You could also set a general error state here if needed
  //   }
  // };


  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="relative bg-white rounded-lg shadow-lg w-full p-6">
            <h6>Create Invoice</h6>
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-2 text-red-400 hover:text-gray-600 border border-red-400 rounded-md p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 px-3"
              aria-label="Close modal"
            >
              X{/* <XIcon className="h-5 w-5" /> */}
            </button>

            {/* Modal content */}
            <div className="mt-6">
              <main>
                {/* <Breadcrumbs
                  breadcrumbs={[
                    { label: 'Invoices', href: '/dashboard/invoices' },
                    {
                      label: 'Create Invoice',
                      href: '/dashboard/invoices',
                      active: true,
                    },
                  ]}
                /> */}
                <form action={formAction} >
                  <div className="rounded-md bg-gray-50 p-4 md:p-6">
                    {/* Customer Name */}
                    <div className="mb-4">
                      <label htmlFor="customer" className="mb-2 block text-sm font-medium">
                        Choose customer
                      </label>
                      <div className="relative">
                        <select
                          id="customer"
                          name="customerId"
                          className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                          defaultValue=""
                          aria-describedby="customer-error"
                        >
                          <option value="" disabled>
                            Select a customer
                          </option>
                          {loading ? (
                            <option>Loading customers...</option>
                          ) : error ? (
                            <option>{error}</option>
                          ) : (
                            customers.map((customer) => (
                              <option key={customer.id} value={customer.id}>
                                {customer.name}
                              </option>
                            ))
                          )}
                        </select>
                        <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                      </div>
                      <div id="customer-error" aria-live="polite" aria-atomic="true">
                        {state.errors?.customerId &&
                          state.errors.customerId.map((error: string) => (
                            <p className="mt-2 text-sm text-red-500" key={error}>
                              {error}
                            </p>
                          ))}
                      </div>
                    </div>

                    {/* Invoice Amount */}
                    <div className="mb-4">
                      <label htmlFor="amount" className="mb-2 block text-sm font-medium">
                        Choose an amount
                      </label>
                      <div className="relative mt-2 rounded-md">
                        <div className="relative">
                          <input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            placeholder="Enter USD amount"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                            aria-describedby="amount-error"

                          />
                          <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                        </div>
                        <div id="amount-error" aria-live="polite" aria-atomic="true">
                          {state.errors?.amount &&
                            state.errors.amount.map((error: string) => (
                              <p className="mt-2 text-sm text-red-500" key={error}>
                                {error}
                              </p>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Invoice Status */}
                    <fieldset>
                      <legend className="mb-2 block text-sm font-medium">
                        Set the invoice status
                      </legend>
                      <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
                        <div className="flex gap-4">
                          <div className="flex items-center">
                            <input
                              id="pending"
                              name="status"
                              type="radio"
                              value="pending"
                              className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                              aria-describedby="status-error"
                            />
                            <label
                              htmlFor="pending"
                              className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                            >
                              Pending <ClockIcon className="h-4 w-4" />
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="paid"
                              name="status"
                              type="radio"
                              value="paid"
                              className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                              aria-describedby="status-error"
                            />
                            <label
                              htmlFor="paid"
                              className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                            >
                              Paid <CheckIcon className="h-4 w-4" />
                            </label>
                          </div>
                        </div>
                      </div>
                        <div id="status-error" aria-live="polite" aria-atomic="true">
                          {state.errors?.status &&
                            state.errors.status.map((error: string) => (
                              <p className="mt-2 text-sm text-red-500" key={error}>
                                {error}
                              </p>
                            ))}
                        </div>
                    </fieldset>
                  </div>
                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      onClick={onClose}
                      className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                      aria-label="Close modal"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={clsx(
                        'flex h-10 items-center rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',

                      )}
                    >
                      Create Invoice
                    </button>

                  </div>
                </form>
              </main>
            </div>
          </div>
        </div>
      </div>
      {/* Prevent background scroll */}
      <div className="fixed inset-0" aria-hidden="true" />
    </>
  );
}