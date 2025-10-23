import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Usernavbar from './Usernavbar';
import Usernav from './Usernav';
import { ColorRing } from 'react-loader-spinner';
import CurrencySign from '../../components/CurrencySign ';
import moment from 'moment';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { saveAs } from 'file-saver';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function Reports() {
    const [loading, setLoading] = useState(true);
    const [totalReceivedAmount, setTotalReceivedAmount] = useState(0);
    const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(moment().endOf('month').format('YYYY-MM-DD'));
    const [receivedData, setReceivedData] = useState([]);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Payments Received by Month',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    });
    const [financialYearData, setFinancialYearData] = useState([]);
    const [expandedFY, setExpandedFY] = useState(null);
    const [fyFilter, setFyFilter] = useState('All');
    const [errorMessage, setErrorMessage] = useState('');
    
    let navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('authToken') || localStorage.getItem('isTeamMember') === 'true') {
            navigate('/');
        } else {
            fetchTotalReceivedAmount();
            fetchFinancialYearData();
        }
    }, [navigate]);

    const fetchTotalReceivedAmount = async () => {
        try {
            setLoading(true);
            const userid = localStorage.getItem('userid');
            const response = await fetch(`http://localhost:3001/api/currentMonthReceivedAmount2/${userid}?startOfMonth=${moment(startDate).format('YYYY-MM-DD')}&endOfMonth=${moment(endDate).format('YYYY-MM-DD')}`);
            const data = await response.json();
            console.log('Received Data:', data);
            const totalAmount = data.reduce((acc, curr) => acc + curr.totalReceivedAmount, 0);
            setTotalReceivedAmount(totalAmount);
            setReceivedData(data);
            prepareChartData(data);
        } catch (error) {
            console.error('Error fetching total received amount:', error);
        } finally {
            setLoading(false);
        }
    };

    const prepareChartData = (data) => {
        const labels = data.map(entry => moment(entry._id).format('YYYY-MM'));
        const amounts = data.map(entry => entry.totalReceivedAmount);

        console.log('Labels:', labels);
        console.log('Amounts:', amounts);

        setChartData({
            labels: labels,
            datasets: [
                {
                    label: 'Payments Received by Month',
                    data: amounts,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
            ],
        });
    };

    const fetchFinancialYearData = async () => {
        try {
            const userid = localStorage.getItem("userid");
            const authToken = localStorage.getItem('authToken');
            console.log('Fetching FY data for user:', userid);
            console.log('Auth token:', authToken);

            const response = await fetch(`http://localhost:3001/api/all-invoices-by-financial-year?userid=${userid}`, {
                headers: {
                    'Authorization': authToken,
                }
            });

            console.log('FY Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('FY Response error:', errorText);
                setErrorMessage(`Failed to fetch financial year data: ${response.status} - ${errorText}`);
                return;
            }

            const json = await response.json();
            console.log('FY API response:', json);
            
            if (json.success) {
                if (json.data && json.data.length > 0) {
                    setFinancialYearData(json.data);
                } else {
                    setErrorMessage('No financial year data returned from API');
                }
            } else {
                setErrorMessage(json.message || 'API returned unsuccessful response');
            }
        } catch (error) {
            console.error('Error fetching financial year data:', error);
            setErrorMessage(`Error fetching financial year data: ${error.message}`);
        }
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

    const escapeCSVField = (field) => {
        if (field === null || field === undefined) return '';
        const str = String(field);
        // If the field contains quotes, commas, or newlines, enclose it in quotes and escape existing quotes
        if (str.includes('"') || str.includes(',') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const exportToCSV = () => {
        // Filter data based on current filter
        const filteredData = financialYearData.filter(fy => fyFilter === 'All' || fy.financialYear === fyFilter);
        
        // CSV headers
        let csvContent = "Financial Year,Invoice Count,Total Amount,Total Due,Total Tax\n";
        
        // Summary rows
        filteredData.forEach(fy => {
            csvContent += [
                escapeCSVField(fy.financialYear),
                escapeCSVField(fy.invoiceCount),
                escapeCSVField(fy.totalAmount), // Raw number without formatting
                escapeCSVField(fy.totalDue),
                escapeCSVField(fy.totalTax)
            ].join(',') + '\n';
        });

        // Add detailed invoice data
        csvContent += "\nDetailed Invoices\n";
        csvContent += "Financial Year,Invoice Number,Customer,Job,Amount,Status\n";
        
        filteredData.forEach(fy => {
            fy.invoices.forEach(invoice => {
                csvContent += [
                    escapeCSVField(fy.financialYear),
                    escapeCSVField(invoice.InvoiceNumber),
                    escapeCSVField(invoice.customername),
                    escapeCSVField(invoice.job),
                    escapeCSVField(invoice.total), // Raw number without formatting
                    escapeCSVField(invoice.status)
                ].join(',') + '\n';
            });
        });

        // Create and download the CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `Financial_Year_Invoices_${moment().format('YYYY-MM-DD')}.csv`);
    };

    return (
        <div className='bg'>
            {loading ? (
                <div className='row'>
                    <ColorRing
                        width={200}
                        loading={loading}
                        size={500}
                        display='flex'
                        justifyContent='center'
                        alignItems='center'
                        aria-label='Loading Spinner'
                        data-testid='loader'
                    />
                </div>
            ) : (
                <div className='container-fluid'>
                    <div className='row'>
                        <div className='col-lg-2 col-md-3 vh-100 b-shadow bg-white d-lg-block d-md-block d-none'>
                            <div>
                                <Usernavbar />
                            </div>
                        </div>

                        <div className='col-lg-10 col-md-9 col-12 mx-auto'>
                            <div className='d-lg-none d-md-none d-block mt-2'>
                                <Usernav />
                            </div>
                            <div className='bg-white my-5 p-4 box mx-4'>
                                <div className='row py-2'>
                                    <div className='col-lg-4 col-md-6 col-sm-6 col-7 me-auto'>
                                        <p className='h3 fw-bold'>Report</p>
                                    </div>
                                </div>
                                <div className='row py-2'>
                                    <div className='col-lg-4'>
                                        <div className='mb-3'>
                                            <label htmlFor='startDate' className='form-label'>
                                                Start Date
                                            </label>
                                            <input
                                                type='date'
                                                name='startDate'
                                                className='form-control'
                                                id='startDate'
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className='col-lg-4'>
                                        <div className='mb-3'>
                                            <label htmlFor='endDate' className='form-label'>
                                                End Date
                                            </label>
                                            <input
                                                type='date'
                                                name='endDate'
                                                className='form-control'
                                                id='endDate'
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className='col-lg-2'>
                                        <div className='mt-4 my-3'>
                                            <button className='btn btn-primary' onClick={fetchTotalReceivedAmount}>Show</button>
                                        </div>
                                    </div>
                                </div>
                                <div className='row py-2'>
                                    <div className='col-lg-4'>
                                        <p>Total Received Amount: <CurrencySign />{totalReceivedAmount}</p>
                                    </div>
                                </div>
                                <div className='row py-2'>
                                    <div className='col-lg-12'>
                                        <Bar data={chartData} />
                                    </div>
                                </div>
                                <div className='row py-2'>
                                    <div className='col-lg-12'>
                                        <h4>Data Details</h4>
                                        <table className='table table-striped'>
                                            <thead>
                                                <tr>
                                                    <th className='ps-4'>Date</th>
                                                    <th className='text-end pe-4'>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {receivedData.map((entry, index) => (
                                                    <tr key={index}>
                                                        <td className='ps-4'>{moment(entry._id).format('YYYY-MM-DD')}</td>
                                                        <td className='text-end pe-4'><CurrencySign />{entry.totalReceivedAmount}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Financial Year Section */}
                                <div className='row py-2 mt-5'>
                                    <div className='col-lg-12'>
                                        <div className='d-flex justify-content-between align-items-center'>
                                            <h4>Invoices by Financial Year</h4>
                                            <button className='btn btn-success' onClick={exportToCSV}>
                                                Export to CSV
                                            </button>
                                        </div>
                                        {errorMessage && (
                                            <div className="alert alert-danger" role="alert">
                                                {errorMessage}
                                            </div>
                                        )}
                                        <div className='row mb-3 mt-3'>
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
                                                                                            <th>View</th>
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
                                                                                                <td className='text-center'>
                                                                                                    <a role='button' className='text-black text-center' onClick={() => handleViewClick(invoice)}>
                                                                                                        <i className='fa-solid fa-eye'></i>
                                                                                                    </a>
                                                                                                </td>
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
                </div>
            )}
        </div>
    );    
}