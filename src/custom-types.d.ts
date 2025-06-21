// src/custom-types.d.ts

// Declare the module 'paystack-node'
declare module 'paystack-node' {
  // Define the shape of the options for the Paystack class constructor
  interface PaystackOptions {
    // Define any options if you use them, otherwise can be empty
  }

  // This is the main class you import
  class Paystack {
    constructor(secretKey: string, environment?: string);

    // Define the parts of the library you use
    transaction: {
      initialize: (params: {
        amount: number;
        email: string;
        currency?: string;
        reference?: string;
        metadata?: any;
        callback_url?: string;
      }) => Promise<any>; // You can make this Promise<PaystackTransactionResponse> for better typing
    };
    // Add other parts like `verification` if you use them
    // verification: { ... }
  }

  // Export the class as the default export of the module
  export = Paystack;
}