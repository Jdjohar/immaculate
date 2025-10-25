import React, { useState, useEffect } from 'react';
import Usernavbar from './Usernavbar';
import { useNavigate, useLocation } from 'react-router-dom';
import Usernav from './Usernav';
import { ColorRing } from 'react-loader-spinner';
import CurrencySign from '../../components/CurrencySign ';
import Alertauthtoken from '../../components/Alertauthtoken';

export default function Estimate() {
  const [loading, setloading] = useState(true);
  const [estimates, setestimates] = useState([]);
  const [convertedEstimates, setConvertedEstimates] = useState([]);
  const location = useLocation();
  const estimateid = location.state?.estimateid;
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [alertMessage, setAlertMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const entriesPerPage = 10;

  useEffect(() => {
    if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") === "true") {
      navigate("/");
    }
    fetchData();
  }, []);

  const roundOff = (value) => Math.round(value * 100) / 100;

  const fetchData = async () => {
    try {
      const userid = localStorage.getItem("userid");
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`https://immaculate.onrender.com/api/estimatedata/${userid}`, {
        headers: {
          'Authorization': authToken,
        }
      });
      if (response.status === 401) {
        const json = await response.json();
        setAlertMessage(json.message);
        setloading(false);
        window.scrollTo(0, 0);
        return;
      } else {
        const json = await response.json();
        if (Array.isArray(json)) {
          setestimates(json);
        }
        setloading(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleViewClick = (estimate) => {
    let estimateid = estimate._id;
    navigate('/userpanel/estimatedetail', { state: { estimateid } });
  };

  const formatCustomDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };

  const handleAddClick = () => {
    navigate('/userpanel/Createestimate');
  }

  const handleConvertToInvoice = async (estimateid) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`https://immaculate.onrender.com/api/converttoinvoice/${estimateid}`, {
        method: 'POST',
        headers: {
          'Authorization': authToken,
        }
      });
      if (response.status === 401) {
        const data = await response.json();
        setAlertMessage(data.message);
        setloading(false);
        window.scrollTo(0, 0);
        return;
      } else {
        if (response.ok) {
          const data = await response.json();
          fetchData(); // refresh list
          setConvertedEstimates([...convertedEstimates, estimateid]);
        } else {
          const errorMessage = await response.json();
          console.error('Error converting to invoice:', errorMessage.message);
        }
      }
    } catch (error) {
      console.error('Error converting to invoice:', error);
    }
  };

  const getFilteredEstimates = () => {
    if (!searchQuery) return estimates;
    return estimates.filter(estimate => {
      const customerName = estimate.customername || "";
      const jobName = estimate.job || "";
      return (
        customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jobName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };

  const getPageCount = () => Math.ceil(getFilteredEstimates().length / entriesPerPage);

  const getCurrentPageEstimates = () => {
    const filtered = getFilteredEstimates();
    const startIndex = currentPage * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * entriesPerPage < getFilteredEstimates().length) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className='bg'>
      {loading ? (
        <div className='row'>
          <ColorRing />
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

              <div className='mt-4 mx-4'>
                {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
              </div>

              <div className='bg-white my-5 p-4 box mx-4'>
                <div className='row py-2'>
                  <div className='col-lg-4 col-md-6 col-sm-6 col-7 me-auto'>
                    <p className='h5 fw-bold'>Estimate</p>
                  </div>
                  <div className='col-lg-3 col-md-4 col-sm-4 col-5 text-end'>
                    <button className='btn rounded-pill btn-primary text-white fw-bold' onClick={handleAddClick}>
                      + Add New
                    </button>
                  </div>
                </div>
                <hr />
                <div className="row mb-3">
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
                        <th>Estimate</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>View</th>
                        <th>Convert Into Invoice</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getCurrentPageEstimates().map((estimate, index) => (
                        <tr key={index}>
                          <td>
                            <p className='my-0 fw-bold clrtrxtstatus'>{estimate.customername}</p>
                            <p className='my-0'>{estimate.EstimateNumber}</p>
                            <p className='my-0'>Job: {estimate.job}</p>
                          </td>
                          <td>
                            <span className={`p-2 rounded-pill ${estimate.status === 'Send' ? 'sent' : estimate.status === 'Paid' ? 'paid' : 'saved'}`}>
                              <i className="fa-solid fa-circle fs-12 me-2"></i>
                              <span className='clrtrxtstatus fw-bold'>{estimate.status || 'Unknown'}</span>
                            </span>
                          </td>
                          <td>
                            <div className='d-flex'>
                              <p className='issue px-1 my-1'>Issued</p>
                              <p className='datetext my-1'>{formatCustomDate(estimate.date)}</p>
                            </div>
                          </td>
                          <td className='text-center'>
                            <a role='button' className='text-black' onClick={() => handleViewClick(estimate)}>
                              <i className='fa-solid fa-eye'></i>
                            </a>
                          </td>
                          <td className='text-center'>
                            {estimate.convertedToInvoice ? (
                              <span className='badge bg-success'>Converted</span>
                            ) : (
                              <button className='btn converbtn' onClick={() => handleConvertToInvoice(estimate._id)}>
                                Convert
                              </button>
                            )}
                          </td>
                          <td><CurrencySign />{roundOff(estimate.total)}</td>
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
                      disabled={(currentPage + 1) * entriesPerPage >= getFilteredEstimates().length}
                    >
                      Next Page
                    </button>
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
