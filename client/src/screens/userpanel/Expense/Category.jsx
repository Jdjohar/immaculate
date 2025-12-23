import React, { useState, useEffect } from 'react';
import Usernavbar from '../Usernavbar';
import Usernav from '../Usernav';
import { ColorRing } from 'react-loader-spinner';

export default function ExpenseType() {
    const [expenseTypes, setExpenseTypes] = useState([]); // list of expense types
    const [selectedExpenseType, setSelectedExpenseType] = useState(null); // for edit
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertmessageShow, setAlertmessageShow] = useState('');

    const apiURL = 'hhttps://immaculate.onrender.com/api/expensetype';

    // Fetch all expense types on component mount
    useEffect(() => {
        fetchExpenseTypes();
    }, []);

    // Fetch expense types
    const fetchExpenseTypes = async () => {
        setLoading(true);
        try {
            const response = await fetch(apiURL);
            const data = await response.json();
            setExpenseTypes(data);
        } catch (error) {
            console.error('Error fetching expense types:', error);
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
            const method = selectedExpenseType ? 'PUT' : 'POST';
            const url = selectedExpenseType ? `${apiURL}/${selectedExpenseType._id}` : apiURL;

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                fetchExpenseTypes();
                setFormData({ name: '', description: '' });
                setSelectedExpenseType(null); // Clear selected expense type
            } else {
                console.error('Error saving expense type');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (expenseType) => {
        setSelectedExpenseType(expenseType);
        setFormData({ name: expenseType.name, description: expenseType.description });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense type?')) {
            try {
                const response = await fetch(`${apiURL}/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    fetchExpenseTypes(); // refresh the list
                } else {
                    console.error('Error deleting expense type');
                }
            } catch (error) {
                console.error('Error deleting expense type:', error);
            }
        }
    };

    return (
        <div className="bg">
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
                                    {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                                    {alertmessageShow == true ?
                                        <div class="alert alert-warning d-flex justify-content-between" role="alert">
                                            <div>
                                                {alertmessageShow}
                                            </div>
                                            <button type="button" class="btn-close" onClick={() => {
                                                setAlertmessageShow("");
                                            }}>
                                            </button>
                                        </div>
                                        : ''
                                    }
                                </div>

                                <div className="container mt-4">
                                    <div className="row">
                                        {/* Left column - Form to add/update expense types */}
                                        <div className="col-md-7">
                                            <h3>{selectedExpenseType ? 'Update Expense Type' : 'Add Expense Type'}</h3>
                                            <form onSubmit={handleSubmit}>
                                                <div className="mb-3">
                                                    <label htmlFor="name" className="form-label">Expense Type Name</label>
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
                                                    <label htmlFor="description" className="form-label">Description</label>
                                                    <textarea
                                                        id="description"
                                                        name="description"
                                                        className="form-control"
                                                        value={formData.description}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                                    {selectedExpenseType ? 'Update Expense Type' : 'Add Expense Type'}
                                                </button>
                                                {selectedExpenseType && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary ms-2"
                                                        onClick={() => {
                                                            setSelectedExpenseType(null);
                                                            setFormData({ name: '', description: '' });
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </form>
                                        </div>

                                        {/* Right column - List of expense types */}
                                        <div className="col-md-5">
                                            <h3>Expense Types List</h3>
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
                                            ) : expenseTypes.length > 0 ? (
                                                <ul className="list-group">
                                                    {expenseTypes.map((expenseType) => (
                                                        <li key={expenseType._id} className="list-group-item d-flex justify-content-between align-items-center">
                                                            <div onClick={() => handleEdit(expenseType)}>
                                                                <strong>{expenseType.name}</strong> - {expenseType.description}
                                                            </div>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleDelete(expenseType._id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p>No expense types available.</p>
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
