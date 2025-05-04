import React, { useState, useEffect } from 'react';
import { ColorRing } from 'react-loader-spinner';
import Usernavbar from '../Usernavbar';
import Usernav from '../Usernav';
import { useNavigate } from 'react-router-dom'; // Use useNavigate instead of useHistory
import CurrencySign from '../../../components/CurrencySign ';

export default function ExpenseEntries() {
    const [expenseEntries, setExpenseEntries] = useState([]);
    const [expenseTypes, setExpenseTypes] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [invoices, setInvoices] = useState([]); // State to hold invoices
    const [formData, setFormData] = useState({
        expenseDate: '',
        expenseType: '',
        transactionType: '',
        vendor: '',
        amount: '',
        description: '',
        paymentStatus: 'Pending',
        receiptUrl: '',
        invoiceId: '', // Adding invoiceId to the form data
    });
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertMessageShow, setAlertMessageShow] = useState(false);

    const apiURL = 'https://immaculate.onrender.com/api/expense';
    const expenseTypeURL = 'https://immaculate.onrender.com/api/expensetype';
    const vendorURL = 'https://immaculate.onrender.com/api/vendor';
    const [showModal, setShowModal] = useState(false); // State to manage modal visibility
    const [fileName, setFileName] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const [filters, setFilters] = useState({
        transactionType: '',
        vendor:'',
        expenseType: '',
        startDate: '',
        endDate: '',
        invoiceId: '',
    });


    const handleOpenModal = () => {
        setShowModal(true);
    };

    const formatCustomDate = (dateString) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({
            expenseDate: '',
            expenseType: '',
            transactionType: '',
            vendor: '',
            amount: '',
            description: '',
            paymentStatus: 'Pending',
            receiptUrl: '',
            invoiceId: '',
        });
    };
    // const navigate = useNavigate();

    // Fetch all data (invoices, expense entries, types, and vendors) on component mount
    useEffect(() => {
        fetchExpenseEntries();
        fetchExpenseTypes();
        fetchVendors();
        fetchData();  // Fetch invoice data
    }, []);

    // Fetch invoice data
    const fetchData = async () => {
        try {
            const userid = localStorage.getItem("userid");
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`https://immaculate.onrender.com/api/invoicedata/${userid}`, {
                headers: {
                    'Authorization': authToken,
                }
            });
            if (response.status === 401) {
                const json = await response.json();
                setAlertMessage(json.message);
                setLoading(false);
                window.scrollTo(0, 0);
                return; // Stop further execution
            } else {
                const json = await response.json();
                if (Array.isArray(json)) {
                    const sortedInvoices = json.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setInvoices(sortedInvoices);
                    // console.log(sortedInvoices,"sortedInvoices");

                }
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const roundOff = (value) => {
        return Math.round(value * 100) / 100;
      };

    // Fetch all expense entries
    const fetchExpenseEntries = async () => {
        setLoading(true);
        try {
            const response = await fetch(apiURL);
            const data = await response.json();
            console.log(data, "sdsds sdsd");

            setExpenseEntries(data);
        } catch (error) {
            console.error('Error fetching expense entries:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch all expense types
    const fetchExpenseTypes = async () => {
        setLoading(true);
        try {
            const response = await fetch(expenseTypeURL);
            const data = await response.json();
            setExpenseTypes(data);
        } catch (error) {
            console.error('Error fetching expense types:', error);
        } finally {
            setLoading(false);
        }
    };
    // Function to get ExpenseType name by ID
    const getExpenseTypeName = (id) => {
        const expenseType = expenseTypes.find((type) => type._id === id);
        return expenseType ? expenseType.name : 'Unknown Expense Type';
    };

    // Function to get Vendor name by ID
    const getVendorName = (id) => {
        const vendor = vendors.find((vendor) => vendor._id === id);
        return vendor ? vendor.name : 'Unknown Vendor';
    };
    const getInvoiceName = (id) => {
        const invoice = invoices.find((vendor) => vendor._id === id);
        // console.log(invoice ? invoice.job : 'Unknown Job',"invoiceinvoiceinvoiceinvoice");

        return invoice ? invoice.job : 'Unknown Job';
    };

    // Fetch all vendors
    const fetchVendors = async () => {
        setLoading(true);
        try {
            const response = await fetch(vendorURL);
            const data = await response.json();
            console.log(data,"ds");
            
            setVendors(data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);  // Start showing loading
        setFileName(file.name);  // Show the file name in the input field

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'employeeApp');
        formData.append('cloud_name', 'dcldwaiyq');

        try {
            const response = await fetch('https://api.cloudinary.com/v1_1/dcldwaiyq/image/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    receiptUrl: data.secure_url, // Save Cloudinary URL in receiptUrl
                }));
                console.log('File uploaded successfully:', data.secure_url);
            } else {
                console.error('Error uploading file to Cloudinary');
            }
        } catch (error) {
            console.error('Error during file upload:', error);
        } finally {
            setIsUploading(false); // Stop loading state
        }
    };

    // Handle form data change
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    // Handle form submission (add/update expense)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Sanitize formData: Replace empty strings with null for optional fields
            const sanitizedFormData = {
                ...formData,
                expenseType: formData.expenseType || null,
                vendor: formData.vendor || null,
                invoiceId: formData.invoiceId || null, // Ensure invoiceId is also handled
            };

            const method = sanitizedFormData._id ? 'PUT' : 'POST';
            const url = sanitizedFormData._id ? `${apiURL}/${sanitizedFormData._id}` : apiURL;

            console.log(sanitizedFormData, "Before");

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sanitizedFormData),
            });

            console.log(sanitizedFormData, "sanitizedFormData");


            if (response.ok) {
                fetchExpenseEntries();
                setFormData({
                    expenseDate: '',
                    expenseType: '',
                    vendor: '',
                    amount: '',
                    description: '',
                    paymentStatus: 'Pending',
                    transactionType: 'Expense',
                    receiptUrl: '',
                    invoiceId: '', // Reset invoiceId after submit
                });
                console.log(sanitizedFormData, "After");
                setAlertMessage('Expense entry saved successfully!');
                setAlertMessageShow(true);
            } else {
                console.error('Error saving expense entry');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setAlertMessage('An error occurred while saving the expense entry.');
            setAlertMessageShow(true);
        } finally {
            setLoading(false);
        }
    };


    // Handle edit
    const handleEdit = (expense) => {
        console.log(expense,"ex---");
        
        setFormData({
            _id: expense._id,
            expenseDate: expense.expenseDate ? new Date(expense.expenseDate).toISOString().split('T')[0] : '',
            expenseType: expense.expenseType || null,
            transactionType: expense.transactionType,
            vendor: expense.vendor || null,
            amount: expense.amount,
            description: expense.description,
            paymentStatus: expense.paymentStatus,
            receiptUrl: expense.receiptUrl,
            invoiceId: expense.invoiceId, // Set invoiceId if it exists
        });
      

        setShowModal(true);
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense entry?')) {
            try {
                const response = await fetch(`${apiURL}/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    fetchExpenseEntries(); // refresh the list
                    setAlertMessage('Expense entry deleted successfully!');
                    setAlertMessageShow(true);
                } else {
                    console.error('Error deleting expense entry');
                }
            } catch (error) {
                console.error('Error deleting expense entry:', error);
                setAlertMessage('An error occurred while deleting the expense entry.');
                setAlertMessageShow(true);
            }
        }
    };

    const filteredExpenseEntries = expenseEntries.filter((entry) => {
        let isValid = true;

        // Filter by transaction type
        if (filters.transactionType && entry.transactionType !== filters.transactionType) {
            isValid = false;
        }

        // Filter by expense type
        if (filters.expenseType && entry.expenseType !== filters.expenseType) {
            isValid = false;
        }

        // Filter by date range
        if (filters.startDate && new Date(entry.expenseDate) < new Date(filters.startDate)) {
            isValid = false;
        }
        if (filters.endDate && new Date(entry.expenseDate) > new Date(filters.endDate)) {
            isValid = false;
        }

        // Filter by invoice
        if (filters.invoiceId && entry.invoiceId !== filters.invoiceId) {
            isValid = false;
        }

        // Filter by vendor
        if (filters.vendor && entry.vendor !== filters.vendor) {
            isValid = false;
        }
        console.log(entry, filters,"filters");
        

        return isValid;
    });


    return (
        <div className="bg">
            {
                loading ?
                    <div className="row">
                        <ColorRing
                            loading={loading}
                            display="flex"
                            justify-content="center"
                            align-items="center"
                            aria-label="Loading Spinner"
                            data-testid="loader"
                        />
                    </div> :
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-2 col-md-3 b-shadow bg-white d-lg-block d-md-block d-none">
                                <div>
                                    <Usernavbar />
                                </div>
                            </div>

                            <div className="col-lg-10 col-md-9 col-12 mx-auto">
                                <div className="d-lg-none d-md-none d-block mt-2">
                                    <Usernav />
                                </div>
                                <div className='mt-4 mx-4'>
                                    {alertMessage && alertMessageShow && (
                                        <div className="alert alert-success d-flex justify-content-between" role="alert">
                                            <div>{alertMessage}</div>
                                            <button type="button" className="btn-close" onClick={() => setAlertMessageShow(false)}></button>
                                        </div>
                                    )}
                                </div>

                                <div className="container mt-4">
                                    <div className="row">
                                        <div className="col-md-12 d-flex justify-content-end">
                                            <button
                                                className="btn btn-success mb-3"
                                                onClick={handleOpenModal}
                                            >
                                                Add New
                                            </button>
                                        </div>

                                        {showModal && (
                                            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                                <div className="modal-dialog">
                                                    <div className="modal-content">
                                                        <div className="modal-header">
                                                            {/* <h5 className="modal-title">Add New Expense Entry</h5> */}
                                                            <h3>{formData._id ? 'Update Expense Entry' : 'Add Expense Entry'}</h3>
                                                            <button
                                                                type="button"
                                                                className="btn-close"
                                                                onClick={handleCloseModal}
                                                            ></button>
                                                        </div>
                                                        <div className="modal-body">

                                                            <form onSubmit={handleSubmit}>
                                                                <div className="mb-3">
                                                                    <label htmlFor="expenseDate" className="form-label">Expense Date</label>
                                                                    <input
                                                                        type="date" id="expenseDate" name="expenseDate" className="form-control" value={formData.expenseDate} onChange={handleInputChange}
                                                                    />
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label htmlFor="expenseType" className="form-label">Expense Type</label>
                                                                    <select
                                                                        id="expenseType" name="expenseType" className="form-control" value={formData.expenseType} onChange={handleInputChange}
                                                                    >
                                                                        <option value="">Select Expense Type</option>
                                                                        {expenseTypes.map((type) => (
                                                                            <option key={type._id} value={type._id}>
                                                                                {type.name}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label htmlFor="vendor" className="form-label">Vendor</label>
                                                                    <select
                                                                        id="vendor" name="vendor" className="form-control" value={formData.vendor} onChange={handleInputChange}
                                                                    >
                                                                        <option value="">Select Vendor</option>
                                                                        {vendors.map((vendor) => (
                                                                            <option key={vendor._id} value={vendor._id}>
                                                                                {vendor.name}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label htmlFor="invoiceId" className="form-label">Invoice</label>
                                                                    <select
                                                                        id="invoiceId" name="invoiceId" className="form-control" value={formData.invoiceId} onChange={handleInputChange}
                                                                    >
                                                                        <option value="">Select Invoice</option>

                                                                        {invoices.map((invoice) => (
                                                                            <option key={invoice._id} value={invoice._id}>
                                                                                {invoice.InvoiceNumber} - {invoice.job}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label htmlFor="invoiceId" className="form-label">Transaction Type</label>
                                                                    <select
                                                                        id="transactionType" name="transactionType" className="form-control" value={formData.transactionType} onChange={handleInputChange}
                                                                    >
                                                                        <option value="">Select Transaction Type</option>
                                                                        <option value="Credit">Credit </option>
                                                                        <option value="Expense">Expense </option>
                                                                    </select>
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label htmlFor="amount" className="form-label">Amount</label>
                                                                    <input
                                                                        type="number" id="amount" name="amount" className="form-control" value={formData.amount} onChange={handleInputChange}
                                                                    />
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label htmlFor="description" className="form-label">Description</label>
                                                                    <textarea
                                                                        id="description" name="description" className="form-control" value={formData.description} onChange={handleInputChange}
                                                                    />
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label htmlFor="receiptUrl" className="form-label">Upload Receipt</label>
                                                                    <input
                                                                        type="file"
                                                                        id="receiptUrl"
                                                                        name="receiptUrl"
                                                                        className="form-control"
                                                                        accept="image/*"
                                                                        onChange={handleFileUpload}
                                                                        disabled={isUploading} // Disable input during upload
                                                                    />
                                                                    {/* Display file name if available */}
                                                                    {fileName && !isUploading && <small className="form-text text-muted">{fileName}</small>}
                                                                    {/* Show loading indicator while uploading */}
                                                                    {isUploading && <div className="spinner-border spinner-border-sm" role="status"><span className="visually-hidden">Loading...</span></div>}
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label htmlFor="paymentStatus" className="form-label">Payment Status</label>
                                                                    <select
                                                                        id="paymentStatus" name="paymentStatus" className="form-control" value={formData.paymentStatus} onChange={handleInputChange}
                                                                    >
                                                                        <option value="Pending">Pending</option>
                                                                        <option value="Paid">Paid</option>
                                                                    </select>
                                                                </div>
                                                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                                                    {formData._id ? 'Update Expense Entry' : 'Add Expense Entry'}
                                                                </button>
                                                                {formData._id && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-secondary ms-2"
                                                                        onClick={() => setFormData({
                                                                            expenseDate: '',
                                                                            expenseType: '',
                                                                            transactionType: '',
                                                                            vendor: '',
                                                                            amount: '',
                                                                            description: '',
                                                                            paymentStatus: 'Pending',
                                                                            receiptUrl: '',
                                                                            invoiceId: '',
                                                                        })}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                )}
                                                            </form>

                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Right column - List of expense entries */}
                                        <div className="col-md-12">
                                            <h3>Expense Entries</h3>
                                            {loading ? (
                                                <div className="d-flex justify-content-center">
                                                    <ColorRing
                                                        visible={true}
                                                        height="80"
                                                        width="80"
                                                        ariaLabel="loading"
                                                        wrapperClass="d-flex justify-content-center"
                                                    />
                                                </div>
                                            ) : expenseEntries.length > 0 ? (
                                                <div className="table-responsive">
                                                    <div className="filter-section ">
                                                        <div className="row">
                                                            {/* Transaction Type Filter */}
                                                            <div className="mb-3 col">
                                                                <label htmlFor="expenseDate" className="form-label">Select Transaction Type</label>
                                                                <select
                                                                    value={filters.transactionType}
                                                                    onChange={(e) => setFilters({ ...filters, transactionType: e.target.value })}
                                                                    className="form-control"
                                                                >
                                                                    <option value="">Select Transaction Type</option>
                                                                    <option value="Expense">Expense</option>
                                                                    <option value="Credit">Credit</option>
                                                                </select>
                                                            </div>
                                                            <div className="mb-3 col">
                                                                <label htmlFor="expenseDate" className="form-label">Select Expense Type</label>
                                                                {/* Expense Type Filter */}
                                                                <select
                                                                    value={filters.expenseType}
                                                                    onChange={(e) => setFilters({ ...filters, expenseType: e.target.value })}
                                                                    className="form-control"
                                                                >
                                                                    <option value="">Select Expense Type</option>
                                                                    {expenseTypes.map((type) => (
                                                                        <option key={type._id} value={type._id}>
                                                                            {type.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className='row'>

                                                            {/* Date Range Filter */}
                                                            <div className="date-range mb-3 col">
                                                                <label htmlFor="expenseDate" className="form-label">Select Start Date</label>
                                                                <input
                                                                    type="date"
                                                                    value={filters.startDate}
                                                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                                                    className="form-control"
                                                                />
                                                            </div>
                                                            <div className="date-range mb-3 col">
                                                                <label htmlFor="expenseDate" className="form-label">Select End Date</label>

                                                                <input
                                                                    type="date"
                                                                    value={filters.endDate}
                                                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                                                    className="form-control"
                                                                />
                                                            </div>
                                                        </div>


                                                        <div className='row'>
                                                            <div className="mb-3 col-6">
                                                                <label htmlFor="expenseDate" className="form-label">Select Invoice</label>

                                                                {/* Invoice Filter */}
                                                                <select
                                                                    value={filters.invoiceId}
                                                                    onChange={(e) => setFilters({ ...filters, invoiceId: e.target.value })}
                                                                    className="form-control"
                                                                >
                                                                    <option value="">Select Invoice</option>
                                                                    {invoices.map((invoice) => (
                                                                        <option key={invoice._id} value={invoice._id}>
                                                                            {invoice.InvoiceNumber} - {invoice.job}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="mb-3 col-6">
                                                                <label htmlFor="vendor" className="form-label">Select Vendor</label>

                                                                {/* Vendor Filter */}
                                                                <select
                                                                    value={filters.vendor}
                                                                    onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}
                                                                    className="form-control"
                                                                >
                                                                    <option value="">Select Vendor</option>
                                                                    {vendors.map((vendor) => (
                                                                        <option key={vendor._id} value={vendor._id}>
                                                                            {vendor.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <table className="table">
                                                        <thead>
                                                            <tr>
                                                                <th>#</th>
                                                                <th>Expense Date</th>
                                                                <th>Expense Type</th>
                                                                <th>Amount</th>
                                                                <th>Invoice</th>
                                                                <th>Vendor</th>
                                                                <th>Payment Status</th>
                                                                <th>Receipt</th>
                                                                <th>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {console.log(filteredExpenseEntries, "filteredExpenseEntries")}

                                                            {filteredExpenseEntries.map((entry, index) => (
                                                                <tr key={entry._id}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{formatCustomDate(entry.expenseDate)}</td>
                                                                    <td>
                                                                        {entry.transactionType === "Credit"
                                                                            ? "Credit"
                                                                            : getExpenseTypeName(entry.expenseType)} <br />
                                                                            Des: {entry.description}
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            color:
                                                                                entry.transactionType === "Credit"
                                                                                    ? "green"
                                                                                    : entry.transactionType === "Expense"
                                                                                        ? "red"
                                                                                        : "#ffc107",
                                                                            fontWeight: "bold",
                                                                        }}
                                                                    >
                                                                        {entry.transactionType === "Expense" ? " - " : " + "}
                                                                        <CurrencySign /> {roundOff(entry.amount)}
                                                                    </td>
                                                                    <td>{getInvoiceName(entry.invoiceId)}</td>
                                                                    <td>{entry.transactionType === "Credit" ? "" : getVendorName(entry.vendor)}</td>
                                                                    <td>{entry.paymentStatus}</td>
                                                                    <td>
                                                                        {entry.receiptUrl === '' ? '' : <a href={entry.receiptUrl}>Bill</a>}
                                                                    </td>
                                                                    <td>
                                                                        <div className="d-flex">
                                                                            <button
                                                                                className="btn btn-warning btn-sm"
                                                                                onClick={() => handleEdit(entry)}
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                            <button
                                                                                className="btn btn-danger btn-sm ms-2"
                                                                                onClick={() => handleDelete(entry._id)}
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                        <tfoot>
                                                            <tr>
                                                                <td colSpan="3" style={{ fontWeight: "bold", textAlign: "right" }}>Expense Total :</td>
                                                                <td style={{ fontWeight: "bold", color: "red" }}>
                                                                    <CurrencySign />
                                                                    {filteredExpenseEntries
                                                                        .filter(entry => entry.transactionType === "Expense")
                                                                        .reduce((total, entry) => roundOff(total + entry.amount), 0)}
                                                                </td>
                                                                <td colSpan="5"></td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>

                                                    {/* <table className="table table-bordered table-striped">
                                                        <thead>
                                                            <tr>
                                                                <th>#</th>
                                                                <th>Date</th>
                                                                <th>Type</th>
                                                                <th>Amount</th>
                                                                <th>Invoice</th>
                                                                <th>Vendor</th>
                                                                <th>Status</th>
                                                                <th>Images Link</th>
                                                                <th>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {expenseEntries.map((entry, index) => (
                                                                <tr key={entry._id}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{entry.expenseDate}</td>
                                                                    <td>
                                                                        {entry.transactionType === "Credit"
                                                                            ? "Credit"
                                                                            : getExpenseTypeName(entry.expenseType)}
                                                                    </td>


                                                                    <td
                                                                        style={{
                                                                            color:
                                                                                entry.transactionType === "Credit"
                                                                                    ? "green"
                                                                                    : entry.transactionType === "Expense"
                                                                                        ? "red"
                                                                                        : "#ffc107",
                                                                            fontWeight: "bold",
                                                                        }}
                                                                    >
                                                                        {entry.transactionType === "Expense" ? " - " : " + "}
                                                                        <CurrencySign /> {entry.amount}
                                                                    </td>
                                                                    <td>{getInvoiceName(entry.invoiceId)}</td>
                                                                    <td>
                                                                        {entry.transactionType === "Credit" ? "" : getVendorName(entry.vendor)}
                                                                    </td>
                                                                    <td>{entry.paymentStatus}</td>
                                                                    <td>{entry.receiptUrl == '' ? '' : <a href={entry.receiptUrl}>Bill</a>}</td>
                                                                    <td>
                                                                        <div className="d-flex">
                                                                            <button
                                                                                className="btn btn-warning btn-sm"
                                                                                onClick={() => handleEdit(entry)}
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                            <button
                                                                                className="btn btn-danger btn-sm ms-2"
                                                                                onClick={() => handleDelete(entry._id)}
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table> */}
                                                </div>
                                            ) : (
                                                <p>No expense entries available.</p>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            }
        </div>
    );
}
