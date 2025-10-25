import React, { useState, useEffect } from 'react';
import Usernavbar from './Usernavbar';
import Usernav from './Usernav';
import { useNavigate } from 'react-router-dom';
import Alertauthtoken from '../../components/Alertauthtoken';
import { ColorRing } from 'react-loader-spinner';

export default function AddDocument() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [credentials, setCredentials] = useState({
    name: '',
    link: '',
  });
  const [addedCompanyPhotos, setAddedCompanyPhotos] = useState(null);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredDocs, setFilteredDocs] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem('authToken') || localStorage.getItem('isTeamMember') === 'true') {
      navigate('/');
    }
    fetchUploadedDocs();
    setLoading(false);
  }, []);

  const fetchUploadedDocs = async () => {
    const authToken = localStorage.getItem('authToken');
    try {
      const response = await fetch('https://immaculate.onrender.com/api/docs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken,
        },
      });

      const json = await response.json();
      console.log(json,"uplaod ocs");
      

      const docs = json.docs || [];
      setDocuments(json)
      setUploadedDocs(json);
      setFilteredDocs(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setUploadedDocs([]);
      setFilteredDocs([]);
    }
  };

  const handleImageUpload = async () => {
    if (!addedCompanyPhotos) return null;

    const data = new FormData();
    data.append('file', addedCompanyPhotos);
    data.append('upload_preset', 'employeeApp');
    data.append('cloud_name', 'dcldwaiyq');

    try {
      const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/dcldwaiyq/image/upload', {
        method: 'POST',
        body: data,
      });
      const result = await cloudinaryResponse.json();
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const authToken = localStorage.getItem('authToken');

    const uploadedImageUrl = await handleImageUpload();
    if (!uploadedImageUrl) {
      setAlertMessage('Error uploading image. Please try again.');
      setLoading(false);
      return;
    }

    const response = await fetch('https://immaculate.onrender.com/api/docs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      body: JSON.stringify({
        name: credentials.name,
        link: uploadedImageUrl,
      }),
    });

    if (response.ok) {
      const json = await response.json();
      console.log(json, "Check Json");
      setCredentials({ name: '', link: '' });
      setAddedCompanyPhotos(null);
      fetchUploadedDocs();
    } else {
      const json = await response.json();
      setAlertMessage(json.message || 'Something went wrong!');
    }
    setLoading(false);
  };

  const onchange = (event) => {
    setCredentials({ ...credentials, [event.target.name]: event.target.value });
  };

  const handleSearch = (event) => {
    console.log( event.target.value.toLowerCase(),"sd");
    
    const query = event.target.value.toLowerCase();
    setSearch(query);
    const filtered = uploadedDocs.filter((doc) =>
      doc.name.toLowerCase().includes(query)
    );
    setDocuments(filtered)
    setFilteredDocs(filtered);
  };

  return (
    <div className="bg">
      {loading ? (
        <div className="row">
          <ColorRing
            loading={loading}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      ) : (
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-2 col-md-3 b-shadow bg-white d-lg-block d-md-block d-none">
              <Usernavbar />
            </div>

            <div className="col-lg-10 col-md-9 col-12 mx-auto">
              <div className="d-lg-none d-md-none d-block mt-2">
                <Usernav />
              </div>
              <div className="mt-4 mx-4">
                {alertMessage && (
                  <Alertauthtoken
                    message={alertMessage}
                    onClose={() => setAlertMessage('')}
                  />
                )}
              </div>
              <form onSubmit={handleSubmit}>
                <div className="bg-white my-5 p-4 box mx-4">
                  <div className="row">
                    <p className="h5 fw-bold">Add Document</p>
                    <nav aria-label="breadcrumb">
                      <ol className="breadcrumb mb-0">
                        <li className="breadcrumb-item">
                          <a
                            href="/userpanel/Userdashboard"
                            className="txtclr text-decoration-none"
                          >
                            Dashboard
                          </a>
                        </li>
                        <li
                          className="breadcrumb-item active"
                          aria-current="page"
                        >
                          Add a new Document
                        </li>
                      </ol>
                    </nav>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col-12 col-sm-6">
                      <div className="mb-3">
                        <label
                          htmlFor="exampleInputtext1"
                          className="form-label"
                        >
                          Document Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={credentials.name}
                          onChange={onchange}
                          placeholder="Document Name"
                          id="exampleInputtext1"
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12 col-sm-6">
                      <div className="mb-3">
                        <label
                          htmlFor="exampleInputFile"
                          className="form-label"
                        >
                          Upload File
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          onChange={(e) =>
                            setAddedCompanyPhotos(e.target.files[0])
                          }
                          id="exampleInputFile"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row pt-4 pe-2">
                    <div className="col-3 me-auto"></div>
                    <div className="col-4 col-sm-2">
                      <button className="btn btnclr text-white">Add</button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Search and Document List */}
              <div className="bg-white my-5 p-4 box mx-4">
                <div className="row">
                  <div className="col-12">
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by Document Name"
                        value={search}
                        onChange={handleSearch}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    {console.log(documents,"filteredDocs")}
                    
                    <ul className="list-group">
                      {documents.map((doc) => (
                        <li
                          key={doc._id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <span>{doc.name}</span>
                          <a
                            href={doc.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-primary"
                          >
                            View
                          </a>
                        </li>
                      ))}
                    </ul>
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
