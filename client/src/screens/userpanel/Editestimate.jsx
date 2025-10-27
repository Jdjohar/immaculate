import React, { useState, useEffect } from 'react'
import { format } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom'
import { ColorRing } from 'react-loader-spinner'
import Usernav from './Usernav';
import Usernavbar from './Usernavbar';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// import VirtualizedSelect from 'react-virtualized-select';
// import 'react-virtualized-select/styles.css';
// import 'react-virtualized/styles.css'
import Select from 'react-select';
import CurrencySign from '../../components/CurrencySign ';
import Alertauthtoken from '../../components/Alertauthtoken';
import SignatureModal from '../../components/SignatureModal';


class MyCustomUploadAdapter {
    constructor(loader) {
        // Save Loader instance to use later
        this.loader = loader;
    }

    upload() {
        return this.loader.file.then(file => {
            return new Promise((resolve, reject) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', 'employeeApp'); // Replace with your Cloudinary upload preset
                formData.append('cloud_name', 'dcldwaiyq'); // Replace with your Cloudinary cloud name

                // Upload image to Cloudinary
                fetch('https://api.cloudinary.com/v1_1/dcldwaiyq/image/upload', {
                    method: 'POST',
                    body: formData,
                })
                    .then(response => response.json())
                    .then(data => {
                        resolve({
                            default: data.secure_url
                        });
                        console.log(data.secure_url, "================================================================");
                    })
                    .catch(error => {
                        reject(error.message || 'Failed to upload image to Cloudinary');
                    });
            });
        });
    }

    abort() {
        // Implement if needed
    }
}

function MyCustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new MyCustomUploadAdapter(loader);
    };
}

export default function Editestimate() {
    const [loading, setloading] = useState(true);
    const [customers, setcustomers] = useState([]);
    const [selectedCustomerDetails, setSelectedCustomerDetails] = useState({
        name: '', email: ''
    });
    const [searchcustomerResults, setSearchcustomerResults] = useState([]);
    const [isCustomerSelected, setIsCustomerSelected] = useState(false);
    const [items, setitems] = useState([]);
    const [searchitemResults, setSearchitemResults] = useState([]);
    const [quantityMap, setQuantityMap] = useState({});
    const [discountMap, setDiscountMap] = useState({});
    const [itemExistsMessage, setItemExistsMessage] = useState('');
    const [discountTotal, setdiscountTotal] = useState(0);
    const [taxPercentage, setTaxPercentage] = useState(0);
    const [estimateData, setestimateData] = useState({
        _id: '', customername: '', itemname: '', customeremail: '', EstimateNumber: '', purchaseorder: '',
        date: new Date(), description: '', itemquantity: '', price: '', discount: '', discountTotal: '',
        amount: '', tax: '', taxpercentage: '', subtotal: '', total: '', amountdue: '', information: '', items: []
    });
    // const location = useLocation();
    var estimateid = '' //location.state?.estimateid;
    const [editorData, setEditorData] = useState("<p></p>");
    const [alertMessage, setAlertMessage] = useState('');
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const [isAddSignatureSwitchOn, setIsAddSignatureSwitchOn] = useState(false);
    const [isCustomerSignSwitchOn, setIsCustomerSignSwitchOn] = useState(false);
    const [signUpData, setsignUpData] = useState(0);

    const location = useLocation();
    if (estimateid == "") {

        estimateid = location.state?.estimateid;
    }



    useEffect(() => {
        if (!localStorage.getItem("authToken") || localStorage.getItem("isTeamMember") == "true") {
            navigate("/");
        }
        const getTaxOptions = localStorage.getItem("taxOptions")
        setsignUpData(JSON.parse(getTaxOptions)[0])
        if (isNaN(discountTotal)) {
            setdiscountTotal(0);
        }
        if (estimateid) {
            fetchdata();
            fetchcustomerdata();
            fetchitemdata();
            fetchSignatureStatus();
        }
        if (isNaN(discountTotal)) {
            setdiscountTotal(0);
        }
    }, [estimateid])
    let navigate = useNavigate();

    const fetchSignatureStatus = async () => {
        try {
            const ownerId = localStorage.getItem('userid');
            const response = await fetch(`https://immaculate-qlaf.vercel.app/api/check-signature/${ownerId}`);
            const data = await response.json();
            console.log(data, "data");

            setIsAddSignatureSwitchOn(data.hasSignature);
            setIsCustomerSignSwitchOn(data.hasSignature);
        } catch (error) {
            console.error('Error checking signature:', error);
        }
    };

    const handleSignatureSwitch = async (event) => {
        if (event.target.checked) {
            try {
                const ownerId = localStorage.getItem('userid');
                const response = await fetch(`https://immaculate-qlaf.vercel.app/api/check-signature/${ownerId}`);
                const data = await response.json();
                setHasSignature(data.hasSignature);

                if (!data.hasSignature) {
                    setIsSignatureModalOpen(true);
                }
                setIsAddSignatureSwitchOn(true); // Automatically activate "Add My Signature"
                setIsCustomerSignSwitchOn(true); // Automatically activate "Customer to Sign"
            } catch (error) {
                console.error('Error checking signature:', error);
            }
        } else {
            setIsAddSignatureSwitchOn(false);
            setIsCustomerSignSwitchOn(false);
            setHasSignature(false); // Ensure switches are hidden
        }
    };

    const handleAddSignatureSwitch = (event) => {
        setIsAddSignatureSwitchOn(event.target.checked);
        if (!event.target.checked && !isCustomerSignSwitchOn) {
            setHasSignature(false);
        }
    };

    const handleCustomerSignSwitch = (event) => {
        setIsCustomerSignSwitchOn(event.target.checked);
        if (!event.target.checked && !isAddSignatureSwitchOn) {
            setHasSignature(false);
        }
    };

    const saveSignature = async (signatureData) => {
        try {
            const ownerId = localStorage.getItem('userid');
            const email = localStorage.getItem('userEmail');
            const companyname = localStorage.getItem('companyname');
            await fetch('https://immaculate-qlaf.vercel.app/api/ownersignature', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ signature: signatureData, ownerId, email, companyname }),
            });
            setHasSignature(true);
            setIsSignatureModalOpen(false);
        } catch (error) {
            console.error('Error saving signature:', error);
        }
    };

    const roundOff = (value) => {
        return Math.round(value * 100) / 100;
    };

    const fetchdata = async () => {
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`https://immaculate-qlaf.vercel.app/api/geteditestimateData/${estimateid}`, {
                headers: {
                    'Authorization': authToken,
                }
            });
            if (response.status === 401) {
                alert('Your session has expired. Please login again.');
                const json = await response.json();
                setAlertMessage(json.message);
                setloading(false);
                window.scrollTo(0, 0);
                return; // Stop further execution
            }
            else {
                const json = await response.json();
                console.log(json, "estimate Json");
                if (json.Success) {
                    console.log(json.estimates,"json.estimates");

                    setestimateData(json.estimates);
                    setdiscountTotal(json.estimates.discountTotal);
                    // setdiscountTotal(json.invoices.discountTotal);

                    // Debugging: log the fetched data
                    console.log('Fetched Estimate Data:', json.estimates);

                    setIsAddSignatureSwitchOn((json.estimates.isAddSignature).toString() == "true"); // Default to false if undefined
                    setIsCustomerSignSwitchOn((json.estimates.isCustomerSign).toString() == "true"); // Default to false if undefined
                    setHasSignature(json.estimates.isCustomerSign);
                    // Debugging: log the state after setting
                    console.log('isAddSignatureSwitchOn:', json.estimates.isAddSignature);
                    console.log('isCustomerSignSwitchOn:', json.estimates.isCustomerSign);
                }
            }

        } catch (error) {
            console.error('Error fetching estimateData:', error);
        }
    };

    const fetchcustomerdata = async () => {
        try {
            const userid = localStorage.getItem("userid");
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`https://immaculate-qlaf.vercel.app/api/customers/${userid}`, {
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

                if (Array.isArray(json)) {
                    setcustomers(json);
                }
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }



    const fetchitemdata = async () => {
        try {
            const userid = localStorage.getItem("userid");
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`https://immaculate-qlaf.vercel.app/api/itemdata/${userid}`, {
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

                if (Array.isArray(json)) {
                    setitems(json);
                }
                setloading(false);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const handleSaveClick = async () => {
        try {
            const updatedestimateData = {
                ...estimateData,
                subtotal: calculateSubtotal(),
                total: calculateTotal(),
                amountdue: calculateTotal(),
                items: estimateData.items,
                tax: calculateTaxAmount(),
                discountTotal: discountTotal,
                isAddSignature: isAddSignatureSwitchOn,
                isCustomerSign: isCustomerSignSwitchOn,
            };
            const authToken = localStorage.getItem('authToken');

            const response = await fetch(`https://immaculate-qlaf.vercel.app/api/updateestimateData/${estimateid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken,
                },
                body: JSON.stringify(updatedestimateData)
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

                if (json.Success) {
                    navigate('/userpanel/Estimatedetail', { state: { estimateid } });
                    console.log(updatedestimateData);
                } else {
                    console.error('Error updating  estimate data:', json.message);
                }
            }


        } catch (error) {
            console.error('Error updating  estimate data:', error);
        }
    };

    const addSelectedItemToEstimate = (selectedItem) => {
        const { value, label } = selectedItem;
        // Check if the item is already present in estimateData.items
        const itemExists = estimateData.items.some((item) => item.itemId === value);

        if (!itemExists) {
            const selectedPrice = items.find((i) => i._id === value)?.price || 0;
            const selectedUnit = items.find((i) => i._id === value)?.unit || 0;
            const selectedDescription = items.find((i) => i._id === value)?.description || "";
            const newItem = {
                itemId: value,
                itemname: label,
                price: selectedPrice,
                unit: selectedUnit,
                itemquantity: 1, // Set default quantity or whatever value you prefer
                discount: 0, // Set default discount or whatever value you prefer
                amount: selectedPrice, // Initially set amount same as price
                description: selectedDescription, // Set the description if needed
            };
            // Add the selected item to estimateData.items
            setestimateData({
                ...estimateData,
                items: [...estimateData.items, newItem],
            });
        } else {
            console.log('Item already added to the estimate');
        }
    };

    const onChangeitem = (selectedItem) => {
        // Check if the selected item already exists in invoiceData.items
        const itemExists = estimateData.items && estimateData.items.some(item => item.itemId === selectedItem.value);
        if (itemExists) {
            setItemExistsMessage('This item is already added!');
        } else {
            setItemExistsMessage('');
            // Call the function to add the selected item to invoiceData.items
            addSelectedItemToEstimate(selectedItem);
        }
    };

    const handleEditorChange = (event, editor) => {
        const data = editor.getData();
        // Use the functional form of setestimateData to ensure you're working with the latest state
        setestimateData((prevEstimateData) => ({
            ...prevEstimateData, // Spread the previous state
            information: data,   // Update only the `information` field
        }));
    };
    const handledescChange = (event, editor) => {
        const data = editor.getData();
        setestimateData({ ...estimateData, description: data });
    };


    const handleQuantityChange = (event, itemId) => {
        const { value } = event.target;
        const updatedItems = estimateData.items.map((item) => {
            if (item.itemId === itemId) {
                const newQuantity = parseFloat(value) >= 0 ? parseFloat(value) : 0;
                const newAmount = calculateDiscountedAmount(item.price, newQuantity, item.discount);

                return {
                    ...item,
                    itemquantity: newQuantity,
                    amount: newAmount,
                };
            }
            return item;
        });

        setestimateData({ ...estimateData, items: updatedItems });
    };

    const onChangeQuantity = (event, itemId) => {
        let newQuantity = event.target.value ? parseFloat(event.target.value) : 1;
        newQuantity = Math.max(newQuantity, 0); // Ensure quantity is not negative

        setQuantityMap((prevMap) => ({
            ...prevMap,
            [itemId]: newQuantity,
        }));
    };

    const onDeleteItem = (itemIdToDelete) => {
        setSearchitemResults((prevResults) => {
            return prevResults.filter((item) => item.value !== itemIdToDelete);
        });
    };

    const handleDeleteClick = async (itemId) => {
        try {
            if (!itemId) {
                console.error('Item ID is undefined or null');
                return;
            }

            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`https://immaculate-qlaf.vercel.app/api/delestimateitem/${estimateData._id}/${itemId}`, {
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
            }
            else {
                if (!response.ok) {
                    const errorMessage = await response.text();
                    throw new Error(`Failed to delete item: ${errorMessage}`);
                }

                fetchdata();
            }


        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const calculateDiscountedAmount = (price, quantity, discount) => {
        const totalAmount = price * quantity;
        const discountedAmount = totalAmount - Math.max(discount, 0); // Ensure discount is not negative
        return discountedAmount > 0 ? discountedAmount : 0;
    };

    const onDiscountpreitemChange = (event, itemId) => {
        const { value } = event.target;
        const regex = /^\d*\.?\d{0,2}$/; // Regex to allow up to two decimal places

        // Check if the input matches the allowed format
        if (regex.test(value)) {
            const newDiscount = value !== '' ? parseFloat(value) : 0;

            // Update only the discount for the specific item with the matching itemId
            const updatedItems = estimateData.items.map((item) => {
                if (item.itemId === itemId) {
                    const quantity = item.itemquantity || 1;
                    const discountedAmount = calculateDiscountedAmount(item.price, quantity, newDiscount);

                    return {
                        ...item,
                        discount: newDiscount,
                        amount: discountedAmount,
                    };
                }
                return item;
            });

            // Set the updated items in the state
            setestimateData({
                ...estimateData,
                items: updatedItems,
            });
        } else {
            // Handle invalid input (e.g., show a message to the user)
            console.log('Invalid input for discount');
        }
    };

    const onDiscountChange = (event, itemId) => {
        const discountValue = event.target.value;
        const regex = /^\d*\.?\d{0,2}$/; // Regex to allow up to two decimal places

        // Check if the input matches the allowed format
        if (regex.test(discountValue)) {
            const newDiscount = discountValue !== '' ? parseFloat(discountValue) : 0;
            const selectedPrice = items.find((i) => i._id === itemId)?.price || 0;
            const quantity = quantityMap[itemId] || 1;
            const totalAmount = selectedPrice * quantity;

            const discountedAmount = totalAmount - (totalAmount * newDiscount) / 100;

            setDiscountMap((prevMap) => ({
                ...prevMap,
                [itemId]: newDiscount,
            }));

            // Use discountedAmount in your code where needed
            // console.log('Discounted Amount:', discountedAmount.toFixed(2)); // Output the discounted amount
        } else {
            // Handle invalid input (e.g., show a message to the user)
            console.log('Invalid input for discount');
        }
    };

    const calculateSubtotal = () => {
        let subtotal = 0;

        // Calculate subtotal for estimateData.items
        if (estimateData.items && Array.isArray(estimateData.items)) {
            estimateData.items.forEach((item) => {
                const itemPrice = item.price || 0;
                const quantity = item.itemquantity || 1;
                const discount = item.discount || 0;

                const discountedAmount = calculateDiscountedAmount(itemPrice, quantity, discount);

                subtotal += discountedAmount;
            });
        }

        // Calculate subtotal for searchitemResults
        searchitemResults.forEach((item) => {
            const selectedItem = items.find((i) => i._id === item.value);
            const itemPrice = selectedItem?.price || 0;
            const itemId = item.value;
            const quantity = quantityMap[itemId] || 1;
            const discount = discountMap[itemId] || 0;

            const discountedAmount = calculateDiscountedAmount(itemPrice, quantity, discount);

            subtotal += discountedAmount;
        });

        return subtotal;
    };


    // Function to handle tax change
    const handleTaxChange = (event) => {
        let enteredTax = event.target.value;
        // Restrict input to two digits after the decimal point
        const regex = /^\d*\.?\d{0,2}$/; // Regex to allow up to two decimal places
        if (regex.test(enteredTax)) {
            // Ensure that the entered value is a valid number
            enteredTax = parseFloat(enteredTax);
            setTaxPercentage(enteredTax);
            setestimateData({ ...estimateData, taxpercentage: enteredTax });
        }
    };

    // Function to calculate tax amount
    const calculateTaxAmount = () => {
        const subtotal = calculateSubtotal();
        const totalDiscountedAmount = subtotal; // Apply overall discount first
        const taxAmount = (totalDiscountedAmount * signUpData.percentage) / 100;
        return roundOff(taxAmount);
    };


    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const taxAmount = calculateTaxAmount();
        const discountAmount = discountTotal;
        const totalAmount2 = subtotal + taxAmount;
        const totalAmount = totalAmount2 - discountAmount;
        return roundOff(totalAmount);
    };

    const onchange = (event) => {
        const { name, value } = event.target;
        setestimateData({ ...estimateData, [name]: value });
    };

    const handlePriceChange = (event, itemId) => {
        const { value } = event.target;
        const numericValue = value.replace(/[^0-9.]/g, ''); // Remove any non-numeric characters except decimal point

        // Limit the numeric value to two decimal places
        const decimalIndex = numericValue.indexOf('.');
        let formattedValue = numericValue;
        if (decimalIndex !== -1) {
            formattedValue = numericValue.slice(0, decimalIndex + 1) + numericValue.slice(decimalIndex + 1).replace(/[^0-9]/g, '').slice(0, 2);
        }

        const newPrice = parseFloat(formattedValue) || 0;

        const updatedItems = estimateData.items.map((item) => {
            if (item.itemId === itemId) {
                const newAmount = newPrice * item.itemquantity;
                return {
                    ...item,
                    price: formattedValue, // Update with formatted value
                    amount: roundOff(newAmount),
                };
            }
            return item;
        });

        setestimateData((prevData) => ({
            ...prevData,
            items: updatedItems,
        }));
    };


    const handlePriceBlur = (event, itemId) => {
        const { value } = event.target;
        const newPrice = parseFloat(value) || 0;

        const updatedItems = estimateData.items.map((item) => {
            if (item.itemId === itemId) {
                const newAmount = newPrice * item.itemquantity;
                return {
                    ...item,
                    price: roundOff(newPrice), // Format to two decimal places
                    amount: roundOff(newAmount),
                };
            }
            return item;
        });

        setestimateData((prevData) => ({
            ...prevData,
            items: updatedItems,
        }));
    };

    // const handlePriceChange = (event, itemId) => {
    //     const { value } = event.target;
    //     const updatedItems = estimateData.items.map((item) => {
    //         if (item.itemId === itemId) {
    //             const newPrice = parseFloat(value);
    //             const quantity = item.itemquantity || 1;
    //             const discount = item.discount || 0;
    //             const discountedAmount = calculateDiscountedAmount(newPrice, quantity, discount);
    //             return { ...item, price: newPrice, amount: discountedAmount };
    //         }
    //         return item;
    //     });
    //     setestimateData({ ...estimateData, items: updatedItems });
    // };

    const handleDescriptionChange = (editor, itemId) => {
        const value = editor.getData();
        const updatedItems = estimateData.items.map((item) => {
            if (item.itemId === itemId) {
                return { ...item, description: value };
            }
            return item;
        });
        setestimateData({ ...estimateData, items: updatedItems });
    };

    const handleDiscountChange = (event) => {
        const value = event.target.value;
        // If the input is empty or NaN, set the value to 0
        const newValue = value === '' || isNaN(parseFloat(value)) ? 0 : parseFloat(value);
        setdiscountTotal(newValue);
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
                                <div className='mx-4'>

                                    {/* <form> */}
                                    <div className='row py-4 px-2 breadcrumbclr'>
                                        <div className="col-lg-4 col-md-6 col-sm-6 col-7 me-auto">
                                            <p className='fs-35 fw-bold'>Estimate</p>
                                            <nav aria-label="breadcrumb">
                                                <ol class="breadcrumb mb-0">
                                                    <li class="breadcrumb-item"><a href="/Userpanel/Userdashboard" className='txtclr text-decoration-none'>Dashboard</a></li>
                                                    <li class="breadcrumb-item"><a href="/userpanel/Estimate" className='txtclr text-decoration-none'>Estimate</a></li>
                                                    <li class="breadcrumb-item active" aria-current="page">Edit Estimate</li>
                                                </ol>
                                            </nav>
                                        </div>
                                        <div className="col-lg-3 col-md-4 col-sm-4 col-5 text-right">
                                            <button className='btn rounded-pill btn-danger text-white fw-bold' type="submit" onClick={handleSaveClick}>Save</button>
                                        </div>
                                        <div className='mt-2'>
                                            {alertMessage && <Alertauthtoken message={alertMessage} onClose={() => setAlertMessage('')} />}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-9 col-12 order-2 order-lg-1">
                                            <div className="box1 rounded adminborder p-4 m-2 mb-5">
                                                <div className="row me-2">
                                                    {/* Customer Details */}
                                                    <div className="col-md-5 col-sm-12">
                                                        <div className="customerdetail p-3">
                                                            {console.log(estimateData,"frtch estimateDatasd sddssd")}
                                                            
                                                            {estimateData?.customername && (
                                                                <ul>
                                                                    <li className="fw-bold fs-4">{estimateData.customername}</li>
                                                                </ul>
                                                            )}
                                                            {estimateData?.customeremail && <p>{estimateData.customeremail}</p>}
                                                        </div>
                                                    </div>

                                                    {/* Form Fields */}
                                                    <div className="col-md-7 col-sm-12">
                                                        <div className="row">
                                                            <div className="col-md-6 col-sm-12">
                                                                <div className="mb-3">
                                                                    <label htmlFor="invoicenumbr" className="form-label">
                                                                        Estimate Number
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        name="EstimateNumber"
                                                                        className="form-control"
                                                                        value={estimateData.EstimateNumber}
                                                                        onChange={onchange}
                                                                        id="invoicenumbr"
                                                                        required
                                                                        disabled
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6 col-sm-12">
                                                                <div className="mb-3">
                                                                    <label htmlFor="purchaseoder" className="form-label">
                                                                        Purchase Order (PO) #
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        name="purchaseorder"
                                                                        className="form-control"
                                                                        value={estimateData.purchaseorder}
                                                                        onChange={onchange}
                                                                        id="purchaseoder"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6 col-sm-12">
                                                                <div className="mb-3">
                                                                    <label htmlFor="Date" className="form-label">
                                                                        Date
                                                                    </label>
                                                                    <input
                                                                        type="date"
                                                                        name="date"
                                                                        className="form-control"
                                                                        value={new Date(estimateData.date).toISOString().split("T")[0]}
                                                                        onChange={onchange}
                                                                        id="Date"
                                                                        required
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6 col-sm-12">
                                                                <div className="mb-3">
                                                                    <label htmlFor="job" className="form-label">
                                                                        Job
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        name="job"
                                                                        className="form-control"
                                                                        value={estimateData.job}
                                                                        onChange={onchange}
                                                                        id="job"
                                                                        required
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Items Section */}
                                                <div className="box1 rounded adminborder p-4 m-2">
                                                    {/* Table Header */}
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered table-responsive text-center">
                                                            <thead className="table-light">
                                                                <tr>
                                                                    <th>ITEM</th>
                                                                    <th>QUANTITY</th>
                                                                    <th>UNIT</th>
                                                                    <th>PRICE</th>
                                                                    <th>AMOUNT</th>


                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {estimateData.items &&
                                                                    estimateData.items.map((o) => (
                                                                        <tr key={o.itemId}>
                                                                            {/* ITEM */}
                                                                            <td scope='col'>

                                                                                <div className="mb-3 d-flex align-items-baseline justify-content-between">
                                                                                    <p>{o.itemname}</p>
                                                                                    <button type="button" className="btn btn-danger btn-sm me-2" onClick={() => handleDeleteClick(o.itemId)}>
                                                                                        <i className="fas fa-trash"></i>
                                                                                    </button>
                                                                                </div>
                                                                                <div className="row">
                                                                                    <div className="col">
                                                                                        <label htmlFor={`item-description-${o.itemId}`} className="form-label">Description</label>
                                                                                        <CKEditor
                                                                                            editor={ClassicEditor}
                                                                                            data={o.description}
                                                                                            onChange={(e, t) => {
                                                                                                handleDescriptionChange(t, o.itemId);
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                </div>




                                                                                <br />


                                                                            </td>


                                                                            {/* QUANTITY */}
                                                                            <td>
                                                                                <input
                                                                                    type="number"
                                                                                    name="quantity"
                                                                                    className="form-control"
                                                                                    value={o.itemquantity}
                                                                                    onChange={(e) => handleQuantityChange(e, o.itemId)}
                                                                                    id={`quantity-${o.itemId}`}
                                                                                    required
                                                                                />
                                                                            </td>

                                                                            {/* UNIT */}
                                                                            <td>{o.unit || "-"}</td>

                                                                            {/* PRICE */}
                                                                            <td>
                                                                                <input
                                                                                    type="number"
                                                                                    name="price"
                                                                                    className="form-control"
                                                                                    value={o.price}
                                                                                    onChange={(e) => handlePriceChange(e, o.itemId)}
                                                                                    onBlur={(e) => handlePriceBlur(e, o.itemId)}
                                                                                    id={`price-${o.itemId}`}
                                                                                    required
                                                                                />
                                                                            </td>

                                                                            {/* AMOUNT */}
                                                                            <td>
                                                                                <CurrencySign />
                                                                                {o.amount}
                                                                            </td>




                                                                        </tr>
                                                                    ))}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {/* Warning Message */}
                                                    {itemExistsMessage && (
                                                        <div className="alert alert-warning mt-3" role="alert">
                                                            {itemExistsMessage}
                                                        </div>
                                                    )}
                                                </div>


                                                {/* Subtotal, Discount, and Total */}
                                                <div className="row pt-3">
                                                    <div className="col-7">
                                                        <div className="search-container forms">
                                                            <p className="fs-20 mb-0">Select Item</p>
                                                            <Select
                                                                value={searchitemResults}
                                                                onChange={onChangeitem}
                                                                options={items.map((o) => ({ value: o._id, label: o.itemname }))}
                                                                placeholder=""
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-5">
                                                        <div className="row">
                                                            <div className="col-6">
                                                                <p>Subtotal</p>
                                                                <p className="mb-4">Discount</p>
                                                                <p>GST {estimateData.taxpercentage}%</p>
                                                                <p>Total</p>
                                                            </div>
                                                            <div className="col-6 text-end">
                                                                <p>
                                                                    <CurrencySign />
                                                                    {calculateSubtotal().toLocaleString("en-IN", {})}
                                                                </p>
                                                                <input
                                                                    type="number"
                                                                    name="totaldiscount"
                                                                    className="form-control"
                                                                    value={discountTotal}
                                                                    onChange={handleDiscountChange}
                                                                    placeholder="Enter Discount Total"
                                                                    id="discountInput"
                                                                    min="0"
                                                                />
                                                                <p>
                                                                    <CurrencySign />
                                                                    {calculateTaxAmount().toLocaleString("en-IN", {})}
                                                                </p>
                                                                <p>
                                                                    <CurrencySign />
                                                                    {calculateTotal().toLocaleString("en-IN", {})}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='row'>
                                                    <label htmlFor="" className='fs-4 ms-2 mt-5'>Note</label>
                                                    <div className='box1 rounded adminborder m-2'>
                                                        <CKEditor
                                                            editor={ClassicEditor}
                                                            data={estimateData.information}
                                                            // onReady={ editor => {
                                                            //     console.log( 'Editor is ready to use!', editor );
                                                            // } }

                                                            onChange={handleEditorChange}
                                                            config={{
                                                                extraPlugins: [MyCustomUploadAdapterPlugin],
                                                            }}
                                                            onBlur={(event, editor) => {
                                                                console.log('Blur.', editor);
                                                            }}
                                                            onFocus={(event, editor) => {
                                                                console.log('Focus.', editor);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-lg-3 col-12 order-1 order-lg-2">
                                            <div className='box1 rounded adminborder p-4 my-2 mx-0 mb-5'>
                                                <div className="form-check form-switch">
                                                    <div>
                                                        <label className="form-check-label" htmlFor="signatureSwitch">Signature</label>
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            role="switch"
                                                            id="signatureSwitch"
                                                            onChange={handleSignatureSwitch}
                                                            checked={hasSignature}
                                                        />
                                                    </div>
                                                    {hasSignature && (
                                                        <>
                                                            <div>
                                                                <label className="form-check-label" htmlFor="addSignatureSwitch">Add My Signature</label>
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    role="switch"
                                                                    id="addSignatureSwitch"
                                                                    checked={isAddSignatureSwitchOn}
                                                                    onChange={handleAddSignatureSwitch}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="form-check-label" htmlFor="customerSignSwitch">Customer to Sign</label>
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    role="switch"
                                                                    id="customerSignSwitch"
                                                                    checked={isCustomerSignSwitchOn}
                                                                    onChange={handleCustomerSignSwitch}
                                                                />
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {isSignatureModalOpen && (
                                                <SignatureModal
                                                    onSave={saveSignature}
                                                    onClose={() => setIsSignatureModalOpen(false)}
                                                />
                                            )}
                                        </div>
                                    </div>


                                    {/* </form> */}
                                </div>
                            </div>
                        </div>
                    </div>
            }
        </div>
    )
}
