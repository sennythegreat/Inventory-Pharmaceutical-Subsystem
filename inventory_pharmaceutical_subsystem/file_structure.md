inventory-subsystem/
├── public/
│
├── src/
│   ├── app/
│   │   ├── layout.js
│   │   ├── page.js                         # redirects to /inventory
│   │   │
│   │   ├── inventory/
│   │   │   └── page.js                     # Inventory Screen
│   │   │
│   │   ├── dispense/
│   │   │   └── page.js                     # Dispense Medication
│   │   │
│   │   ├── restock/
│   │   │   └── page.js                     # Restock / Add Medication
│   │   │
│   │   └── transactions/
│   │       └── page.js                     # Transaction Log / Audit
│   │
│   │
│   ├── api/
│   │   ├── inventory/
│   │   │   └── route.js                    # GET, POST, PUT all in one
│   │   │
│   │   ├── dispense/
│   │   │   └── route.js                    # POST dispense medication
│   │   │
│   │   ├── restock/
│   │   │   └── route.js                    # POST restock/add medication
│   │   │
│   │   └── transactions/
│   │       └── route.js                    # GET transaction logs
│   │
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Modal.js
│   │   │   ├── Badge.js                    # status badges
│   │   │   └── Table.js
│   │   │
│   │   ├── inventory/
│   │   │   ├── InventoryTable.js           # medication list with badges
│   │   │   ├── InventorySearch.js          # search and filter bar
│   │   │   └── ExpiryBadge.js              # expiry warning badge
│   │   │
│   │   ├── dispense/
│   │   │   ├── DispenseForm.js             # main dispense form
│   │   │   ├── MedicineRow.js              # single medication row
│   │   │   └── DispenseSummary.js          # total cost summary
│   │   │
│   │   ├── restock/
│   │   │   ├── RestockForm.js              # restock existing mode
│   │   │   └── AddMedicineForm.js          # add new mode
│   │   │
│   │   └── transactions/
│   │       ├── TransactionTable.js         # transaction log table
│   │       └── TransactionFilter.js        # filter by date/staff/med
│   │
│   │
│   ├── services/
│   │   ├── inventoryService.js             # get, update medication logic
│   │   ├── dispenseService.js              # dispense business logic
│   │   ├── restockService.js               # restock/add business logic
│   │   └── transactionService.js           # transaction recording logic
│   │
│   │
│   ├── validators/
│   │   ├── inventoryValidator.js           # validate med name, dosage, price, expiry
│   │   ├── dispenseValidator.js            # validate patient id, stock, expiry
│   │   └── restockValidator.js             # validate quantity, price, expiry date
│   │
│   ├── lib/
│   │   ├── supabase.js                     # supabase client setup
│   │   └── utils.js                        # helper functions
│   │
│   ├── hooks/
│   │   ├── useInventory.js                 # fetch/update inventory
│   │   ├── useDispense.js                  # dispense logic
│   │   ├── useRestock.js                   # restock logic
│   │   └── useTransactions.js              # fetch transaction logs
│   │
│   └── constants/
│       └── sampleData.js                   # fixed sample data
│
├── .env.local                              # SUPABASE_URL, SUPABASE_ANON_KEY
├── next.config.js
├── tailwind.config.js
└── package.json