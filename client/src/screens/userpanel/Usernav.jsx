import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import dollar from '../../img/dollar.svg'
import pin from '../../img/pin.svg'
import logout from '../../img/logout.svg'
import customers from '../../img/customers.svg'
import items from '../../img/items.svg'
import user from '../../img/user.svg'
// import './Userstyle.css'
import './Userstyle.css'

export default function Usernav() {

  let navigate = useNavigate();
  const [teammember, setTeammember] = useState("true");
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState({
    documents: false,
    management: false,
  });

  const toggleDropdown = (menu) => {
    setDropdownOpen((prevState) => ({
      ...prevState,
      [menu]: !prevState[menu]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userid');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isTeamMember');
    localStorage.removeItem('startTime');
    localStorage.removeItem('currencyType');
    localStorage.removeItem('taxOptions');
    navigate('/');
  };
  useEffect(() => {
    const tam = localStorage.getItem('isTeamMember');
    if (tam != undefined && tam != null && tam != "") {
      setTeammember(tam.toString());
    }
  })

  return (


    <div>
      <nav class="navbar bg-body-tertiary d-block d-lg-none d-md-none">
        <div class="">
          <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon text-black"></span>
          </button>
          <div class="offcanvas offcanvas-start text-black" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
            <div class="offcanvas-header">
              <h5 class="offcanvas-title" id="offcanvasNavbarLabel">IN<span className='clrblue'>VOICE</span></h5>
              <button type="button" class="btn-close " data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div class="offcanvas-body nav">
              <ul>
                <li className='text-center'>
                  <Link to="/Userpanel/Userdashboard" className={`nav-link scrollto icones text-black ${location.pathname == '/Userpanel/Userdashboard' ? 'active' : ''}`} >
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <p className='greyclr nav-link'>Documents</p>
                </li>
                <li>
                  <Link to="/userpanel/Invoice" className='nav-link scrollto icones text-black' >
                    <i class="fa-solid fa-house me-2 dashclr"></i> <span>Invoice</span>
                  </Link>
                </li>
                <li>
                  <Link to="/userpanel/Estimate" className='nav-link scrollto icones text-black' >
                    <i class="fa-solid fa-house me-2 dashclr"></i> <span>Estimate</span>
                  </Link>
                </li>
                <li>
                  <Link to="/userpanel/E-sign" className='nav-link scrollto icones text-black' >
                    <i class="fa-solid fa-house me-2 dashclr"></i> <span>E-Sign</span>
                  </Link>
                </li>
                <li>
                      <Link to="/userpanel/docs" className='nav-link scrollto icones w-100 text-black' >
                        <img src={pin} width="24px" height='24px' /> <span className='ps-2'>Documents</span>
                      </Link>
                    </li>
                <li className="nav-item">
                      <div className="nav-link pointer text-black" onClick={() => toggleDropdown('documents')}>
                        {/* <span>Expenses</span> */}
                        <img src={dollar} width="24px" height='24px' /> <span className='ps-2'>Expenses</span>
                      </div>
                      {dropdownOpen.documents && (
                        <ul className="dropdown-list">
                          <li>
                            <Link to="/userpanel/Expense" className='nav-link text-black'>
                              <img src={dollar} width="24px" height='24px' /> <span className='ps-2'>Expense Entry</span>
                            </Link>
                          </li>
                          <li>
                            <Link to="/userpanel/Category" className='nav-link text-black'>
                              <img src={dollar} width="24px" height='24px' /> <span className='ps-2'>Category</span>
                            </Link>
                          </li>
                          <li>
                            <Link to="/userpanel/Vendor" className='nav-link text-black'>
                              <img src={pin} width="24px" height='24px' /> <span className='ps-2'>Vendor</span>
                            </Link>
                          </li>
                          
                        </ul>
                      )}
                    </li>
                <li>
                  <p className='greyclr nav-link'>Management</p>
                </li>
                <li>
                  <Link to="/userpanel/Customerlist" className={`nav-link scrollto icones text-black ${location.pathname == '/userpanel/Customerlist' ||
                      location.pathname == '/userpanel/Addcustomer' ||
                      location.pathname == '/userpanel/Editcustomer' ? 'active' : ''}`} >
                    <i class="fa-solid fa-house me-2 dashclr"></i> <span>Customer List</span>
                  </Link>
                </li>
                <li>
                  <Link to="/userpanel/Itemlist" className={`nav-link scrollto icones text-black ${location.pathname == '/userpanel/Itemlist' ||
                      location.pathname == '/userpanel/Additem' ||
                      location.pathname == '/userpanel/Edititem' ? 'active' : ''}`} >
                    <i class="fa-solid fa-house me-2 dashclr"></i> <span>Item List</span>
                  </Link>
                </li>
                <li>
                  <Link to="/userpanel/Team" className={`nav-link scrollto icones text-black ${location.pathname == '/userpanel/Team' ||
                      location.pathname == '/userpanel/Addteam' ||
                      location.pathname == '/userpanel/Editteam' ||
                      location.pathname == '/userpanel/Timeview' ||
                      location.pathname == '/Timeschemahistory' ? 'active' : ''}`} >
                    <i class="fa-solid fa-house me-2 dashclr"></i> <span>Team</span>
                  </Link>
                </li>
                <li>
                  <Link to="/userpanel/Signature" className='nav-link scrollto iconestext-black' >
                    <i class="fa-solid fa-house me-2 dashclr"></i><span >Signature</span>
                  </Link>
                </li>
                <li>
                  <Link to="/userpanel/Imageupload" className='nav-link scrollto icones text-black' >
                    <i class="fa-solid fa-house me-2 dashclr"></i> <span>Logo Upload</span>
                  </Link>
                </li>
                <li>
                  <Link to="/userpanel/Editprofile" className='nav-link scrollto icones text-black' >
                    <i class="fa-solid fa-house me-2 dashclr"></i> <span>Profile</span>
                  </Link>
                </li>
                <li>
                  <Link to="/userpanel/Reports" className='nav-link scrollto w-100 icones text-black' >
                    <i class="fa-solid fa-house me-2 dashclr"></i> <span className='ps-2'>Report</span>
                  </Link>
                </li>

                <li>
                  <a onClick={handleLogout} className=" pointer nav-link scrollto icones text-black">
                    <i class="fa-solid fa-right-from-bracket me-2"></i>
                    <span>Logout</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}
