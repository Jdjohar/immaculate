import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ColorRing } from 'react-loader-spinner'
import Usernav from './Usernav';
import Usernavbar from './Usernavbar';
import { ReactMultiEmail } from 'react-multi-email';
import 'react-multi-email/dist/style.css'
import html2pdf from 'html2pdf.js';
// import he from 'he';
import CurrencySign from '../../components/CurrencySign ';
import Alertauthtoken from '../../components/Alertauthtoken';
// import { PDFViewer, pdf, PDFDownloadLink, Document, Image, Page, Text, Font, View, StyleSheet } from '@react-pdf/renderer';   
import sign from '../../../public/signs.png'



export default function Estimatedetail() {
  const [loading, setloading] = useState(true);
  const [signupdata, setsignupdata] = useState([]);
  const modalRef = useRef(null);
  const [items, setitems] = useState([]);
  const location = useLocation();
  const [selectedinvoices, setselectedinvoices] = useState(null);
  const [estimateData, setestimateData] = useState({
    customername: '', itemname: '', customeremail: '', customerphone: '', EstimateNumber: '', purchaseorder: '',
    date: '', description: '', itemquantity: '', price: '', discount: '',
    amount: '', tax: '', taxpercentage: '', subtotal: '', total: '', amountdue: '', information: '', isAddSignature: ''
  });

  const estimateid = location.state?.estimateid;
  const [transactionData, setTransactionData] = useState({
    paidamount: '',
    paiddate: '',
    method: '',
    note: ''
  });
  const [transactions, setTransactions] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [emails, setEmails] = useState([]);
  const [bccEmails, setBccEmails] = useState([]);
  const [content, setContent] = useState(``);
  const [showModal, setShowModal] = useState(false);
  const [showEmailAlert, setShowEmailAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [ownerData, setOwnerData] = useState(null);
  const [signatureData, setsignatureData] = useState(null);


  const roundOff = (value) => {
    return Math.round(value * 100) / 100;
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || amount === '' || isNaN(amount)) return '0.00';
    return Number(amount).toLocaleString('en-CA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const parseLocationName = (val) => {
    if (!val) return '';
    if (typeof val === 'object' && val.name) return val.name;
    try {
      const parsed = JSON.parse(val);
      return parsed?.name || val;
    } catch (e) {
      return val;
    }
  };

  useEffect(() => {

    console.log("estimateid ===========", estimateid);
    if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") == "true") {
      navigate("/");
    }
    fetchsignupdata();
    if (estimateid) {
      fetchestimateData();
      fetchtransactiondata();
    }
  }, [estimateid])

  useEffect(() => {
    // console.log('Customer Email:', estimateData.customeremail);
    if (estimateData.customeremail) {
      setEmails([estimateData.customeremail]);
    }
  }, [estimateData.customeremail]);
  let navigate = useNavigate();

  const fetchestimateData = async () => {
    try {
      const userid = localStorage.getItem("userid");
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`https://immaculate.onrender.com/api/getestimatedata/${estimateid}`, {
        headers: {
          'Authorization': authToken,
        }
      });

      if (response.status === 401) {
        const json = await response.json();
        setAlertMessage(json.message);
        setloading(false);
        window.scrollTo(0, 0);
        return; // Stop further execution
      }
      else {
        const json = await response.json();

        setestimateData(json);
        if (Array.isArray(json.items)) {
          setitems(json.items);
        }

        fetchOwnerData();

        if (json.isAddSignature || json.isCustomerSign) {
          // Wait for estimateData to be set before checking customer signature
          setTimeout(() => {

            checkCustomerSignature(json._id);
          }, 0);
        }
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const checkCustomerSignature = async (estimateIdpass) => {
    if (!estimateIdpass) {
      console.error('Customer email is not defined');
      return;
    }

    try {
      const response = await fetch(`https://immaculate.onrender.com/api/checkcustomersignature/${encodeURIComponent(estimateIdpass)}`);
      const json = await response.json();
      console.log('Customer signature response:', json);
      if (response.ok && json.hasSignature) {
        setsignatureData(json.signatureData);
      } else {
        setsignatureData(null);
      }
    } catch (error) {
      console.error('Error fetching customer signature:', error);
    }
  };

  const fetchOwnerData = async () => {
    try {
      const ownerId = localStorage.getItem('userid');
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`https://immaculate.onrender.com/api/getownerdata/${ownerId}`, {
        headers: {
          'Authorization': authToken,
        }
      });

      if (response.status === 401) {
        const json = await response.json();
        setAlertMessage(json.message);
        setloading(false);
        window.scrollTo(0, 0);
        return; // Stop further execution
      } else {
        const json = await response.json();
        setOwnerData(json[0]); // Save all owner data
      }
    } catch (error) {
      console.error('Error fetching owner data:', error);
    }
  };

  const fetchtransactiondata = async () => {
    try {
      const userid = localStorage.getItem("userid");
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`https://immaculate.onrender.com/api/gettransactiondata/${estimateid}`, {
        headers: {
          'Authorization': authToken,
        }
      });

      if (response.status === 401) {
        const json = await response.json();
        setAlertMessage(json.message);
        setloading(false);
        window.scrollTo(0, 0);
        return; // Stop further execution
      }
      else {
        const json = await response.json();

        // Check if the response contains paidamount
        if (Array.isArray(json)) {
          setTransactions(json);
          //   const totalPaidAmount = payments.reduce((total, payment) => total + payment.paidamount, 0);


        } else {
          console.error('Invalid data structure for transactions:', json);
        }
        setloading(false);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const fetchsignupdata = async () => {
    try {
      const userid = localStorage.getItem("userid");
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`https://immaculate.onrender.com/api/getsignupdata/${userid}`, {
        headers: {
          'Authorization': authToken,
        }
      });

      if (response.status === 401) {
        const json = await response.json();
        setAlertMessage(json.message);
        setloading(false);
        window.scrollTo(0, 0);
        return; // Stop further execution
      }
      else {
        const json = await response.json();

        // if (Array.isArray(json)) {
        setsignupdata(json);
        // }
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const formatCustomDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };

  const handlePrintContent = async () => {
    const content = document.getElementById('invoiceContent1').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(`
    <html>
      <head>
        <title>Print Invoice</title>
        <style>
      
        .print-page{
          // width:80%;
          margin:auto
        }
        .adminborder{
        
          
          width:100%;
        }
        .row{
  
          width:100% !important;
          margin:auto;
        }
      .pt-30{
        padding-top:30px;
      }
      .pb-30{
        padding-bottom:30px;
      }
      .pb-90{
        padding-bottom: 66px;
        padding-top: 15px;
        padding-left: 10px;
        margin-top: 20px;
        margin-bottom: 30px;
      }

      .padding-20{
        padding-top:15px;
        padding-bottom:45px;
      }
        .col-6{
          width:50%;
          float:left
        }
        .col-md-6{
          width:50%;
          float:left
        }
        p, h1,h2,h3,h4,h5,h6 {
          margin:0
        }
        .clear{
          clear:both;
        }

        .invoice-contentcol-6{
          width:25% !important;
          float:left
        }

        .invoice-contentcol-2{
          width:25% !important;
          float:left;
        }
        
        .fw-bold{
          font-weight:bold;
        }

        .invoice-contentcol-12{
          width:100%;
        }

        .printcol-8{
          width:50%;
          float:left;
          text-align:right
        }
        .invoice-contentcol-8{
          width:50% !important;
          float:left;
          text-align:center;
        }

        .logoimage{
          width:50%;
        }

        .detailbg{
          background-color: #f0f3f4 !important;
        }

        .offset-8{
          width:25%;
        }

        .text-left{
          text-align:left;
        }

        .text-right{
          text-align:right;
        }

        .right{
          text-align:right;
        }

        .padding{
          padding:20px
        }

        .flex{
          display: flex;
          justify-content: end;
        }

        .m-right{
          margin-right:100px;
        }
        
        /* Adjustments for better PDF rendering */
        body {
          font-size: 14px;
        }
        .invoice-content {
          page-break-inside: avoid;
        }
        .page-not-break {
          page-break-before: auto;
          page-break-after: auto;
          page-break-inside: avoid;
          reak-before: auto;
          break-after: auto;
          break-inside: avoid;
        }
        .invoice-price .invoice-price-right {
          width: 30%;
          background: #f0f3f4;
          color: black;
          border: 2px solid #f0f3f4;
          font-size: 28px;
          text-align: right;
          vertical-align: bottom;
          font-weight: 300;
          position: relative;
          right: 38px;
          padding: 28px 12px 16px;
        }
        .invoice-price .invoice-price-right span {
          display: block;
          font-weight: 400;
        }
        .invoice-price .invoice-price-right small {
          display: block;
          opacity: .7;
          position: absolute;
          top: 10px;
          left: 12px;
          font-size: 18px;
        }
        
        @media only screen and (max-width: 575.98px) {
              .invoice-price .invoice-price-right {
                  right: 18px;
              }
        
              .invoice-price-right{
                width: 290px !important;
                display: block !important;
              }
          }
        .invoice-price {
          /* background: #f0f3f4; */
          display: table;
          width: 100%;
        }
        .invoice-price .invoice-price-left, .invoice-price .invoice-price-right {
          display: table-cell;
          font-size: 20px;
          font-weight: 600;
          width: 70%;
          position: relative;
          vertical-align: middle;
        }
        .print {
          margin-top: 10px;
            max-width: 28cm;
            zoom: 0.8;
            box-shadow: 0 0 0.5cm rgba(0, 0, 0, 0.2);
            margin-right: auto;
            margin-left: auto;
            background: white !important;
            flex-direction: row; justify-content: space-between; margin-bottom: 10px;
        }
        .invoice-header {
          background: #f0f3f4;
          padding: 25px 50px;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
          }
          .invoice-header {
            background: #f0f3f4;
            padding: 25px 50px;
          }
          @page {
            /* Hide header and footer */
            margin: 0;
          }
          @page :first {
            /* Hide header on first page */
            header {
              display: none;
            }
          }
          @page {
            /* Hide footer on all pages */
            footer {
              display: none;
            }
          }
}
        .invoice-body {
          background: #fff;
          padding: 30px 50px;
        }
          

        .invoice-body-text{
          width: 100%;
          height: auto;
        }
        .information-content {
          height: auto;
          overflow: hidden;
        }

        .information-content img {
          width: 50%;
          max-width: 100%;
          height: auto;
        }
        .invoice-to {
          // padding-right: 20px;
        }
        .invoice-date {
          /* text-align: right; */
          // padding-left: 15px;
        }
        .table{
          width: 100%;
    margin-bottom: 1rem;
    color: #212529;
    vertical-align: top;
    border-color: #dee2e6;
        }
        .table>thead {
    vertical-align: bottom;
        border-color: inherit;
    border-style: solid;
    border-width: 0;
}

.col-12 {
  width: 100%;
}
thead{
  text-align:left;
}
.text-end {
  text-align: right;
}
        .invoice-table{
          padding: 20px 38px 10px;
        }
        .text-md-end {
          text-align: right;
        }
        .clr {
          clear: both;
        }
        .col-md-6{
          width:50%;
          float: left;
        }
        .row {
    --bs-gutter-x: 1.5rem;
    --bs-gutter-y: 0;
    display: flex;
    flex-wrap: wrap;
    margin-top: calc(-1* var(--bs-gutter-y));
    margin-right: calc(-.5* var(--bs-gutter-x));
    margin-left: calc(-.5* var(--bs-gutter-x));
}
        
        .invoice-content {
          padding: 00px 38px 10px;
        }


        </style>
      </head>
      <body>
        <div class="print-page">
          ${content}
        </div>
      </body>
    </html>
  `);
    printWindow.document.close();
    await timeout(1000);
    printWindow.print();
  };
  function timeout(delay) {
    return new Promise(res => setTimeout(res, delay));
  }

  const handleEditContent = (estimateData) => {
    
    let estimateid = estimateData._id;
    console.log(estimateid);
    navigate('/userpanel/Editestimate', { state: { estimateid } });
  };

  const handleRemove = async (estimateid, estimateIdpass) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm('Are you sure you want to delete this invoice?');
  
    // If the user cancels, stop execution
    if (!confirmDelete) {
      console.log('Invoice deletion cancelled by the user.');
      return;
    }
  
    try {
      // Check if there's a customer signature
      const signatureData = await checkCustomerSignature(estimateIdpass);
  
      // If a signature exists, delete it
      if (signatureData) {
        const authToken = localStorage.getItem('authToken');
        const deleteSignatureResponse = await fetch(`https://immaculate.onrender.com/api/delcustomersignature/${encodeURIComponent(estimateIdpass)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': authToken,
          }
        });
  
        if (!deleteSignatureResponse.ok) {
          const json = await deleteSignatureResponse.json();
          console.error('Error deleting customer signature:', json.message);
          return; // Stop further execution if deleting signature fails
        } else {
          console.log('Customer signature deleted successfully!');
        }
      }
  
      // Proceed with deleting the estimate data
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`https://immaculate.onrender.com/api/delestimatedata/${estimateid}`, {
        method: 'GET',
        headers: {
          'Authorization': authToken,
        }
      });
  
      if (response.status === 401) {
        const json = await response.json();
        setAlertMessage(json.message);
        setloading(false);
        window.scrollTo(0, 0);
        return; // Stop further execution
      } else {
        const json = await response.json();
  
        if (json.success) {
          console.log('Data removed successfully!');
          navigate('/userpanel/Userdashboard');
        } else {
          console.error('Error deleting invoice:', json.message);
        }
      }
  
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };
  
  //   try {
  //     const authToken = localStorage.getItem('authToken');
  //     const response = await fetch(`https://immaculate.onrender.com/api/delestimatedata/${estimateid}`, {
  //       method: 'GET',
  //       headers: {
  //         'Authorization': authToken,
  //       }
  //     });

  //     if (response.status === 401) {
  //       const json = await response.json();
  //       setAlertMessage(json.message);
  //       setloading(false);
  //       window.scrollTo(0, 0);
  //       return; // Stop further execution
  //     }
  //     else {
  //       const json = await response.json();

  //       if (json.success) {
  //         console.log('Data removed successfully!');
  //         navigate('/userpanel/Userdashboard');
  //       } else {
  //         console.error('Error deleting Invoice:', json.message);
  //       }
  //     }


  //   } catch (error) {
  //     console.error('Error deleting Invoice:', error);
  //   }
  // };

  // Function to handle changes in email input
  const handleEmailChange = (newEmails) => {
    setEmails(newEmails);
  };

  // Handler function to update the list of "BCC" emails
  const handleBccEmailsChange = (newEmails) => {
    setBccEmails(newEmails);
  };

  const handleContentChange = (event) => {
    setContent(event.target.value);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const contentAsPdf = await generatePdfFromHtml();
    const authToken = localStorage.getItem('authToken');
    const userid = estimateData.userid;

    // console.log(userEmail, "userEmail ============");
    try {
      const finalContent = content.trim() || ``; // If content is empty, use default value
      const response = await fetch('https://immaculate.onrender.com/api/send-estimate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: JSON.stringify({
          to: emails,
          bcc: bccEmails,
          content: finalContent,
          companyName: signupdata.companyname,
          customdate: formatCustomDate(estimateData.date),
          // duedate: formatCustomDate(estimateData.duedate),
          EstimateNumber: estimateData.EstimateNumber,
          currencyType: signupdata.CurrencyType,
          amountdue: estimateData.amountdue,
          amountdue1: estimateData.total - transactions.reduce((total, payment) => total + payment.paidamount, 0),
          pdfAttachment: contentAsPdf,
          estimateId: estimateData._id,
          ownerId: ownerData.ownerId,
        }),
      });

      if (response.ok) {
        console.log('Email sent successfully!');
        // setShowModal(false);
        setShowEmailAlert(true);
        // Update the database with emailsent status
        const updatedData = { ...estimateData, status: 'Send', emailsent: 'yes' }; // Update emailsent status
        await fetch(`https://immaculate.onrender.com/api/updateestimateData/${estimateid}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken,
          },
          body: JSON.stringify(updatedData),
        });

        // Check if customer signature already exists
        const checkResponse = await fetch(`https://immaculate.onrender.com/api/checkcustomersignature/${encodeURIComponent(estimateData._id)}`);
        const checkJson = await checkResponse.json();

        if (checkResponse.ok && !checkJson.hasSignature) {
          // Create new customer signature only if it doesn't exist
          await fetch('https://immaculate.onrender.com/api/customersignature', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // 'Authorization': authToken,
            },
            body: JSON.stringify({
              estimateId: estimateData._id,
              userid,
              // ownerEmail:ownerData.email,
              // ownerId:ownerData.ownerId,
              customerName: estimateData.customername,
              customerEmail: estimateData.customeremail,
              customersign: "",
              documentNumber: estimateData.EstimateNumber,
              lastupdated: '',
              completeButtonVisible: false,
            }),
          });
        }

        // Fetch updated invoice data
        fetchestimateData();
      } else {
        console.error('Failed to send email.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };
  const handleAlertClose = () => {
    setShowEmailAlert(false); // Close the alert
  };

  const convertToPdf = () => {
    const content = document.getElementById('invoiceContent').innerHTML;
    const opt = {
      filename: `${estimateData.EstimateNumber || 'Estimate'}.pdf`,
      margin: [8, 8, 8, 8],
      image: { type: 'jpeg', quality: 0.98 },
      enableLinks: true,
      html2canvas: {
        scale: 2.5,
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
        logging: false
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: { mode: ['css', 'legacy'] }
    };
    html2pdf().from(content).set(opt).save();
  };

  const generatePdfFromHtml = async () => {
    return new Promise((resolve, reject) => {
      const content = document.getElementById('invoiceContent').innerHTML;
      const opt = {
        filename: `${estimateData.EstimateNumber || 'Estimate'}.pdf`,
        margin: [8, 8, 8, 8],
        image: { type: 'jpeg', quality: 0.98 },
        enableLinks: true,
        html2canvas: {
          scale: 2.5,
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          logging: false
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: { mode: ['css', 'legacy'] }
      };

      html2pdf().from(content).set(opt).toPdf().get('pdf').then(function (pdf) {
        // pdf.setSelectableText(true);
        const pdfAsDataUri = pdf.output('datauristring', 'pdf');
        resolve(pdfAsDataUri);
      }).catch(function (error) {
        reject(error);
      });
    });
  };

  return (
    <div className='bg'>
      {
        loading ?
          <div className='row'>
            <ColorRing
              // width={200}
              loading={loading}
              // size={500}
              display="flex"
              justify-content="center"
              align-items="center"
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div> :
          <div className='container-fluid'>
            <div className="row">
              <div className='col-lg-2 col-md-3 vh-100 b-shadow bg-white d-lg-block d-md-block d-none'>
                <div  >
                  <Usernavbar />
                </div>
              </div>

              <div className="col-lg-10 col-md-9 col-12 mx-auto">
                <div className='d-lg-none d-md-none d-block mt-2'>
                  <Usernav />
                </div>
                <div className='mx-3'>
                  <form>
                    <div className='row py-4 px-2 breadcrumbclr'>
                      <div className="col-lg-6 col-md-6 col-sm-6 col-7 me-auto">
                        <p className='fs-35 fw-bold'>Estimate</p>
                        <nav aria-label="breadcrumb">
                          <ol class="breadcrumb mb-0">
                            <li class="breadcrumb-item"><a href="/Userpanel/Userdashboard" className='txtclr text-decoration-none'>Dashboard</a></li>
                            <li class="breadcrumb-item active" aria-current="page">Estimatedetail</li>
                          </ol>
                        </nav>
                      </div>
                      <div className="col-lg-1 col-md-4 col-sm-4 col-3 text-right">
                        <div className="dropdown">
                          <button
                            className="btn dropdown-toggle no-arrow" // Updated class here
                            type="button"
                            id="dropdownMenuButton"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <i className="fa-solid fa-ellipsis ellipse px-3 py-1" ></i>
                          </button>
                          <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">


                            <li><a className="dropdown-item" onClick={handlePrintContent}>Print</a></li>
                            <li><a className="dropdown-item" onClick={() => handleEditContent(estimateData)}>Edit</a></li>
                            <li><a className="dropdown-item" onClick={convertToPdf}>Pdf</a></li>
                            <li><a className="dropdown-item" onClick={() => handleRemove(estimateData._id, estimateData.customeremail)}>Remove</a></li>
                          </ul>
                        </div>

                      </div>
                      <div className="col-lg-1">
                        <a className='btn rounded-pill btn-danger text-white fw-bold' data-bs-toggle="modal" data-bs-target="#sendEmailModal">Send</a>
                      </div>
                      <div className='my-2'>
                        {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                      </div>
                    </div>

                    {showAlert && (
                      <>
                        <div className="row">
                          <div className="col-lg-7 col-sm-5 col-3"></div>
                          <div className="col-9 col-sm-7 col-lg-5">
                            <div class="alert alert-warning d-flex" role="alert">
                              <svg xmlns="http://www.w3.org/2000/svg" class="alertwidth bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:">
                                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                              </svg>
                              <div>
                                You cannot edit a document that has already been partially paid. Please create a new document.
                              </div>
                              <button type="button" class="btn-close" onClick={() => {
                                // setmessage(false);
                                setShowAlert("");
                              }}></button>

                            </div>
                          </div>
                        </div>

                      </>

                    )}

                    <div style={{ display: 'none' }} id='invoiceContent'>
                      <style>{`
                        .estimate-pdf-wrap {
                          width: 100%;
                          max-width: 800px;
                          margin: 0 auto;
                          padding: 24px 28px;
                          background: #ffffff;
                          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                          font-size: 12px;
                          line-height: 1.45;
                          color: #1e293b;
                          box-sizing: border-box;
                        }
                        .estimate-pdf-header {
                          display: flex;
                          justify-content: space-between;
                          align-items: flex-start;
                          padding-bottom: 18px;
                          border-bottom: 2px solid #e2e8f0;
                          margin-bottom: 16px;
                        }
                        .estimate-pdf-brand {
                          display: flex;
                          flex-direction: column;
                          gap: 5px;
                          max-width: 58%;
                        }
                        .estimate-pdf-logo {
                          height: 65px;
                          width: auto;
                          object-fit: contain;
                          align-self: flex-start;
                          margin-bottom: 4px;
                        }
                        .estimate-pdf-company-name {
                          font-size: 15px;
                          font-weight: 700;
                          color: #0f172a;
                          letter-spacing: -0.2px;
                        }
                        .estimate-pdf-company-info {
                          font-size: 11px;
                          color: #475569;
                          line-height: 1.4;
                        }
                        .estimate-pdf-company-info a {
                          color: #475569;
                          text-decoration: none;
                        }
                        .estimate-pdf-meta {
                          text-align: right;
                          display: flex;
                          flex-direction: column;
                          align-items: flex-end;
                          gap: 4px;
                          max-width: 40%;
                        }
                        .estimate-pdf-title {
                          font-size: 26px;
                          font-weight: 800;
                          color: #166534;
                          letter-spacing: 1px;
                          text-transform: uppercase;
                          line-height: 1.1;
                          margin-bottom: 4px;
                        }
                        .estimate-pdf-badge {
                          display: inline-block;
                          background: #f0fdf4;
                          color: #166534;
                          border: 1px solid #bbf7d0;
                          padding: 3px 10px;
                          border-radius: 4px;
                          font-weight: 700;
                          font-size: 12px;
                        }
                        .estimate-pdf-meta-text {
                          font-size: 11.5px;
                          color: #64748b;
                          margin-top: 2px;
                        }
                        .estimate-pdf-meta-text strong {
                          color: #334155;
                        }
                        .estimate-pdf-details-card {
                          display: flex;
                          justify-content: space-between;
                          background: #f8fafc;
                          border: 1px solid #e2e8f0;
                          border-left: 4px solid #166534;
                          border-radius: 6px;
                          padding: 12px 16px;
                          margin-bottom: 20px;
                          page-break-inside: avoid;
                          break-inside: avoid;
                        }
                        .estimate-pdf-col {
                          width: 48%;
                        }
                        .estimate-pdf-section-label {
                          font-size: 10px;
                          font-weight: 700;
                          color: #166534;
                          text-transform: uppercase;
                          letter-spacing: 0.6px;
                          margin-bottom: 4px;
                        }
                        .estimate-pdf-client-name {
                          font-size: 14px;
                          font-weight: 700;
                          color: #0f172a;
                          margin-bottom: 2px;
                        }
                        .estimate-pdf-client-meta {
                          font-size: 11px;
                          color: #475569;
                          line-height: 1.35;
                        }
                        .estimate-pdf-job-name {
                          font-size: 13px;
                          font-weight: 600;
                          color: #0f172a;
                          margin-bottom: 2px;
                        }
                        .estimate-pdf-table-container {
                          margin-bottom: 18px;
                          page-break-inside: auto;
                          break-inside: auto;
                        }
                        .estimate-pdf-table {
                          width: 100%;
                          border-collapse: collapse;
                          page-break-inside: auto;
                          break-inside: auto;
                        }
                        .estimate-pdf-table thead {
                          display: table-header-group;
                        }
                        .estimate-pdf-table th {
                          background: #166534;
                          color: #ffffff;
                          font-size: 10.5px;
                          font-weight: 700;
                          text-transform: uppercase;
                          letter-spacing: 0.5px;
                          padding: 9px 12px;
                          border: none;
                        }
                        .estimate-pdf-table th:first-child {
                          border-top-left-radius: 4px;
                        }
                        .estimate-pdf-table th:last-child {
                          border-top-right-radius: 4px;
                        }
                        .estimate-pdf-table tbody {
                          page-break-inside: auto;
                          break-inside: auto;
                        }
                        .estimate-pdf-table-row {
                          page-break-inside: avoid !important;
                          break-inside: avoid !important;
                          border-bottom: 1px solid #e2e8f0;
                        }
                        .estimate-pdf-table-row:nth-child(even) {
                          background-color: #fafbfb;
                        }
                        .estimate-pdf-table td {
                          padding: 10px 12px;
                          vertical-align: top !important;
                          font-size: 11.5px;
                          color: #334155;
                        }
                        .estimate-pdf-item-title {
                          font-size: 13px;
                          font-weight: 700;
                          color: #0f172a;
                          margin-bottom: 4px;
                          display: block;
                        }
                        .estimate-pdf-item-desc {
                          font-size: 11px;
                          color: #475569;
                          line-height: 1.45;
                        }
                        .estimate-pdf-item-desc p {
                          margin: 0 0 2px 0;
                        }
                        .estimate-pdf-rate {
                          font-weight: 500;
                          color: #1e293b;
                          white-space: nowrap;
                        }
                        .estimate-pdf-amount {
                          font-weight: 700;
                          color: #0f172a;
                          white-space: nowrap;
                        }
                        .estimate-pdf-summary-wrap {
                          display: flex;
                          justify-content: flex-end;
                          margin-bottom: 20px;
                          page-break-inside: avoid;
                          break-inside: avoid;
                        }
                        .estimate-pdf-summary-card {
                          width: 320px;
                          background: #f8fafc;
                          border: 1px solid #e2e8f0;
                          border-radius: 6px;
                          padding: 12px 14px;
                        }
                        .estimate-pdf-summary-line {
                          display: flex;
                          justify-content: space-between;
                          align-items: center;
                          padding: 4px 0;
                          font-size: 11.5px;
                          color: #475569;
                        }
                        .estimate-pdf-summary-line strong {
                          color: #0f172a;
                          font-weight: 600;
                        }
                        .estimate-pdf-total-banner {
                          display: flex;
                          justify-content: space-between;
                          align-items: center;
                          background: #166534;
                          color: #ffffff;
                          padding: 8px 12px;
                          border-radius: 4px;
                          margin-top: 8px;
                        }
                        .estimate-pdf-total-label {
                          font-size: 12px;
                          font-weight: 700;
                          letter-spacing: 0.5px;
                          text-transform: uppercase;
                        }
                        .estimate-pdf-total-val {
                          font-size: 16px;
                          font-weight: 800;
                          letter-spacing: -0.2px;
                        }
                        .estimate-pdf-info-wrap {
                          display: flex;
                          justify-content: space-between;
                          gap: 16px;
                          margin-bottom: 20px;
                          page-break-inside: avoid;
                          break-inside: avoid;
                        }
                        .estimate-pdf-notes-col {
                          flex: 1;
                          background: #f8fafc;
                          border: 1px solid #e2e8f0;
                          border-radius: 6px;
                          padding: 12px 14px;
                        }
                        .estimate-pdf-notes-title {
                          font-size: 11px;
                          font-weight: 700;
                          color: #166534;
                          text-transform: uppercase;
                          letter-spacing: 0.5px;
                          margin-bottom: 6px;
                        }
                        .estimate-pdf-notes-content {
                          font-size: 11px;
                          color: #334155;
                          line-height: 1.45;
                        }
                        .estimate-pdf-notes-content p {
                          margin: 0 0 3px 0;
                        }
                        .estimate-pdf-trust-col {
                          width: 250px;
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                          justify-content: center;
                          background: #f8fafc;
                          border: 1px solid #e2e8f0;
                          border-radius: 6px;
                          padding: 12px;
                          text-align: center;
                        }
                        .estimate-pdf-trust-title {
                          font-size: 10px;
                          font-weight: 700;
                          color: #166534;
                          text-transform: uppercase;
                          letter-spacing: 0.5px;
                          margin-bottom: 8px;
                        }
                        .estimate-pdf-trust-img {
                          max-height: 48px;
                          width: auto;
                          object-fit: contain;
                          margin-bottom: 6px;
                        }
                        .estimate-pdf-trust-desc {
                          font-size: 9.5px;
                          color: #64748b;
                          line-height: 1.3;
                        }
                        .estimate-pdf-signature-wrap {
                          border: 1px solid #e2e8f0;
                          border-radius: 6px;
                          background: #ffffff;
                          padding: 14px 16px;
                          margin-bottom: 16px;
                          page-break-inside: avoid !important;
                          break-inside: avoid !important;
                        }
                        .estimate-pdf-agreement-text {
                          font-size: 10.5px;
                          color: #64748b;
                          font-style: italic;
                          margin-bottom: 14px;
                          line-height: 1.35;
                          padding-bottom: 10px;
                          border-bottom: 1px dashed #e2e8f0;
                        }
                        .estimate-pdf-signatures-row {
                          display: flex;
                          justify-content: space-between;
                          gap: 30px;
                        }
                        .estimate-pdf-sig-box {
                          flex: 1;
                        }
                        .estimate-pdf-sig-label {
                          font-size: 10.5px;
                          font-weight: 700;
                          color: #166534;
                          text-transform: uppercase;
                          letter-spacing: 0.5px;
                          margin-bottom: 4px;
                        }
                        .estimate-pdf-sig-party {
                          font-size: 12px;
                          font-weight: 700;
                          color: #0f172a;
                          margin-bottom: 4px;
                        }
                        .estimate-pdf-sig-img-wrap {
                          height: 46px;
                          display: flex;
                          align-items: flex-end;
                          margin-bottom: 4px;
                        }
                        .estimate-pdf-sig-img {
                          max-height: 44px;
                          max-width: 170px;
                          object-fit: contain;
                        }
                        .estimate-pdf-sig-placeholder {
                          font-size: 11px;
                          color: #94a3b8;
                          font-style: italic;
                        }
                        .estimate-pdf-sig-line {
                          height: 1px;
                          background-color: #94a3b8;
                          width: 100%;
                          margin: 4px 0 6px 0;
                        }
                        .estimate-pdf-sig-meta {
                          font-size: 10px;
                          color: #64748b;
                        }
                        .estimate-pdf-footer {
                          text-align: center;
                          padding-top: 12px;
                          border-top: 1px solid #e2e8f0;
                          font-size: 9.5px;
                          color: #94a3b8;
                          page-break-inside: avoid;
                          break-inside: avoid;
                        }
                      `}</style>

                      <div className="estimate-pdf-wrap">
                        {/* Header */}
                        <div className="estimate-pdf-header">
                          <div className="estimate-pdf-brand">
                            {signupdata.companyImageUrl && signupdata.companyImageUrl !== "" ? (
                              <img src={signupdata.companyImageUrl} className="estimate-pdf-logo" alt="Company Logo" />
                            ) : (
                              <p className="estimate-pdf-company-name m-0">{signupdata.companyname}</p>
                            )}
                            <div className="estimate-pdf-company-name">{signupdata.companyname}</div>
                            <div className="estimate-pdf-company-info">
                              {signupdata.address ? <div>{signupdata.address}</div> : null}
                              <div>
                                {[parseLocationName(signupdata.city), parseLocationName(signupdata.state), parseLocationName(signupdata.country)].filter(Boolean).join(', ')}
                              </div>
                              {signupdata.email ? <div>Email: {signupdata.email}</div> : null}
                              <div>Instagram: @immaculate.homes</div>
                              {signupdata.website ? <div>Web: {signupdata.website}</div> : null}
                              {signupdata.gstNumber ? <div>{signupdata.TaxName || 'GST'} #: {signupdata.gstNumber}</div> : null}
                            </div>
                          </div>

                          <div className="estimate-pdf-meta">
                            <div className="estimate-pdf-title">Estimate</div>
                            <div className="estimate-pdf-badge">Estimate #: {estimateData.EstimateNumber}</div>
                            <div className="estimate-pdf-meta-text"><strong>Date:</strong> {formatCustomDate(estimateData.date)}</div>
                            {estimateData.duedate ? (
                              <div className="estimate-pdf-meta-text"><strong>Valid Until:</strong> {formatCustomDate(estimateData.duedate)}</div>
                            ) : (
                              <div className="estimate-pdf-meta-text"><strong>Valid Until:</strong> 30 Days from date</div>
                            )}
                          </div>
                        </div>

                        {/* Prepared For & Job Location */}
                        <div className="estimate-pdf-details-card">
                          <div className="estimate-pdf-col">
                            <div className="estimate-pdf-section-label">Prepared For</div>
                            <div className="estimate-pdf-client-name">{estimateData.customername}</div>
                            {estimateData.customeremail ? <div className="estimate-pdf-client-meta">{estimateData.customeremail}</div> : null}
                            {estimateData.customerphone ? <div className="estimate-pdf-client-meta">{estimateData.customerphone}</div> : null}
                          </div>
                          <div className="estimate-pdf-col" style={{ textAlign: 'right' }}>
                            <div className="estimate-pdf-section-label">Project / Job Location</div>
                            <div className="estimate-pdf-job-name">{estimateData.job || 'Project Site'}</div>
                            <div className="estimate-pdf-client-meta">
                              {[parseLocationName(signupdata.city), parseLocationName(signupdata.state)].filter(Boolean).join(', ')}
                            </div>
                          </div>
                        </div>

                        {/* Line Items Table */}
                        <div className="estimate-pdf-table-container">
                          <table className="estimate-pdf-table">
                            <thead>
                              <tr>
                                <th style={{ width: '52%', textAlign: 'left' }}>Scope of Work / Item</th>
                                <th style={{ width: '10%', textAlign: 'center' }}>Qty</th>
                                <th style={{ width: '10%', textAlign: 'center' }}>Unit</th>
                                <th style={{ width: '14%', textAlign: 'right' }}>Price</th>
                                <th style={{ width: '14%', textAlign: 'right' }}>Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((item) => (
                                <tr className="estimate-pdf-table-row" key={item._id}>
                                  <td>
                                    <span className="estimate-pdf-item-title">{item.itemname}</span>
                                    <div className="estimate-pdf-item-desc" dangerouslySetInnerHTML={{ __html: item.description }} />
                                  </td>
                                  <td style={{ textAlign: 'center', fontWeight: 500 }}>{item.itemquantity}</td>
                                  <td style={{ textAlign: 'center', fontWeight: 500 }}>{item.unit}</td>
                                  <td style={{ textAlign: 'right' }} className="estimate-pdf-rate">
                                    <CurrencySign />{formatCurrency(item.price)}
                                  </td>
                                  <td style={{ textAlign: 'right' }} className="estimate-pdf-amount">
                                    <CurrencySign />{formatCurrency(item.amount)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Financial Summary */}
                        <div className="estimate-pdf-summary-wrap">
                          <div className="estimate-pdf-summary-card">
                            <div className="estimate-pdf-summary-line">
                              <span>Subtotal:</span>
                              <strong><CurrencySign />{formatCurrency(estimateData.subtotal)}</strong>
                            </div>

                            {estimateData.discountTotal > 0 ? (
                              <div className="estimate-pdf-summary-line">
                                <span>Discount:</span>
                                <strong>-<CurrencySign />{formatCurrency(estimateData.discountTotal)}</strong>
                              </div>
                            ) : null}

                            {signupdata.taxPercentage > 0 ? (
                              <div className="estimate-pdf-summary-line">
                                <span>{signupdata.TaxName || 'GST'} ({signupdata.taxPercentage}%):</span>
                                <strong><CurrencySign />{formatCurrency(estimateData.tax)}</strong>
                              </div>
                            ) : null}

                            <div className="estimate-pdf-summary-line" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '6px', marginTop: '4px' }}>
                              <span>Total:</span>
                              <strong><CurrencySign />{formatCurrency(estimateData.total)}</strong>
                            </div>

                            {transactions && transactions.length > 0 ? transactions.map((t) => (
                              <div className="estimate-pdf-summary-line" key={t._id}>
                                <span>{t.method === 'deposit' ? 'Deposit' : 'Paid'} on {formatCustomDate(t.paiddate)}:</span>
                                <strong>-<CurrencySign />{formatCurrency(t.paidamount)}</strong>
                              </div>
                            )) : null}

                            <div className="estimate-pdf-total-banner">
                              <span className="estimate-pdf-total-label">Estimate Total</span>
                              <span className="estimate-pdf-total-val">
                                <CurrencySign />{formatCurrency(estimateData.total - transactions.reduce((total, payment) => total + (Number(payment.paidamount) || 0), 0))}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Notes & Trust Badges */}
                        <div className="estimate-pdf-info-wrap">
                          {estimateData.information ? (
                            <div className="estimate-pdf-notes-col">
                              <div className="estimate-pdf-notes-title">Project Specifications & Terms</div>
                              <div className="estimate-pdf-notes-content" dangerouslySetInnerHTML={{ __html: estimateData.information }} />
                            </div>
                          ) : null}
                          <div className="estimate-pdf-trust-col">
                            <div className="estimate-pdf-trust-title">Licensed & Insured Contractor</div>
                            <img src={sign} className="estimate-pdf-trust-img" alt="WCB Alberta & Fully Insured" />
                            <div className="estimate-pdf-trust-desc">Alberta WCB Covered • Fully Insured • Commercial & Residential Specialists</div>
                          </div>
                        </div>

                        {/* Signatures */}
                        {estimateData.isAddSignature || estimateData.isCustomerSign ? (
                          <div className="estimate-pdf-signature-wrap">
                            <div className="estimate-pdf-agreement-text">
                              By signing this document, the customer agrees to the services, specifications, and terms described in this estimate.
                            </div>
                            <div className="estimate-pdf-signatures-row">
                              {ownerData && estimateData.isAddSignature ? (
                                <div className="estimate-pdf-sig-box">
                                  <div className="estimate-pdf-sig-label">Authorized Signature</div>
                                  <div className="estimate-pdf-sig-party">{ownerData.companyname || signupdata.companyname}</div>
                                  <div className="estimate-pdf-sig-img-wrap">
                                    {ownerData.data ? (
                                      <img src={ownerData.data} alt="Authorized Signature" className="estimate-pdf-sig-img" />
                                    ) : (
                                      <div style={{ height: '40px' }}></div>
                                    )}
                                  </div>
                                  <div className="estimate-pdf-sig-line"></div>
                                  <div className="estimate-pdf-sig-meta">
                                    Date: {formatCustomDate(estimateData.createdAt || estimateData.date)}
                                  </div>
                                </div>
                              ) : null}

                              {estimateData.isCustomerSign ? (
                                <div className="estimate-pdf-sig-box">
                                  <div className="estimate-pdf-sig-label">Customer Acceptance</div>
                                  <div className="estimate-pdf-sig-party">{estimateData.customername}</div>
                                  <div className="estimate-pdf-sig-img-wrap">
                                    {signatureData && signatureData.customersign ? (
                                      <img src={`${signatureData.customersign}`} alt="Customer Signature" className="estimate-pdf-sig-img" />
                                    ) : (
                                      <span className="estimate-pdf-sig-placeholder">[ Sign Here to Accept ]</span>
                                    )}
                                  </div>
                                  <div className="estimate-pdf-sig-line"></div>
                                  <div className="estimate-pdf-sig-meta">
                                    Date: {signatureData && signatureData.createdAt ? formatCustomDate(signatureData.createdAt) : '________________________'}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ) : null}

                        {/* Footer */}
                        <div className="estimate-pdf-footer">
                          {signupdata.companyname || 'Immaculate Homes Ltd'} • Calgary, Alberta • {signupdata.email || 'immacltd23@gmail.com'} • {signupdata.website || 'www.immaculatehomes.ca'} • "We build homes TRUST"
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-12 col-sm-12 col-md-12 col-lg-8" id="">
                        <div className='print' id='invoiceContent1'>
                          <div className="invoice-body">
                            <div className='row'>
                              <div className='col-sm-12 col-md-6 mb-3 mb-md-0 pt-3'>
                                {signupdata.companyImageUrl !== "" ?
                                  <img src={signupdata.companyImageUrl} className='w-50 logoimage' alt="testing imahe" /> :
                                  <p className='h4 fw-bold'>{signupdata.companyname}</p>
                                }
                              </div>
                              <div className='col-sm-12 col-md-6 text-md-end'>
                                <h1>Estimate</h1>
                                <div className='text-inverse mb-1'>
                                  <strong>{signupdata.companyname}</strong>
                                </div>
                                <address className='m-t-5 m-b-5'>
                                  <div className='mb-2'>
                                    <div className=''>{signupdata.address} </div>
                                    {signupdata.city ? JSON.parse(signupdata.city).name + ',' : ' '}
                                    {signupdata.state ? JSON.parse(signupdata.state).name : ' '}

                                    <div className=''>{signupdata.state ? JSON.parse(signupdata.country).name : ' '}</div>
                                    {/* <div className=''>{JSON.parse(signupdata.city).name}, {JSON.parse(signupdata.state).name}</div>
                                    <div className=''>{JSON.parse(signupdata.country).emoji}</div> */}
                                  </div>

                                  <div ><a className='text-decoration-none' href={`mailto:${signupdata.email}`}>{signupdata.email}</a></div>
                                  <div ><a className='text-decoration-none' href='https://www.instagram.com/immaculate.homes'>https://www.instagram.com/immaculate.homes</a></div>
                                  <div ><a className='text-decoration-none' href={`${signupdata.website}`}>{signupdata.website}</a></div>
                                  <div>
                                    {signupdata.gstNumber == ''
                                      ?
                                      ""
                                      :
                                      `${signupdata.TaxName} ${signupdata.gstNumber}`
                                    }


                                  </div>

                                </address>
                              </div>

                            </div>
                            <div class="clr"></div>
                          </div>
                          <div className='invoice-header'>
                            <div className='row'>
                              <div className='invoice-to col-sm-12 col-md-6'>
                                <strong>Prepared For</strong>
                                {console.log(estimateData, "estimateData -======-==--==---===--")}
                                <div className='text-inverse mb-1'>
                                  {estimateData.customername}
                                </div>
                                <address className='m-t-5 m-b-5'>
                                  <div>{estimateData.customeremail}</div>
                                  <div>{estimateData.customerphone || ''}</div>

                                </address>
                              </div>
                              <div className='invoice-date col-sm-12 col-md-6'>
                                <div className='row text-md-end'>
                                  <div className='col-6 col-md'>
                                    <strong>Estimate #</strong>
                                  </div>
                                  <div className='col-6 col-md invoice-detail-right'>{estimateData.EstimateNumber}</div>
                                </div>
                                <div className='row text-md-end'>
                                  <div className='col-6 col-md'>
                                    <strong>Date</strong>
                                  </div>
                                  <div className='col-6 col-md invoice-detail-right'>{formatCustomDate(estimateData.date)}</div>
                                </div>
                                {/* <div className='row text-md-end'>
                                  <div className='col-6 col-md'>
                                    <strong>Due date</strong>
                                  </div>
                                  <div className='col-6 col-md invoice-detail-right'>{formatCustomDate(estimateData.duedate)}</div>
                                </div> */}
                                {/* <div className='row text-md-end'>
                                  <div className='col-6 col-md'>
                                    <strong>PO #</strong>
                                  </div>
                                  <div className='col-6 col-md invoice-detail-right'>{formatCustomDate(estimateData.duedate)}</div>
                                </div> */}
                                <div className='row text-md-end'>
                                  <div className='col-6 col-md'>
                                    <strong>Job</strong>
                                  </div>
                                  <div className='col-6 col-md invoice-detail-right'>{estimateData.job}</div>
                                </div>

                              </div>
                            </div>
                            <div class="clr"></div>
                          </div>

                          <div className='invoice-table'>
                            <div className='table-responsive'>
                              <table className='table table-invoice'>
                                <thead>
                                  <tr className='table table-invoice'>
                                    <th className='text-start'>Item</th>
                                    <th className='text-center d-none d-md-table-cell' width="15%">Quantity</th>
                                    <th className='text-end d-none d-md-table-cell' width="15%"> Unit</th>
                                    <th className='text-end d-none d-md-table-cell' width="15%"> Price</th>
                                    <th className='text-end' width="15%"> Amount</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {items.map((item) => (
                                    <tr key={item._id}>
                                      <td>
                                        <div>
                                          <span><strong>{item.itemname}</strong></span>
                                          <div dangerouslySetInnerHTML={{ __html: item.description }} />
                                          {/* <div>{item.description.replace(/<\/?[^>]+(>|$)/g, '')}</div> */}
                                        </div>
                                      </td>
                                      <td className="text-center d-none d-md-table-cell">{item.itemquantity}</td>
                                      <td className="text-end d-none d-md-table-cell">{item.unit}</td>
                                      <td className="text-end d-none d-md-table-cell"><CurrencySign />{roundOff(item.price)}</td>
                                      <td className='text-end'><CurrencySign />{roundOff(item.amount)}</td>
                                    </tr>
                                  ))}
                                </tbody>

                              </table>
                            </div>
                            <hr />
                            <div className='row'>
                              <div className='col-12'>
                                <table className='table table-borderless table-small'>

                                  <tbody>
                                    <tr>
                                      <td className='d-none d-md-table-cell' rowspan="5"></td>
                                      <td className='text-md-end' width="22%">Subtotal</td>
                                      <td className='text-end' width="22%"><CurrencySign />{roundOff(estimateData.subtotal)}</td>
                                    </tr>
                                    {
                                      estimateData.tax > 0
                                        ?
                                        <tr>
                                          <td className='text-md-end' width="22%">{signupdata.TaxName} ({signupdata.taxPercentage}%) </td>
                                          <td className='text-end' width="22%"><CurrencySign />{roundOff(estimateData.tax)}</td>
                                        </tr>
                                        :
                                        null
                                    }
                                    {
                                      estimateData.discountTotal > 0
                                        ?
                                        <tr>
                                          <td className='text-md-end' width="22%">Discount</td>
                                          <td className='text-end' width="22%"><CurrencySign />{roundOff(estimateData.discountTotal)}</td>
                                        </tr>
                                        :
                                        null
                                    }
                                    {/* <tr>
                                      {console.log(estimateData, "estimateData")}

                                      <td className='text-md-end' width="22%">Discount</td>
                                      <td className='text-end' width="22%">${roundOff(estimateData.discountTotal)}</td>
                                    </tr> */}
                                    {/* <tr>

                                      <td className='text-md-end' width="22%">{signupdata.TaxName} ({signupdata.taxPercentage}%)</td>
                                      <td className='text-end' width="22%">${roundOff(estimateData.tax)}</td>
                                    </tr> */}
                                    <tr>

                                      <td className='text-md-end' width="22%" style={{ borderBottom: '1px solid #ddd' }}>Total</td>
                                      <td className='text-end' width="22%" style={{ borderBottom: '1px solid #ddd' }}><CurrencySign />{roundOff(estimateData.total)}</td>
                                    </tr>
                                    {transactions.map((transaction) => (
                                      <tr key={transaction._id}>
                                        <td className='text-md-end' width="22%">{transaction.method == "deposit" ? "Deposit" : "Paid"} on {formatCustomDate(transaction.paiddate)}</td>
                                        <td className='text-end' width="22%" style={{ borderBottom: '1px solid #ddd' }}><CurrencySign />{transaction.paidamount}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            <div class="clr"></div>
                          </div>

                          <div className='invoice-price page-not-break'>
                            <div className='invoice-price-left text-end'>
                              <div className='d-none d-md-block'></div>

                            </div>
                            <div className='invoice-price-right'>
                              <small>Estimate Total</small>
                              <span class="f-w-600 mt-3"><CurrencySign />{roundOff(estimateData.total - transactions.reduce((total, payment) => total + payment.paidamount, 0))}</span>
                            </div>

                          </div>

                          {estimateData.isAddSignature || estimateData.isCustomerSign ?
                            <div className="invoice-body">
                              <p>By signing this document, the customer agrees to the services and conditions described in this document.</p>
                              <div className="row">
                                {console.log(ownerData, "ownerData")
                                }
                                {ownerData && estimateData.isAddSignature && (
                                  <div className="col-6">
                                    <div className="my-2">
                                      <div>
                                        <p className='text-center fw-bold fs-5'>{ownerData.companyname}</p>
                                        <img src={ownerData.data} alt="Saved Signature" style={{ width: "100%" }} /><hr />
                                        <p className='text-center'>{formatCustomDate(estimateData.createdAt)}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <div className="col-6">
                                  <div className="my-2">
                                    <div>
                                      <p className='text-center fw-bold fs-5'>{estimateData.customername}</p>
                                      {signatureData != null ?
                                        signatureData.customersign == '' ? ('') :
                                          (<div className="signature-section">
                                            <img src={`${signatureData.customersign}`} alt="Customer Signature" style={{ width: "100%" }} /><hr />
                                            <p className='text-center'>{formatCustomDate(signatureData.createdAt)}</p>
                                          </div>) : ''}
                                      {/* {signatureData ? (
                                            <div className="signature-section">
                                              <img src={`${signatureData.customersign}`} alt="Customer Signature" style={{ width: "100%" }} /><hr/>
                                              <p className='text-center'>{formatCustomDate(signatureData.createdAt)}</p>
                                            </div>
                                          ) : (
                                            ''
                                          )} */}
                                    </div>
                                  </div>
                                </div>
                              </div>

                            </div> : ''
                          }


                          <div className='invoice-body invoice-body-text'>
                            <div className='mt-1'>
                              <div className='row'>
                                <div className='col'>
                                  <div className='information-content' dangerouslySetInnerHTML={{ __html: estimateData.information }} />

                                </div>
                                <div className='col'>
                                  <img src={sign} className='w-100' />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-sm-12 col-md-12 col-lg-4">
                        <div className='mb-2'>
                          {showEmailAlert && (
                            <div className="alert alert-success row" role="alert">
                              <div className="col-11">
                                <p className='mb-0'>Email sent successfully!</p>
                              </div>
                              <button type="button" className="btn-close" aria-label="Close" onClick={handleAlertClose}></button>
                            </div>
                          )}
                        </div>
                        <div className='box1 rounded adminborder px-4 py-4'>
                          <div className="row">
                            <div className="col-6">
                              <p>Total</p>
                            </div>
                            <div className="col-6 text-end">
                              <p><CurrencySign />{estimateData.total}</p>
                            </div>

                          </div><hr />
                        </div>
                      </div>

                    </div>


                  </form>
                </div>
              </div>
            </div>
          </div>
      }

      {/* email model  */}
      <div class="modal fade" id="sendEmailModal" tabindex="-1" ref={modalRef} aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-4 fw-bold" id="exampleModalLabel">Send document</h1>
              <button type="button" class="btn-close" id="closebutton" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form onSubmit={handleFormSubmit}>
                <div class="row mb-3">
                  <label for="to" class="col-sm-2 col-form-label">To</label>
                  <div class="col-sm-10">
                    {/* <input type="text" class="form-control" id="to" name="to" value={estimateData.customeremail}/> */}
                    <ReactMultiEmail
                      emails={emails}
                      onChange={handleEmailChange}
                      getLabel={(
                        email,
                        index,
                        removeEmail
                      ) => (
                        <div data-tag="true" key={index}>
                          {email}
                          <span
                            data-tag-handle="true"
                            onClick={() => removeEmail(index)}
                          >
                            ×
                          </span>
                        </div>
                      )}
                      placeholder="Add more people..."
                      style={{
                        input: { width: '90%' },
                        emailsContainer: { border: '1px solid #ccc' },
                        emailInput: { backgroundColor: 'lightblue' },
                        invalidEmailInput: { backgroundColor: '#f9cfd0' },
                        container: { marginTop: '20px' },
                      }}

                    />
                  </div>
                </div>
                <div class="row mb-3">
                  <label for="bcc" class="col-sm-2 col-form-label">Bcc</label>
                  <div class="col-sm-10">
                    <ReactMultiEmail
                      emails={bccEmails}
                      onChange={handleBccEmailsChange}
                      getLabel={(
                        email,
                        index,
                        removeEmail
                      ) => (
                        <div data-tag="true" key={index}>
                          {email}
                          <span
                            data-tag-handle="true"
                            onClick={() => removeEmail(index)}
                          >
                            ×
                          </span>
                        </div>
                      )}
                      placeholder="Add BCC recipients..."
                      style={{
                        input: { width: '90%' },
                        emailsContainer: { border: '1px solid #ccc' },
                        emailInput: { backgroundColor: 'lightblue' },
                        invalidEmailInput: { backgroundColor: '#f9cfd0' },
                        container: { marginTop: '20px' },
                      }}
                    />
                  </div>
                </div>
                <div class="mb-3">
                  <label for="content" class="form-label">Content</label>
                  <textarea class="form-control" id="content" name="content" rows="5" defaultValue={content} onChange={handleContentChange}></textarea>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Send</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
