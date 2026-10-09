export type ClientRecord = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

// Fictional owners only. Reserved 555-01xx numbers and example.com addresses.
export const clientRecords: readonly ClientRecord[] = [
  { id: 'client-001', name: 'Morgan Ellis', phone: '(201) 555-0101', email: 'morgan.ellis@example.com' },
  { id: 'client-002', name: 'Jamie Parker', phone: '(201) 555-0102', email: 'jamie.parker@example.com' },
  { id: 'client-003', name: 'Alex Rowan', phone: '(201) 555-0103', email: 'alex.rowan@example.com' },
  { id: 'client-004', name: 'Taylor Brooks', phone: '(201) 555-0104', email: 'taylor.brooks@example.com' },
  { id: 'client-005', name: 'Casey Lane', phone: '(201) 555-0105', email: 'casey.lane@example.com' },
  { id: 'client-006', name: 'Jordan Reed', phone: '(201) 555-0106', email: 'jordan.reed@example.com' },
];
