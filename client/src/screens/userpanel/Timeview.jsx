import React, { useState, useEffect } from 'react';
import Usernavbar from './Usernavbar';
import { useNavigate, useLocation } from 'react-router-dom';
import { ColorRing } from 'react-loader-spinner';
import Usernav from './Usernav';
import Alertauthtoken from '../../components/Alertauthtoken';

export default function Timeview() {
  const [loading, setloading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [userEntries, setUserEntries] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [isDeleting, setIsDeleting] = useState(false);
  const [entriesPerPage] = useState(13); // Number of entries per page
  const [editEntry, setEditEntry] = useState(null); // Entry currently being edited
  const [editForm, setEditForm] = useState({}); // Form data for editing

  if (location == null || location.state == null || location.state.teamid == null) {
    navigate('/userpanel/Team');
  }
  const teamid = location.state?.teamid;

  useEffect(() => {
    if (!localStorage.getItem('authToken') || localStorage.getItem("isTeamMember") === "true") {
      navigate('/');
    }
    fetchAllEntries();
  }, []);

  const fetchAllEntries = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`https://immaculate.onrender.com/api/userEntries/${teamid}`, {
        headers: {
          'Authorization': authToken,
        }
      });

      if (response.status === 401) {
        const data = await response.json();
        setAlertMessage(data.message);
        setloading(false);
        window.scrollTo(0, 0);
        return; // Stop further execution
      }

      const data = await response.json();

      // Sort entries by start time
      const sortedEntries = data.userEntries.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setUserEntries(sortedEntries);

      setTimeout(() => {
        setloading(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  // Handle delete functionality
  const handleDelete = async (entryId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this entry?");
    if (!confirmDelete) return; // Exit if user cancels

    setIsDeleting(true); // Disable the button while processing

    try {
      const response = await fetch(`https://immaculate.onrender.com/api/userEntries/${entryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUserEntries(userEntries.filter((entry) => entry._id !== entryId));
        alert("Entry deleted successfully!");
      } else {
        const errorData = await response.json();
        alert("Failed to delete entry. Please try again.");
      }
    } catch (error) {
      console.error("Error while deleting entry:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsDeleting(false); // Re-enable the button
    }
  };

  // Handle edit functionality
  const handleEditClick = (entry) => {
    setEditEntry(entry); // Store the entry being edited
    setEditForm({
      startTime: entry.startTime,
      endTime: entry.endTime,
      totalTime: entry.totalTime,
    });
  };

  // Function to calculate total time in the format HH:mm:ss
  const calculateTotalTime = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return '0 hours 0 minutes 0 seconds'; // Return default value if invalid
    }

    const timeDifference = end - start;

    if (timeDifference <= 0) {
      return '0 hours 0 minutes 0 seconds'; // Invalid time range
    }

    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    return `${hours} hours ${minutes} minutes ${seconds} seconds`;
  };

  // Handle change in startTime or endTime and calculate total time
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prevForm) => {
      const newForm = { ...prevForm, [name]: value };
      
      // If startTime or endTime is changed, recalculate total time
      if (name === 'startTime' || name === 'endTime') {
        const totalTime = calculateTotalTime(newForm.startTime, newForm.endTime);
        newForm.totalTime = totalTime;
      }

      return newForm;
    });
  };

  const handleEditSubmit = async (e, entryId) => {
    e.preventDefault();

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`https://immaculate.onrender.com/api/userEntries/${entryId}`, {
        method: "PUT",
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm), // Send updated data
      });

      if (response.ok) {
        const updatedEntry = await response.json();

        // Update the state with the updated entry
        setUserEntries((prevEntries) =>
          prevEntries.map((entry) => (entry._id === entryId ? updatedEntry.updatedEntry : entry))
        );

        alert("Entry updated successfully!");
        setEditEntry(null); // Close the edit form
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to update entry. Please try again.");
      }
    } catch (error) {
      console.error("Error while updating entry:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const GoToHistory = () => {
    navigate('/Timeschemahistory', { state: { teamid } });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = userEntries.slice(indexOfFirstEntry, indexOfLastEntry);

  return (
    <div className='bg'>
      <div className='container-fluid'>
        {loading ? (
          <div className="row">
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
          <div className="row">
            <div className="col-lg-2 col-md-3 vh-100 b-shadow bg-white d-lg-block d-md-block d-none">
              <Usernavbar />
            </div>

            <div className="col-lg-10 col-md-9 col-12 mx-auto">
              <div className="d-lg-none d-md-none d-block mt-2">
                <Usernav />
              </div>
              <div className='mt-4 mx-4'>
                {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
              </div>
              <div className="row my-4 mx-4">
                <div className="col-lg-4 col-md-6 col-sm-6 col-7 me-auto">
                  <p className="h5 fw-bold">Current Month</p>
                </div>
                <div className="col-lg-3 col-md-4 col-sm-4 col-5 text-right">
                  <button className="btn rounded-pill btnclr text-white fw-bold mb-2" onClick={GoToHistory}>
                    History
                  </button>
                </div>
                <hr />

                <div className="row px-0 table-responsive box1 rounded adminborder text-center">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th scope="col">Start Time</th>
                        <th scope="col">End Time</th>
                        <th scope="col">Total Time</th>
                        <th scope="col">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentEntries.map((entry) => (
                        <tr key={entry._id}>
                          <td>{new Date(entry.startTime).toLocaleString()}</td>
                          <td>{entry.endTime ? new Date(entry.endTime).toLocaleString() : '--'}</td>
                          <td>{entry.totalTime}</td>
                          <td>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleDelete(entry._id)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                            <button
                              className="btn btn-primary ms-2"
                              onClick={() => handleEditClick(entry)}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pagination justify-content-end mt-3">
                  {Array(Math.ceil(userEntries.length / entriesPerPage))
                    .fill(null)
                    .map((_, index) => (
                      <button key={index} className='mx-1' onClick={() => handlePageChange(index + 1)}>
                        {index + 1}
                      </button>
                    ))}
                </div>

                {/* Edit Form */}
                {editEntry && (
                  <div className="edit-form mt-3">
                    <h5>Edit Entry</h5>
                    <form onSubmit={(e) => handleEditSubmit(e, editEntry._id)}>
                      <div className="form-group">
                        <label>Start Time</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          name="startTime"
                          value={editForm.startTime}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="form-group mt-3">
                        <label>End Time</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          name="endTime"
                          value={editForm.endTime}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="form-group mt-3">
                        <label>Total Time</label>
                        <input
                          type="text"
                          className="form-control"
                          name="totalTime"
                          value={editForm.totalTime}
                          disabled
                        />
                      </div>
                      <button type="submit" className="btn btn-success mt-3">
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary mt-3 ms-2"
                        onClick={() => setEditEntry(null)}
                      >
                        Cancel
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
