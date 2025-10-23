import React, { useState, useEffect } from 'react';
import Usernavbar from './Usernavbar';
import { useNavigate, useLocation } from 'react-router-dom';
import Usernav from './Usernav';
import { ColorRing } from 'react-loader-spinner';
import CurrencySign from '../../components/CurrencySign ';
import Alertauthtoken from '../../components/Alertauthtoken';

export default function Invoice() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [financialYearData, setFinancialYearData] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState(null);
  const [expandedFY, setExpandedFY] = useState(null); // For expandable rows
  const [fyFilter, setFyFilter] = useState('All'); // Financial year filter
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState(''); // Added for error display
  const invoiceid = location.state?.invoiceid;
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [alertMessage, setAlertMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const entriesPerPage = 10;
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") === "true") {
      navigate("/");
    }
    fetchData();
    fetchFinancialYearData();
  }, []);

  const fetchData = async () => {
    try {
      const userid = localStorage.getItem("userid");
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/invoicedata/${userid}`, {
        headers: {
          'Authorization': authToken,
        }
      });

      if (response.status === 401) {
        const json = await response.json();
        setAlertMessage(json.message);
        setLoading(false);
        window.scrollTo(0, 0);
        return;
      }
      const json = await response.json();
      if (Array.isArray(json)) {
        setInvoices(json);
        const transactionPromises = json.map(async (invoice) => {
          const response = await fetch(`http://localhost:3001/api/gettransactiondata/${invoice._id}`, {
            headers: {
              'Authorization': authToken,
            }
          });
          if (response.status === 401) {
            const transactionJson = await response.json();
            setAlertMessage(transactionJson.message);
            setLoading(false);
            window.scrollTo(0, 0);
            return;
          }
          const transactionJson = await response.json();
          return transactionJson.map(transaction => ({
            ...transaction,
            invoiceId: invoice._id
          }));
        });
        const transactionsData = await Promise.all(transactionPromises);
        setTransactions(transactionsData.flat());
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchFinancialYearData = async () => {
    try {
      const userid = localStorage.getItem("userid");
      const authToken = localStorage.getItem('authToken');
      console.log('Fetching FY data for user:', userid); // Debug log
      console.log('Auth token:', authToken); // Debug log

      const response = await fetch(`http://localhost:3001/api/all-invoices-by-financial-year?userid=${userid}`, {
        headers: {
          'Authorization': authToken,
        }
      });

      console.log('Response status:', response.status); // Debug log
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        setErrorMessage(`Failed to fetch financial year data: ${response.status} - ${errorText}`);
        setLoading(false);
        return;
      }

      const json = await response.json();
      console.log('FY API response:', json); // Debug log
      
      if (json.success) {
        if (json.data && json.data.length > 0) {
          console.log(json.data,"json.data")
          setFinancialYearData(json.data);
        } else {
          setErrorMessage('No financial year data returned from API');
        }
      } else {
        setErrorMessage(json.message || 'API returned unsuccessful response');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching financial year data:', error);
      setErrorMessage(`Error fetching financial year data: ${error.message}`);
      setLoading(false);
    }
  };

  const getFilteredInvoices = () => {
    let filtered = invoices;
    if (filterStatus !== 'All') {
      filtered = filtered.filter(invoice => invoice.status === filterStatus);
    }
    if (searchQuery) {
      filtered = filtered.filter(invoice =>
        (invoice.customername?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (invoice.job?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  const roundOff = (value) => {
    const roundedValue = Math.round(value * 100) / 100;
    return roundedValue.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleViewClick = (invoice) => {
    navigate('/userpanel/Invoicedetail', { state: { invoiceid: invoice._id } });
  };

  const formatCustomDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleAddClick = () => {
    navigate('/userpanel/Createinvoice');
  };

  const getStatus = (invoice) => {
    const relatedTransactions = transactions.filter(transaction => transaction.invoiceId === invoice._id);
    const totalPaidAmount = relatedTransactions.reduce(
      (total, payment) => total + parseFloat(payment.paidamount),
      0
    );
    if (totalPaidAmount === 0) {
      return <strong><i className="fa-solid fa-circle fs-12 mx-2 saved"></i> Saved</strong>;
    } else if (totalPaidAmount > 0 && totalPaidAmount < invoice.total) {
      return <strong><i className="fa-solid fa-circle fs-12 mx-2 partiallypaid"></i> Partially Paid</strong>;
    } else if (totalPaidAmount === invoice.total) {
      return <strong><i className="fa-solid fa-circle fs-12 mx-2 paid"></i> Paid</strong>;
    }
    return "Payment Pending";
  };

  const getPageCount = () => Math.ceil(getFilteredInvoices().length / entriesPerPage);

  const getCurrentPageInvoices = () => {
    const filteredInvoices = getFilteredInvoices();
    const startIndex = currentPage * entriesPerPage;
    return filteredInvoices.slice(startIndex, startIndex + entriesPerPage);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * entriesPerPage < getFilteredInvoices().length) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className='bg'>
      {loading ? (
        <div className='row'>
          <ColorRing
            loading={loading}
            display="flex"
            justify-content="center"
            align-items="center"
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      ) : (
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-lg-2 col-md-3 vh-100 b-shadow bg-white d-lg-block d-md-block d-none'>
              <Usernavbar />
            </div>

            <div className='col-lg-10 col-md-9 col-12 mx-auto'>
              <div className='d-lg-none d-md-none d-block mt-2'>
                <Usernav />
              </div>
              <div className='bg-white my-5 p-4 box mx-4'>
                {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                
                {/* Existing Invoice Table */}
                <div className='row py-2'>
                  <div className='col-lg-4 col-md-6 col-sm-6 col-7 me-auto'>
                    <p className='h5 fw-bold'>Invoice</p>
                  </div>
                  <div className='col-lg-3 col-md-4 col-sm-4 col-5 text-lg-end text-md-end text-sm-end text-end'>
                    <button className='btn rounded-pill btnclr text-white fw-bold' onClick={handleAddClick}>
                      + Add New
                    </button>
                  </div>
                </div>
                <hr />
                <div className='row mb-3'>
                  <div className='col-3'>
                    <select onChange={(e) => setFilterStatus(e.target.value)} className='form-select'>
                      <option value='All'>All</option>
                      <option value='Paid'>Paid</option>
                      <option value='Partially Paid'>Partially Paid</option>
                      <option value='Saved'>Saved</option>
                      <option value='Send'>Send</option>
                    </select>
                  </div>
                  <div className='col-3'>
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Search by name or job"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className='row px-2 table-responsive'>
                  <table className='table table-bordered'>
                    <thead>
                      <tr>
                        <th scope='col'>INVOICE</th>
                        <th scope='col'>STATUS</th>
                        <th scope='col'>DATE</th>
                        <th scope='col'>VIEW</th>
                        <th scope='col'>AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getCurrentPageInvoices().map((invoice, index) => (
                        <tr key={index}>
                          <td>
                            <p className='my-0 fw-bold clrtrxtstatus'>{invoice.customername}</p>
                            <p className='my-0'>{invoice.InvoiceNumber}</p>
                            <p className='my-0'>Job: {invoice.job}</p>
                          </td>
                          <td>
                            {invoice.status === 'Saved' ? (
                              <span className='saved p-2 rounded-pill'>
                                <i className="fa-solid fa-circle fs-12 me-2 grey-3"></i>
                                <span className='clrtrxtstatus fw-bold'>Saved</span>
                              </span>
                            ) : invoice.status === 'Send' ? (
                              <span className='sent p-2 rounded-pill'>
                                <i className="fa-solid fa-circle fs-12 me-2 text-primary"></i>
                                <span className='clrtrxtstatus fw-bold'>Send</span>
                              </span>
                            ) : invoice.status === 'Paid' ? (
                              <span className='paid p-2 rounded-pill'>
                                <i className="fa-solid fa-circle fs-12 me-2"></i>
                                <span className='clrtrxtstatus fw-bold'>Paid</span>
                              </span>
                            ) : invoice.status === 'Partially Paid' ? (
                              <span className='paid p-2 rounded-pill'>
                                <i className="fa-solid fa-circle fs-12 me-2"></i>
                                <span className='clrtrxtstatus fw-bold'>Partially Paid</span>
                              </span>
                            ) : (
                              <>
                                <i className="fa-solid fa-circle fs-12 me-2 unknown"></i>
                                <span className='clrtrxtstatus fw-bold'>Unknown Status</span>
                              </>
                            )}
                          </td>
                          <td>
                            <div className='d-flex'>
                              <p className='issue px-1 my-1'>Issued</p>
                              <p className='datetext my-1'>{formatCustomDate(invoice.date)}</p>
                            </div>
                            <div className='d-flex'>
                              <p className='due px-1'>Due</p>
                              <p className='datetext'>{formatCustomDate(invoice.duedate)}</p>
                            </div>
                          </td>
                          <td className='text-center'>
                            <a role='button' className='text-black text-center' onClick={() => handleViewClick(invoice)}>
                              <i className='fa-solid fa-eye'></i>
                            </a>
                          </td>
                          <td><CurrencySign />{roundOff(invoice.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className='row mt-3'>
                  <div className='col-12'>
                    <button onClick={handlePrevPage} className='me-2' disabled={currentPage === 0}>
                      Previous Page
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={(currentPage + 1) * entriesPerPage >= getFilteredInvoices().length}
                    >
                      Next Page
                    </button>
                  </div>
                </div>

                {/* Financial Year Table */}
                <div className='mt-5'>
                  <h5 className='fw-bold'>Invoices by Financial Year</h5>
                  <hr />
                  <div className='row mb-3'>
                    <div className='col-3'>
                      <select onChange={(e) => setFyFilter(e.target.value)} className='form-select'>
                        <option value='All'>All Financial Years</option>
                        {financialYearData.map(fy => (
                          <option key={fy.financialYear} value={fy.financialYear}>{fy.financialYear}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className='row px-2 table-responsive'>
                    <table className='table table-bordered'>
                      <thead>
                        <tr>
                          <th scope='col'>FINANCIAL YEAR</th>
                          <th scope='col'>INVOICE COUNT</th>
                          <th scope='col'>TOTAL AMOUNT</th>
                          <th scope='col'>TOTAL DUE</th>
                          <th scope='col'>TOTAL TAX</th>
                        </tr>
                      </thead>
                      <tbody>
                        {financialYearData.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center">No financial year data available</td>
                          </tr>
                        ) : (
                          financialYearData
                            .filter(fy => fyFilter === 'All' || fy.financialYear === fyFilter)
                            .map((fy, index) => (
                              <React.Fragment key={index}>
                                <tr onClick={() => setExpandedFY(expandedFY === fy.financialYear ? null : fy.financialYear)}>
                                  <td>{fy.financialYear}</td>
                                  <td>{fy.invoiceCount}</td>
                                  <td><CurrencySign />{roundOff(fy.totalAmount)}</td>
                                  <td><CurrencySign />{roundOff(fy.totalDue)}</td>
                                  <td><CurrencySign />{roundOff(fy.totalTax)}</td>
                                </tr>
                                {expandedFY === fy.financialYear && (
                                  <tr>
                                    <td colSpan="5">
                                      <table className="table mb-0">
                                        <thead>
                                          <tr>
                                            <th>Invoice Number</th>
                                            <th>Customer</th>
                                            <th>Job</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {fy.invoices.map((invoice, i) => (
                                            <tr key={i}>
                                              <td>{invoice.InvoiceNumber}</td>
                                              <td>{invoice.customername}</td>
                                              <td>{invoice.job}</td>
                                              <td><CurrencySign />{roundOff(invoice.total)}</td>
                                              <td>{invoice.status}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}