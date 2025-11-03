import { apiCall } from './apiUtils';

// Hoarding services
export const getAllHoardings = () => apiCall('/master/hoardings');
export const getHoardingById = (id) => apiCall(`/master/hoardings/${id}`);
export const createHoarding = (data) => apiCall('/master/hoardings', 'POST', data);
export const updateHoarding = (id, data) => apiCall(`/master/hoardings/${id}`, 'PUT', data);
export const deleteHoarding = (id) => apiCall(`/master/hoardings/${id}`, 'DELETE');
export const getLandlordsDropdown = () => apiCall('/master/landlords-dropdown');

// Labour services
export const getAllLabours = () => apiCall('/master/labours');
export const getLabourById = (id) => apiCall(`/master/labours/${id}`);
export const createLabour = (data) => apiCall('/master/labours', 'POST', data);
export const updateLabour = (id, data) => apiCall(`/master/labours/${id}`, 'PUT', data);
export const deleteLabour = (id) => apiCall(`/master/labours/${id}`, 'DELETE');

// EmployeeMaster services
export const getAllEmployeeMasters = () => apiCall('/master/employees');
export const getEmployeeMasterById = (id) => apiCall(`/master/employees/${id}`);
export const createEmployeeMaster = (data) => apiCall('/master/employees', 'POST', data);
export const updateEmployeeMaster = (id, data) => apiCall(`/master/employees/${id}`, 'PUT', data);
export const deleteEmployeeMaster = (id) => apiCall(`/master/employees/${id}`, 'DELETE');

// Landlord services
export const getAllLandlords = () => apiCall('/master/landlords');
export const getLandlordById = (id) => apiCall(`/master/landlords/${id}`);
export const createLandlord = (data) => apiCall('/master/landlords', 'POST', data);
export const updateLandlord = (id, data) => apiCall(`/master/landlords/${id}`, 'PUT', data);
export const deleteLandlord = (id) => apiCall(`/master/landlords/${id}`, 'DELETE');

// Client services
export const getAllClients = () => apiCall('/master/clients');
export const getClientById = (id) => apiCall(`/master/clients/${id}`);
export const createClient = (data) => apiCall('/master/clients', 'POST', data);
export const updateClient = (id, data) => apiCall(`/master/clients/${id}`, 'PUT', data);
export const deleteClient = (id) => apiCall(`/master/clients/${id}`, 'DELETE');

// Agency services
export const getAllAgencies = () => apiCall('/master/agencies');
export const getAgencyById = (id) => apiCall(`/master/agencies/${id}`);
export const createAgency = (data) => apiCall('/master/agencies', 'POST', data);
export const updateAgency = (id, data) => apiCall(`/master/agencies/${id}`, 'PUT', data);
export const deleteAgency = (id) => apiCall(`/master/agencies/${id}`, 'DELETE');

// Creditor services
export const getAllCreditors = () => apiCall('/master/creditors');
export const getCreditorById = (id) => apiCall(`/master/creditors/${id}`);
export const createCreditor = (data) => apiCall('/master/creditors', 'POST', data);
export const updateCreditor = (id, data) => apiCall(`/master/creditors/${id}`, 'PUT', data);
export const deleteCreditor = (id) => apiCall(`/master/creditors/${id}`, 'DELETE');

// Printer services
export const getAllPrinters = () => apiCall('/master/printers');
export const getPrinterById = (id) => apiCall(`/master/printers/${id}`);
export const createPrinter = (data) => apiCall('/master/printers', 'POST', data);
export const updatePrinter = (id, data) => apiCall(`/master/printers/${id}`, 'PUT', data);
export const deletePrinter = (id) => apiCall(`/master/printers/${id}`, 'DELETE');


// services/masterService.js (or a separate designerService.js if preferred)

export const getAllDesigners = () => apiCall('/master/designers');

export const getDesignerById = (id) => apiCall(`/master/designers/${id}`);

export const createDesigner = (data) => apiCall('/master/designers', 'POST', data);

export const updateDesigner = (id, data) => apiCall(`/master/designers/${id}`, 'PUT', data);

export const deleteDesigner = (id) => apiCall(`/master/designers/${id}`, 'DELETE');

// PaymentVoucher services
export const getAllPaymentVouchers = () => apiCall('/master/vouchers/payment');
export const getPaymentVoucherById = (id) => apiCall(`/master/vouchers/payment/${id}`);
export const createPaymentVoucher = (data) => apiCall('/master/vouchers/payment', 'POST', data);
export const updatePaymentVoucher = (id, data) => apiCall(`/master/vouchers/payment/${id}`, 'PUT', data);
export const deletePaymentVoucher = (id) => apiCall(`/master/vouchers/payment/${id}`, 'DELETE');

// ReceiptVoucher services
export const getAllReceiptVouchers = () => apiCall('/master/vouchers/receipt');
export const getReceiptVoucherById = (id) => apiCall(`/master/vouchers/receipt/${id}`);
export const createReceiptVoucher = (data) => apiCall('/master/vouchers/receipt', 'POST', data);
export const updateReceiptVoucher = (id, data) => apiCall(`/master/vouchers/receipt/${id}`, 'PUT', data);
export const deleteReceiptVoucher = (id) => apiCall(`/master/vouchers/receipt/${id}`, 'DELETE');

// JournalVoucher services
export const getAllJournalVouchers = () => apiCall('/master/vouchers/journal');
export const getJournalVoucherById = (id) => apiCall(`/master/vouchers/journal/${id}`);
export const createJournalVoucher = (data) => apiCall('/master/vouchers/journal', 'POST', data);
export const updateJournalVoucher = (id, data) => apiCall(`/master/vouchers/journal/${id}`, 'PUT', data);
export const deleteJournalVoucher = (id) => apiCall(`/master/vouchers/journal/${id}`, 'DELETE');

// ContraVoucher services
export const getAllContraVouchers = () => apiCall('/master/vouchers/contra');
export const getContraVoucherById = (id) => apiCall(`/master/vouchers/contra/${id}`);
export const createContraVoucher = (data) => apiCall('/master/vouchers/contra', 'POST', data);
export const updateContraVoucher = (id, data) => apiCall(`/master/vouchers/contra/${id}`, 'PUT', data);
export const deleteContraVoucher = (id) => apiCall(`/master/vouchers/contra/${id}`, 'DELETE');

// DebitNote services
export const getAllDebitNotes = () => apiCall('/master/vouchers/debit-note');
export const getDebitNoteById = (id) => apiCall(`/master/vouchers/debit-note/${id}`);
export const createDebitNote = (data) => apiCall('/master/vouchers/debit-note', 'POST', data);
export const updateDebitNote = (id, data) => apiCall(`/master/vouchers/debit-note/${id}`, 'PUT', data);
export const deleteDebitNote = (id) => apiCall(`/master/vouchers/debit-note/${id}`, 'DELETE');

// CreditNote services
export const getAllCreditNotes = () => apiCall('/master/vouchers/credit-note');
export const getCreditNoteById = (id) => apiCall(`/master/vouchers/credit-note/${id}`);
export const createCreditNote = (data) => apiCall('/master/vouchers/credit-note', 'POST', data);
export const updateCreditNote = (id, data) => apiCall(`/master/vouchers/credit-note/${id}`, 'PUT', data);
export const deleteCreditNote = (id) => apiCall(`/master/vouchers/credit-note/${id}`, 'DELETE');
// Employee Permission services
export const getEmployeePermissions = (employeeId) =>
  apiCall(`/master/employees/${employeeId}/permissions`);

export const createEmployeePermission = (employeeId, data) =>
  apiCall(`/master/employees/${employeeId}/permissions`, 'POST', data);

export const updateEmployeePermission = (permissionId, data) =>
  apiCall(`/master/permissions/${permissionId}`, 'PUT', data);

export const deleteEmployeePermission = (permissionId) =>
  apiCall(`/master/permissions/${permissionId}`, 'DELETE');
export const getMyPermissions = () =>
  apiCall('/master/employees/dashboard/permissions');