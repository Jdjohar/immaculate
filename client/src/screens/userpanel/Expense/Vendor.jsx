import React, { useState, useEffect } from 'react';
import { ColorRing } from 'react-loader-spinner';
import Usernavbar from '../Usernavbar';
import Usernav from '../Usernav';

export default function Vendor() {
    const [vendors, setVendors] = useState([]); // list of vendors
    const [selectedVendor, setSelectedVendor] = useState(null); // for edit
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertMessageShow, setAlertMessageShow] = useState(false);

    const apiURL = 'https://immaculate.onrender.com/api/vendor';

    // Fetch all vendors on component mount
    useEffect(() => {
        fetchVendors();
    }, []);

    // Fetch vendors
    const fetchVendors = async () => {
        setLoading(true);
        try {
            const response = await fetch(apiURL);
            const data = await response.json();
            setVendors(data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const method = selectedVendor ? 'PUT' : 'POST';
            const url = selectedVendor ? `${apiURL}/${selectedVendor._id}` : apiURL;

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                fetchVendors();
                setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '', notes: '' });
                setSelectedVendor(null); // Clear selected vendor
                setAlertMessage('Vendor saved successfully!');
                setAlertMessageShow(true);
            } else {
                console.error('Error saving vendor');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setAlertMessage('An error occurred while saving the vendor.');
            setAlertMessageShow(true);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (vendor) => {
        setSelectedVendor(vendor);
        setFormData({
            name: vendor.name,
            contactPerson: vendor.contactPerson,
            email: vendor.email,
            phone: vendor.phone,
            address: vendor.address,
            notes: vendor.notes,
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this vendor?')) {
            try {
                const response = await fetch(`${apiURL}/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    fetchVendors(); // refresh the list
                    setAlertMessage('Vendor deleted successfully!');
                    setAlertMessageShow(true);
                } else {
                    console.error('Error deleting vendor');
                }
            } catch (error) {
                console.error('Error deleting vendor:', error);
                setAlertMessage('An error occurred while deleting the vendor.');
                setAlertMessageShow(true);
            }
        }
    };

    return (
        <div className="bg">
            {
                loading ?
                    <div className='row'>
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
                                        {/* Left column - Form to add/update vendor */}
                                        <div className="col-md-7">
                                            <h3>{selectedVendor ? 'Update Vendor' : 'Add Vendor'}</h3>
                                            <form onSubmit={handleSubmit}>
                                                <div className="mb-3">
                                                    <label htmlFor="name" className="form-label">Vendor Name</label>
                                                    <input
                                                        type="text"
                                                        id="name"
                                                        name="name"
                                                        className="form-control"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="contactPerson" className="form-label">Contact Person</label>
                                                    <input
                                                        type="text"
                                                        id="contactPerson"
                                                        name="contactPerson"
                                                        className="form-control"
                                                        value={formData.contactPerson}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="email" className="form-label">Email</label>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        name="email"
                                                        className="form-control"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="phone" className="form-label">Phone</label>
                                                    <input
                                                        type="text"
                                                        id="phone"
                                                        name="phone"
                                                        className="form-control"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="address" className="form-label">Address</label>
                                                    <textarea
                                                        id="address"
                                                        name="address"
                                                        className="form-control"
                                                        value={formData.address}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="notes" className="form-label">Notes</label>
                                                    <textarea
                                                        id="notes"
                                                        name="notes"
                                                        className="form-control"
                                                        value={formData.notes}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                                    {selectedVendor ? 'Update Vendor' : 'Add Vendor'}
                                                </button>
                                                {selectedVendor && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary ms-2"
                                                        onClick={() => {
                                                            setSelectedVendor(null);
                                                            setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '', notes: '' });
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </form>
                                        </div>

                                        {/* Right column - List of vendors */}
                                        <div className="col-md-5">
                                            <h3>Vendors List</h3>
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
                                            ) : vendors.length > 0 ? (
                                                <ul className="list-group">
                                                    {vendors.map((vendor) => (
                                                        <li key={vendor._id} className="list-group-item d-flex justify-content-between align-items-center">
                                                            <div onClick={() => handleEdit(vendor)}>
                                                                <p className='m-0'><strong>{vendor.name}</strong></p>
                                                                <small>{vendor.address}</small>
                                                            </div>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleDelete(vendor._id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p>No vendors available.</p>
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
